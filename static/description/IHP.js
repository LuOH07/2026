/* ============================================================
   IHP.js —— human-practices.html（IHP 页面）专属脚本
   ============================================================
   只负责首屏标题区里那句 HP 补充文案 .hero-hp-note 的两个行为，
   外观全部在 IHP.css 里：

   1) 入场：给 <html> 打上 .ihp-js（CSS 据此才隐藏初始状态），
      等页面 load 完再把 .is-revealed 加上，让这句文案跟首屏标题
      一起淡入。JS 没跑起来时文案本来就是可见的，不会留白。
   2) 防压字：桌面端这句文案是绝对定位块的延伸，视口特别矮时可能
      压到下方的 SCROLL TO EXPLORE。这里量一次两者的间距，真的会
      重叠才加 .is-compact（CSS 里把字号收一档），并留出安全间隔。

   字号、颜色、链接样式一律不在 JS 里写，改观感请改 IHP.css。
   ============================================================ */
(function () {
    'use strict';

    const NOTE_SELECTOR = '.title-header-wrapper .hero-hp-note';
    const CUE_SELECTOR = '.title-header-wrapper .scroll-explore-wrapper';

    /* 与 SCROLL TO EXPLORE 之间希望保留的安全间距（px） */
    const SAFE_GAP = 16;

    /* 等 load 之后再淡入：全站加载动画先播，文案跟着首屏标题出现 */
    const REVEAL_DELAY = 120;
    /* load 事件万一没来（图片卡住等），兜底也要显示出来 */
    const REVEAL_FALLBACK = 2500;

    const root = document.documentElement;
    const note = document.querySelector(NOTE_SELECTOR);

    if (!note) return;

    /* 先声明“样式由 JS 接管”，CSS 才会把初始状态设为透明 */
    root.classList.add('ihp-js');

    function reveal() {
        note.classList.add('is-revealed');
    }

    /* 只在文案真的会压到 SCROLL TO EXPLORE 时才收字号。
       移动端（≤1024px）这条指引是 display:none，rect 高度为 0，直接跳过。 */
    function fit() {
        const cue = document.querySelector(CUE_SELECTOR);
        note.classList.remove('is-compact');

        if (!cue) return;

        const cueRect = cue.getBoundingClientRect();
        if (!cueRect.height) return;

        const overlap = note.getBoundingClientRect().bottom + SAFE_GAP > cueRect.top;
        if (overlap) note.classList.add('is-compact');
    }

    /* 尺寸变化：用 rAF 合并连续 resize，避免每帧都算布局 */
    let frame = 0;
    function scheduleFit() {
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
            frame = 0;
            fit();
        });
    }

    if (document.readyState === 'complete') {
        window.setTimeout(reveal, REVEAL_DELAY);
    } else {
        window.addEventListener('load', function () {
            window.setTimeout(reveal, REVEAL_DELAY);
        }, { once: true });
        window.setTimeout(reveal, REVEAL_FALLBACK);
    }

    /* 首屏标题图 / 字体都会改变这块的高度，等它们就位后再量一次 */
    fit();
    window.addEventListener('resize', scheduleFit, { passive: true });
    window.addEventListener('orientationchange', scheduleFit, { passive: true });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(scheduleFit).catch(function () {});
    }

    /* 首屏大图加载完成后高度才算准 */
    window.addEventListener('load', scheduleFit, { once: true });
}());
