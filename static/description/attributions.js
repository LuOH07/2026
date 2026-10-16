/* ========================================================
   attributions 页面脚本覆盖层
   ========================================================
   description.js 继续负责这个页面的全部行为：首屏透视网格、侧边目录构建与
   滚动跟随、剑 / 剑鞘 / BACK TO TOP、正文表格标记、upfold 组件等；本文件只
   补它没有的一件事 —— 正文里那份引用进来的 iGEM Attribution Form（<iframe>）
   的【高度】跟随内容变化。

   引用顺序（attributions.html 的 page_scripts 块）：
       description.js      先加载
       attributions.js     后加载 —— 本文件（同为 defer，按文档顺序执行）

   另外两处页面差异（隐藏侧边栏、正文左右各 4%）都是纯样式，
   由 attributions.css 覆盖，这里不重复。

   description.css / description.js 两个原文件不做任何改动。
   ======================================================== */

/* ========================================================
   2. iGEM Attribution Form：高度跟随内容
   ========================================================
   宽度由 attributions.css 第 3 节定死（与正文段落对齐），这里只管高度。

   2.1 为什么不能直接量：这个表单来自 teams.igem.org，与本站不同源，
   读它的 contentDocument.body.scrollHeight 会被浏览器拦掉。所以高度只能
   由【对端主动上报】：平台的表单在内容尺寸变化时往父页面 postMessage。
   本条逻辑就是原先写在 attributions.html 里的那段内联脚本，搬到这里并
   做了三处加固（见 2.2）。

   上报协议：
       event.origin === 'https://teams.igem.org'
       JSON.parse(event.data).type === 'igem-attribution-form'
       JSON.parse(event.data).data  = 表单自身内容高度（px）

   2.2 相比原内联写法的三处加固：
     ① 取数先判断类型：原写法直接 `${data + 100}`，若对端偶尔发来字符串
        或带单位的写法，会拼出 "900px..." 之类的无效高度；这里先 Number()
        再回落。
     ② 兜底高度：原写法只依赖对端上报，平台若一直没发消息，iframe 就停在
        浏览器默认的 150px，表单被压成一条、内部出现滚动条。现在
        load 之后按 1.2s / 2.5s / 5s 复查三次，仍未拿到上报值就按视口高度
        的 70% 给一个够用的兜底，之后平台一旦上报就以它为准。
     ③ 只加不减到兜底线以下：始终取 Math.max(上报值, 兜底线)，
        内容变高时跟着长（不截断），内容变矮时也不会缩成细条。

   2.3 平台上报的数值含义：data 是表单【内容】高度，原内联脚本额外 +100px
   当留白。这里沿用同样的 +100px，保持与原来一致的观感；若日后发现底部
   多出一截空白，把 FORM_PADDING 改小即可。
   ======================================================== */
(function () {
    'use strict';

    var IFRAME_ID = 'igem-attribution-form';
    var FORM_ORIGIN = 'https://teams.igem.org';
    var MESSAGE_TYPE = 'igem-attribution-form';
    var FORM_PADDING = 100;          /* 内容高度之外补的留白（px），与原内联脚本一致 */
    var FALLBACK_RATIO = 0.7;        /* 拿不到上报值时，按视口高度的这个比例给高度 */
    /* 复查时点（ms）：网络慢时平台可能几秒后才首次上报 */
    var RETRY_DELAYS = [1200, 2500, 5000];

    function initAttributionFormSize() {
        var iframe = document.getElementById(IFRAME_ID);
        if (!iframe) return;

        var reportedHeight = 0;      /* 平台上报的内容高度；0 = 还没拿到 */
        var done = false;            /* 已按真实上报值定高，可以收摊了 */
        var timers = [];

        function fallbackHeight() {
            var viewport = window.innerHeight || document.documentElement.clientHeight || 800;
            return viewport * FALLBACK_RATIO;
        }

        /* 把高度写进 iframe：上报值优先，但不低于兜底高度 */
        function applyHeight() {
            var target = reportedHeight ? reportedHeight + FORM_PADDING : fallbackHeight();
            iframe.style.height = Math.max(target, fallbackHeight()) + 'px';
        }

        function onMessage(event) {
            // 只认这个平台的来源；其它来源（含本站自己的消息）一律忽略
            if (event.origin !== FORM_ORIGIN) return;

            var payload;
            try {
                payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            } catch (err) {
                return;              // 不是 JSON，忽略；绝不能让它抛出去影响后面的消息
            }
            if (!payload || payload.type !== MESSAGE_TYPE) return;

            var height = Number(payload.data);
            if (!isFinite(height) || height <= 0) return;

            reportedHeight = height;
            done = true;
            applyHeight();
            stopTimers();
        }

        function stopTimers() {
            for (var i = 0; i < timers.length; i++) window.clearTimeout(timers[i]);
            timers = [];
        }

        window.addEventListener('message', onMessage);

        /* iframe 载入完成后先把兜底高度写上，避免停在浏览器默认的 150px */
        iframe.addEventListener('load', function () {
            if (!reportedHeight) applyHeight();
        });

        /* 复查：平台若一直没上报，到点就用兜底高度；已上报则不再打扰 */
        RETRY_DELAYS.forEach(function (delay) {
            timers.push(window.setTimeout(function () {
                if (done) return;
                applyHeight();
            }, delay));
        });

        /* 视口变化时重算（兜底高度按视口算；已拿到上报值则只需重新套用） */
        window.addEventListener('resize', function () {
            if (!done) applyHeight();
        }, { passive: true });

        // 首屏先给一个高度，别等 load
        applyHeight();
    }

    /* defer 脚本执行时 DOM 已可解析；这里仍按 readyState 判断一次，
       是为了本文件被改成普通 <script> 时也能正常工作。 */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAttributionFormSize);
    } else {
        initAttributionFormSize();
    }

    /* 只读调试接口：控制台执行 __ATTRIBUTIONS__ 可确认 description.js 是否已执行
       （它会在 window 上留下 __IHP__ / __TABLES__ / __HEADING_SUB__ 等接口）。 */
    window.__ATTRIBUTIONS__ = {
        descriptionJsLoaded: !!(window.__IHP__ || window.__TABLES__ || window.__HEADING_SUB__),
        note: 'iframe 宽度见 attributions.css 第 3 节；高度由本文件第 2 节跟随内容。'
    };
})();
