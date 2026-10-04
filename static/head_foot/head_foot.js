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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
