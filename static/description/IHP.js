/* ========================================================
   Integrated Human Practices —— 页面增量脚本层
   ========================================================

   本文件是 description.js 的“附加层”，不复制、不覆写其中的任何逻辑。
   页面上仍按原顺序加载 description.js，本文件在其之后加载即可
   （两个 script 都带 defer，按文档顺序执行，因此这里运行时
   侧边目录 TOC 已经由 description.js 构建完毕）。

   功能：正文中的 <e></e> 标签
   ------------------------------------------------------
   在 HTML 里把一段文字包进 <e></e>，即可：
       · 正文中 —— 正常显示（样式见 IHP.css 第 1 节）；
       · 侧边栏目录中 —— 不显示。

   实现方式（第 1 节）：description.js 用 heading.textContent 生成目录
   文字，所以只要在目录项生成后，把其中的 <e> 节点整个删掉即可。
   用 MutationObserver 监听 #tocNav，既能覆盖 description.js 的首次
   构建，也能覆盖窗口变宽 / 其它脚本重建目录的情况。

   注意：正文里的 <e></e> 一个都不会被改动，只在“克隆出来的节点”
   上做剔除，因此正文永远照常显示。
   ======================================================== */
(function () {
    'use strict';

    /* 隐藏标记标签：<e></e>（HTML 标签名大小写不敏感，<e> / <E> 都行） */
    var HIDE_TAG = 'e';
    /* 供 processToc() 判断“这一项已经清理过”的标记 */
    var PROCESSED_FLAG = 'ihpEProcessed';
    /* 兼容 :scope 尚未普及的环境（老 Safari / 老 Edge） */
    var matches = function (el, selector) {
        var fn = el.matches || el.msMatchesSelector || el.webkitMatchesSelector;
        return fn ? fn.call(el, selector) : false;
    };

    /* ------------------------------------------------------
       1. 侧边目录（TOC）：剔除 <e></e> 内的文字
       ------------------------------------------------------ */

    /* 只保留“正文可见文字”，<e></e> 及其内容整段丢弃。
       在克隆节点上操作，绝不影响正文 DOM。 */
    function visibleTextOnly(source) {
        if (!source) return '';
        if (!source.querySelector(HIDE_TAG)) return source.textContent || '';

        var clone = source.cloneNode(true);
        Array.prototype.forEach.call(clone.querySelectorAll(HIDE_TAG), function (node) {
            if (node.parentNode) node.parentNode.removeChild(node);
        });
        return clone.textContent || '';
    }

    /* 把目录项里所有 <e></e> 删掉，并把每个 .toc-text 的文字重设为
       “正文可见文字”，保证目录文字与正文严格一致。 */
    function cleanTocItem(item) {
        Array.prototype.forEach.call(item.querySelectorAll(HIDE_TAG), function (hit) {
            if (hit.parentNode) hit.parentNode.removeChild(hit);
        });

        // 目录文字来自 heading.textContent，可能整体都写在 <e></e> 里，
        // 上面的删除已把它拿掉；这里再按 data-target 对应的标题重算一次，
        // 兜住“目录项被其它脚本重建”的情况。
        var targetId = item.getAttribute('data-target');
        var heading = targetId ? document.getElementById(targetId) : null;
        if (!heading) return;

        // 末尾 trim：删掉 <e></e> 后可能残留一个首尾空白（例如
        // "<h2>标题 <e>隐藏</e></h2>"），description.js 原本是用
        // textContent.trim() 生成目录文字的，这里保持一致。
        // 正文 DOM 不受影响，只改克隆出来的目录文字。
        var label = visibleTextOnly(heading).trim();

        Array.prototype.forEach.call(item.querySelectorAll('.toc-text'), function (el) {
            if (el.textContent !== label) el.textContent = label;
        });

        if (item.title !== label) item.title = label;
    }

    /* 目录项清理后若已无任何可见文字，就把这一项从侧边栏移除：
       否则会留下一个没有文字、却仍可点击的空白条目。
       （该标题仍在正文里，锚点 / 滚动高亮逻辑都不受影响。） */
    function collapseIfEmpty(item) {
        var texts = item.querySelectorAll('.toc-text');
        if (!texts.length) return;

        var isEmpty = true;
        Array.prototype.forEach.call(texts, function (el) {
            if ((el.textContent || '').trim() !== '') isEmpty = false;
        });

        if (isEmpty && item.parentNode) item.parentNode.removeChild(item);
    }

    function processToc(nav) {
        if (!nav) return;
        Array.prototype.forEach.call(nav.querySelectorAll('.toc-item'), function (item) {
            if (item[PROCESSED_FLAG]) return;
            // description.js 分两步填充目录项（先 append，再写 textContent），
            // 若此刻还没填好，就留给下一次 MutationObserver 回调处理。
            if (!item.querySelector('.toc-text')) return;

            item[PROCESSED_FLAG] = true;
            cleanTocItem(item);
            collapseIfEmpty(item);
        });
    }

    /* 只要新增节点落在某个 .toc-item 里，就认为目录需要再清理一遍 */
    function hasTocItem(node) {
        if (!node || node.nodeType !== 1) return false;
        if (matches(node, '.toc-item')) return true;
        return !!(node.querySelector && node.querySelector('.toc-item'));
    }

    /* ------------------------------------------------------
       2. 标题排版兜底
       ------------------------------------------------------
       description.css 把 .heading-* 设成了 display: flex，flex 会把直接
       子元素块化：写在标题里的 <e> 会从行内变成块级，导致
       "标题前半 <e>隐藏段</e>" 这样的标题在正文里断成左右两栏。
       IHP.css 第 2 节用 :has(e) + display: contents 解决这个问题；
       这里再给含 <e> 的标题补一个 .ihp-has-e 类，作为不支持 :has()
       的旧浏览器（Firefox < 121 等）的等价兜底。 */
    var HEADING_SELECTOR = '.heading-1, .heading-2, .heading-3, .heading-reference';
    var FLEX_FALLBACK_CLASS = 'ihp-has-e';

    function markHeadingsWithTag() {
        var headings = document.querySelectorAll(HEADING_SELECTOR);
        Array.prototype.forEach.call(headings, function (heading) {
            var hasTag = !!heading.querySelector(HIDE_TAG);
            if (hasTag === heading.classList.contains(FLEX_FALLBACK_CLASS)) return;
            heading.classList.toggle(FLEX_FALLBACK_CLASS, hasTag);
        });
    }

    function initTocObserver() {
        var nav = document.getElementById('tocNav');

        // 标题排版兜底与 TOC 无关，即使页面上没有目录也要执行
        markHeadingsWithTag();

        if (!nav) return;

        // 先处理一次：脚本若在目录构建之后才执行（例如动态插入），这里直接生效
        processToc(nav);

        // 再监听：覆盖 description.js 的首次构建与后续任何重建
        if (typeof MutationObserver === 'function') {
            new MutationObserver(function (records) {
                markHeadingsWithTag();
                for (var i = 0; i < records.length; i++) {
                    var added = records[i].addedNodes;
                    for (var j = 0; j < added.length; j++) {
                        if (hasTocItem(added[j])) {
                            processToc(nav);
                            return;
                        }
                    }
                }
            }).observe(nav, { childList: true, subtree: true });
        }
    }

    /* ------------------------------------------------------
       3. 启动
       ------------------------------------------------------
       defer 脚本执行时 DOM 已可解析；这里仍按 readyState 判断一次，
       是为了让本文件被改成普通 <script> 时也能正常工作。 */
    function start() {
        initTocObserver();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    /* 只读调试接口：例如在控制台执行
       __IHP__.sidebarLabel(document.querySelector('.heading-2'))
       即可看到该标题在侧边栏里会显示成什么。 */
    window.__IHP__ = {
        sidebarLabel: function (heading) {
            return visibleTextOnly(heading).trim();
        },
        refreshToc: function () {
            var nav = document.getElementById('tocNav');
            if (!nav) return 0;
            Array.prototype.forEach.call(nav.querySelectorAll('.toc-item'), function (item) {
                item[PROCESSED_FLAG] = false;
            });
            processToc(nav);
            return nav.querySelectorAll('.toc-item').length;
        }
    };
})();
