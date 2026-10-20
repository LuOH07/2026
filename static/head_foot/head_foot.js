/* =============================================================================
   head_foot.js —— 页眉页脚交互（仅移动端生效，桌面端不做任何改动）
   -----------------------------------------------------------------------------
   右上角悬浮弹窗：
     点汉堡           → 弹窗展开，大标题（一级菜单）自上而下逐行排列
     再点一次汉堡     → 整个弹窗收起
     点某一行大标题   → 在该行下方展开它的小标题；再点这一行收起
   汉堡 → × 的形变动画由 head_foot.css 的 .nav-toggle:has(input:checked) 驱动：
   脚本只负责维护 checkbox（弹窗开 / 关）与每行的 .is-expanded（该项小标题开 / 关）。
   ============================================================================= */
(function () {
    'use strict';

    var MOBILE_QUERY = '(max-width: 1024px)';

    function init() {
        var toggle      = document.getElementById('nav-toggle');
        var nav         = document.getElementById('site-nav');
        if (!toggle || !nav) return;

        var toggleLabel = document.querySelector('.nav-toggle') || toggle.parentNode;
        var backdrop    = document.querySelector('.nav-backdrop');
        var mobileQuery = window.matchMedia ? window.matchMedia(MOBILE_QUERY) : null;
        var navItems    = nav.querySelectorAll('.nav-item');

        /* ---------- 基础工具 ---------- */

        function isMobile() {
            return mobileQuery ? mobileQuery.matches : true;
        }

        function collapseAll() {
            for (var i = 0; i < navItems.length; i++) navItems[i].classList.remove('is-expanded');
        }

        function syncScrollLock() {
            document.body.classList.toggle('menu-open', !!toggle.checked);
        }

        /* ---------- 弹窗开 / 关 ----------
           open 与 checkbox 勾选状态一一对应（CSS 据此显示弹窗、汉堡变 ×）。
           点击汉堡时在冒泡到 label 的第一发事件上 preventDefault，取消 label 的默认
           翻转行为，改由脚本统一维护，避免“勾选被立即改回”导致的状态错乱。 */
        var open = !!toggle.checked;

        function applyState() {
            toggle.checked = open;
            if (!open) collapseAll();      /* 收起弹窗时把已展开的小标题一并收回 */
            syncScrollLock();
        }

        function closeMenu() {
            open = false;
            applyState();
        }

        applyState();   /* 页面加载时同步一次（含浏览器前进/后退时的表单状态还原） */

        /* ---------- 遮罩（点空白处收起；页眉与汉堡按钮在遮罩之上，保持可点） ---------- */
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'nav-backdrop';
            document.body.appendChild(backdrop);
        }
        backdrop.addEventListener('click', function () {
            if (!isMobile()) return;
            closeMenu();
        });

        /* ---------- 汉堡按钮：弹窗开 / 关 ---------- */
        toggleLabel.addEventListener('click', function (event) {
            if (!isMobile()) return;        /* 桌面端不介入，保持原有悬停菜单 */

            event.preventDefault();         /* 取消 label 激活行为，勾选状态由脚本维护 */
            open = !open;
            applyState();
        });

        /* ---------- 大标题：选中并在弹窗内展开它的小标题 ---------- */
        for (var i = 0; i < navItems.length; i++) {
            (function (item) {
                var link = item.querySelector(':scope > a.nav-link');
                var menu = item.querySelector(':scope > .dropdown-menu');
                if (!link || !menu) return;      /* 没有二级菜单的大标题（如 HOME）保持跳转 */

                /* 保留原有“返回”按钮结构；弹窗模式下由 CSS 隐藏，再点汉堡即收起 */
                if (!menu.querySelector('.submenu-back')) {
                    var back = document.createElement('button');
                    back.type = 'button';
                    back.className = 'submenu-back';
                    back.innerHTML = '<i></i>Back';
                    back.addEventListener('click', function (event) {
                        event.preventDefault();
                        item.classList.remove('is-expanded');
                    });
                    menu.insertBefore(back, menu.firstChild);
                }

                /* 点这一行大标题：展开它的小标题；再点这一行收起（只影响本行） */
                link.addEventListener('click', function (event) {
                    if (!isMobile()) return;     /* 桌面端保持原链接行为 */
                    event.preventDefault();
                    item.classList.toggle('is-expanded');
                });
            })(navItems[i]);
        }

        /* ---------- checkbox 状态被外部改动时同步（如浏览器还原表单状态） ---------- */
        toggle.addEventListener('change', function () {
            var checked = !!toggle.checked;
            if (checked === open) return;        /* 脚本自身写入的状态，无需处理 */
            open = checked;
            applyState();
        });

        /* ---------- 视口回到桌面尺寸时复位（不影响桌面端样式） ---------- */
        function reset() {
            if (!isMobile() && open) closeMenu();
        }
        if (mobileQuery) {
            if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', reset);
            else if (mobileQuery.addListener) mobileQuery.addListener(reset);
        }
        window.addEventListener('resize', reset);
        window.addEventListener('orientationchange', reset);

        alignHeroDecor();
        if (mobileQuery) {
            if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', alignHeroDecor);
            else if (mobileQuery.addListener) mobileQuery.addListener(alignHeroDecor);
        }
        window.addEventListener('resize', alignHeroDecor);
        window.addEventListener('orientationchange', alignHeroDecor);
        window.addEventListener('load', alignHeroDecor);
    }

    /* =========================================================================
       内容页首屏装饰对齐（仅窄屏，<= 820px）
       把右上蛋白贴到“下方介绍文字”的右上角、右下 DNA 贴到它的右下角，
       左侧 DNA 对齐“中心大标题 + 介绍文字”整体的竖直中心。
       CSS 里给的是按屏宽估算的锚点，这里用文字的真实外框再修正一次，
       因此换机型、换文案都仍然贴合；只记录一次初始位置并施加固定偏移，
       重复触发（resize / orientationchange / load）不会叠加漂移。
       ========================================================================= */
    function alignHeroDecor() {
        if (!window.matchMedia || !window.matchMedia('(max-width: 820px)').matches) return;

        var text = document.querySelector('.center-description-text') ||
                   document.querySelector('.center-description-wrapper');
        var protein = document.querySelector('.right-protein-wrapper');
        var dnaBR = document.querySelector('.bottom-right-dna-wrapper');
        var leftDna = document.querySelector('.left-dna-wrapper');
        var titleBox = document.querySelector('.center-image-wrapper') ||
                       document.querySelector('.title-header-wrapper .title-image');
        if (!text || !protein || !dnaBR) return;

        var t = text.getBoundingClientRect();
        var hero = document.querySelector('.title-header-wrapper');
        var heroTop = hero ? hero.getBoundingClientRect().top : 0;

        /* 右上蛋白：右边缘对齐文字右边界，上边缘对齐文字顶边 */
        protein.style.right = 'auto';
        protein.style.bottom = 'auto';
        protein.style.left = Math.round(t.right - protein.offsetWidth) + 'px';
        protein.style.top = Math.round(t.top - heroTop) + 'px';

        /* 右下 DNA：右边缘对齐文字右边界，下边缘对齐文字底边 */
        dnaBR.style.right = 'auto';
        dnaBR.style.bottom = 'auto';
        dnaBR.style.left = Math.round(t.right - dnaBR.offsetWidth) + 'px';
        dnaBR.style.top = Math.round(t.bottom - heroTop - dnaBR.offsetHeight) + 'px';

        /* 左侧 DNA：竖直居中于“中心大标题 + 下方介绍文字”整体
           注意该元素带 scale(2.5) 变换，必须用实测高度（含缩放）计算半高 */
        if (leftDna && titleBox) {
            var ti = titleBox.getBoundingClientRect();
            var targetCenter = (ti.top + t.bottom) / 2;
            var half = (leftDna.getBoundingClientRect().height || leftDna.offsetHeight) / 2;
            leftDna.style.top = Math.round((targetCenter - heroTop) - half) + 'px';
        }
    }

    /* =========================================================================
       页脚社交图标（桌面端与移动端都生效）
       -------------------------------------------------------------------------
       五个图标的跳转由 <a href> 本身完成，脚本只处理 WeChat：
       微信没有可直接打开的网页，所以它的链接指向公众号二维码图片，
       这里把点击改成页内弹窗（扫码 / 长按识别），Esc、关闭按钮、点遮罩都可收起。
       按住 Ctrl / Cmd / Shift 点击或中键点击时不拦截，仍按浏览器默认方式
       在新标签页打开原图（脚本被禁用时同理）。
       ========================================================================= */
    function initFooterSocial() {
        var social  = document.querySelector('.footer-social');
        if (!social) return;

        var trigger = social.querySelector('a[data-qr]');
        if (!trigger) return;

        var qrUrl  = trigger.getAttribute('data-qr') || trigger.getAttribute('href');
        var modal  = null;
        var close  = null;
        var isOpen = false;
        var lastFocus = null;

        /* 首次点击时才建节点：不需要弹窗的页面不产生多余 DOM */
        function build() {
            modal = document.createElement('div');
            modal.className = 'social-qr';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'WeChat QR code');

            var card = document.createElement('div');
            card.className = 'social-qr__card';

            var img = document.createElement('img');
            img.className = 'social-qr__img';
            img.src = qrUrl;
            img.alt = 'WeChat QR code';
            card.appendChild(img);

            var caption = document.createElement('p');
            caption.className = 'social-qr__caption';
            caption.textContent = 'Scan to follow us on WeChat';
            card.appendChild(caption);

            close = document.createElement('button');
            close.type = 'button';
            close.className = 'social-qr__close';
            close.setAttribute('aria-label', 'Close');
            close.innerHTML = '<span aria-hidden="true">\u00D7</span>';
            card.appendChild(close);

            modal.appendChild(card);
            document.body.appendChild(modal);

            modal.addEventListener('click', function (event) {
                if (event.target !== modal) return;   /* 只有点在卡片外才算关闭 */
                hide();
            });
            close.addEventListener('click', hide);
            document.addEventListener('keydown', onKeydown);
        }

        function show() {
            if (!modal) build();
            if (isOpen) return;
            lastFocus = document.activeElement;
            isOpen = true;
            modal.classList.add('is-open');
            close.focus();
        }

        function hide() {
            if (!isOpen) return;
            isOpen = false;
            modal.classList.remove('is-open');
            if (lastFocus && lastFocus.focus) lastFocus.focus();
        }

        function onKeydown(event) {
            if (!isOpen) return;
            if (event.key === 'Escape' || event.key === 'Esc') {
                event.preventDefault();
                hide();
                return;
            }
            /* 弹窗里只有关闭按钮可聚焦：Tab 直接把焦点留在它上面 */
            if (event.key === 'Tab') {
                event.preventDefault();
                close.focus();
            }
        }

        trigger.addEventListener('click', function (event) {
            /* 组合键 / 中键点击：保留浏览器原行为（新标签页打开二维码图片） */
            if (event.defaultPrevented || event.button !== 0 ||
                event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            show();
        });
    }

    function bootstrap() {
        init();
        initFooterSocial();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
