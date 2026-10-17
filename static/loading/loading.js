/* =============================================================================
   loading.js —— 全屏加载动画控制（视频：static/loading/loading.mp4）
   -----------------------------------------------------------------------------
   播放规则由 wiki/layout.html 渲染在 <html> 的两个属性上：
     · data-loading-plays="n"：至少完整播放 n 遍；Home 为 0，脚本直接返回；
     · data-loading-wait="1"：加载较慢的页面（Members、Attributions）使用。
       播完最少遍数后如果页面还没加载完，就一直循环播放，直到「页面全部加载完
       且当前这一遍播完」再淡出遮罩 —— 不会把动画截断在半路。
       页面加载完 = load 事件已触发（readyState === 'complete'）、没有仍在加载的
       <img>、字体已就绪。
   脚本在 <head> 中同步执行，先给 <html> 加 .is-loading，让白底遮罩先于正文出现；
   结束后淡出遮罩、移除节点并解锁滚动，页面恢复浏览。
   兜底：视频加载失败、浏览器拒绝自动播放 → 立即结束遮罩；每遍都有计时看门狗；
   data-loading-wait 的页面另有 120 秒绝对上限，避免第三方 iframe 迟迟不响应时
   永久白屏。
   ============================================================================= */
(function () {
    'use strict';

    var FADE_MS = 450;
    /* 绝对上限：等加载的页面最多遮住 120 秒，之后无论是否加载完都放出页面。 */
    var WAIT_LIMIT_MS = 120000;

    var root        = document.documentElement;
    var total       = parseInt(root.getAttribute('data-loading-plays'), 10) || 0;
    var waitForLoad = root.getAttribute('data-loading-wait') === '1';
    var overlay     = null;
    var video       = null;
    var played      = 0;
    var finished    = false;
    var watchdog    = null;
    var waitLimit   = null;
    var reduceMotion = !!(window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    /* Home 不播放：遮罩根本没有渲染，连 class 都不用加。 */
    if (total <= 0) return;

    root.classList.add('is-loading');

    /* ---------- 页面是否已经全部加载完 ---------- */

    /* 图片是这张页面最重、最晚完成的部分：包括模板里直接写死的和脚本后来
       插入的 <img>（例如成员卡片的悬停照片）。出错（complete 但无像素）的
       图片不会让页面永远等下去；懒加载图片在没进视口前永远不会 complete，
       也不能等，否则遮罩会一直留着。 */
    function imagesSettled() {
        var images = document.images;
        for (var i = 0; i < images.length; i += 1) {
            if (images[i].loading === 'lazy') continue;
            if (!images[i].complete) return false;
        }
        return true;
    }

    function fontsSettled() {
        var fonts = document.fonts;
        return !fonts || fonts.status !== 'loading';
    }

    function pageLoaded() {
        return document.readyState === 'complete' &&
            imagesSettled() && fontsSettled();
    }

    /* 每到一遍播完时检查一次：不等加载的页面只要遍数够了就结束；
       等加载的页面还要求页面已经全部加载完。 */
    function canFinish() {
        if (played < total) return false;
        return !waitForLoad || pageLoaded();
    }

    /* ---------- 结束：恢复页面 ---------- */

    function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(watchdog);
        clearTimeout(waitLimit);

        root.classList.remove('is-loading');     /* 正文恢复可见，解锁滚动 */
        if (!overlay) return;

        if (video) {
            try { video.pause(); } catch (e) { /* 忽略 */ }
        }

        overlay.classList.add('is-fading');

        function remove() {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }

        if (reduceMotion) remove();
        else setTimeout(remove, FADE_MS + 100);
    }

    /* ---------- 播放：一遍播完接着播下一遍 ---------- */

    /* 每遍单独计时兜底：视频卡住（网络中断、解码失败却没触发 error）也能继续。
       页面已加载完就直接收尾；还在等加载就重新起播，别让遮罩定格在某一帧。 */
    function armWatchdog() {
        clearTimeout(watchdog);
        if (finished) return;

        var duration = video.duration;
        var limit = (isFinite(duration) && duration > 0 ? duration * 1.5 + 8 : 30) * 1000;

        watchdog = setTimeout(function () {
            if (finished) return;
            if (canFinish()) finish();
            else playOnce();
        }, limit);
    }

    function playOnce() {
        if (finished) return;

        played += 1;
        try { video.currentTime = 0; } catch (e) { /* 元数据未就绪，忽略 */ }
        armWatchdog();

        var result = video.play();
        if (result && typeof result.then === 'function') {
            result.catch(function () {
                /* 自动播放被拦截：立刻结束遮罩，不留白屏。 */
                finish();
            });
        }
    }

    function onEnded() {
        clearTimeout(watchdog);
        if (finished) return;

        if (canFinish()) finish();
        else playOnce();
    }

    /* ---------- 初始化 ---------- */

    function setup() {
        overlay = document.getElementById('loading');
        video   = document.getElementById('loading-video');
        if (!overlay || !video) { finish(); return; }

        overlay.classList.add('is-active');

        /* 静音 + 内联播放，才能通过浏览器（尤其移动端）的自动播放策略。 */
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('muted', '');

        video.addEventListener('ended', onEnded);
        video.addEventListener('error', finish);
        video.addEventListener('stalled', armWatchdog);

        if (waitForLoad) waitLimit = setTimeout(finish, WAIT_LIMIT_MS);

        playOnce();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
}());
