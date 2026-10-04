/* =============================================================================
   head_foot.js —— 页眉页脚交互（仅移动端生效，桌面端不做任何改动）
   -----------------------------------------------------------------------------
   右上角悬浮弹窗的三态循环：
     第 1 次点汉堡 → 弹窗展开，只显示大标题
     第 2 次点汉堡 → 在同一弹窗内展开小标题（二级菜单）
     第 3 次点汉堡 → 整个弹窗收起（同时解锁 body 滚动）
   汉堡 → × 的形变动画由 head_foot.css 的 .nav-toggle:has(input:checked) 驱动，
   这里只维护 .nav-toggle 上的 data-stage（0 / 1 / 2）作为三态状态源。
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

        function setStage(value) {
            if (toggleLabel && toggleLabel.setAttribute) {
                toggleLabel.setAttribute('data-stage', String(value));
            }
        }

        /* ---------- 三态状态机 ----------
           open     : 弹窗是否展开（对应 checkbox 勾选 → CSS 显示弹窗、汉堡变 ×）
           submenu  : 是否已进入第 2 态（对应 data-stage="2" → CSS 展开小标题）
           两者都由本脚本维护，不再依赖 label 的默认勾选行为。 */
        var open    = !!toggle.checked;
        var submenu = false;

        function applyState() {
            toggle.checked = open;
            setStage(open ? (submenu ? 2 : 1) : 0);
            if (!open) {
                submenu = false;
                collapseAll();
            }
            syncScrollLock();
        }

        function closeMenu() {
            open = false;
            submenu = false;
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

        /* ---------- 汉堡按钮：三态循环 ----------
           关键点：checkbox 位于 label 内部，点击汉堡后 label 的“激活行为”会自行翻转
           checkbox，并向 input 再派发一次 click；正是这次翻转会把脚本刚写入的状态改回去
           （第二次点击看起来像被“吃掉”）。因此这里在冒泡到 label 的第一发事件上
           preventDefault 取消默认翻转，改由脚本按阶段驱动 checkbox：
             第 1 次 → 展开弹窗，只显示大标题
             第 2 次 → 同一弹窗内展开小标题
             第 3 次 → 整体收起 */
        toggleLabel.addEventListener('click', function (event) {
            if (!isMobile()) return;        /* 桌面端不介入，保持原有悬停菜单 */

            event.preventDefault();         /* 取消 label 激活行为，state 由脚本维护 */

            if (!open) {                    /* 第 1 次点击：展开弹窗 */
                open = true;
                submenu = false;
            } else if (!submenu) {          /* 第 2 次点击：展开小标题 */
                submenu = true;
            } else {                        /* 第 3 次点击：整体收起 */
                open = false;
                submenu = false;
            }

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

                link.addEventListener('click', function (event) {
                    if (!isMobile()) return;     /* 桌面端保持原链接行为 */
                    event.preventDefault();
                    var willOpen = !item.classList.contains('is-expanded');
                    collapseAll();
                    if (willOpen) {
                        item.classList.add('is-expanded');
                    } else if (submenu) {
                        submenu = false;         /* 收回小标题，回到只看大标题的第 1 态 */
                        applyState();
                    }
                });
            })(navItems[i]);
        }

        /* ---------- checkbox 状态被外部改动时同步状态机 ---------- */
        toggle.addEventListener('change', function () {
            var checked = !!toggle.checked;
            if (checked === open) return;        /* 脚本自身写入的状态，无需处理 */
            open = checked;
            if (!open) submenu = false;
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
