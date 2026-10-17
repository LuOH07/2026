/* =============================================================================
   loading.js —— 全屏加载动画控制（视频：static/loading/loading.mp4）
   -----------------------------------------------------------------------------
   播放规则由 wiki/layout.html 在 <html data-loading-plays="…"> 上渲染：
     Home     → 0：不播放（layout 也不渲染遮罩，这里直接返回）；
     Members  → 5：连播五遍；
     其余页面 → 1：播放一遍。
   脚本在 <head> 中同步执行，先给 <html> 加 .is-loading，让白底遮罩先于正文出现；
   播放结束后淡出遮罩、移除节点并解锁滚动，页面恢复浏览。
   任何异常（视频加载失败、浏览器拒绝自动播放）都会立即结束遮罩，不会白屏卡死。
   ============================================================================= */
(function () {
    'use strict';

    var FADE_MS = 450;

    var root      = document.documentElement;
    var total     = parseInt(root.getAttribute('data-loading-plays'), 10) || 0;
    var overlay   = null;
    var video     = null;
    var played    = 0;
    var finished  = false;
    var watchdog  = null;
    var reduceMotion = !!(window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches);

    /* Home 不播放：遮罩根本没有渲染，连 class 都不用加。 */
    if (total <= 0) return;

    root.classList.add('is-loading');

    /* ---------- 结束：恢复页面 ---------- */

    function finish() {
        if (finished) return;
        finished = true;
        clearTimeout(watchdog);

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

    /* 每遍单独计时兜底：视频卡住（网络中断、解码失败却没触发 error）也能恢复页面。 */
    function armWatchdog() {
        clearTimeout(watchdog);

        var duration = video.duration;
        var limit = (isFinite(duration) && duration > 0 ? duration * 1.5 + 8 : 30) * 1000;
        watchdog = setTimeout(finish, limit);
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

        if (played < total) playOnce();
        else finish();
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

        playOnce();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setup);
    } else {
        setup();
    }
}());
