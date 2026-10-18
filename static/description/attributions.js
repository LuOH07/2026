/* ========================================================
   attributions 页面脚本覆盖层
   ========================================================
   description.js 继续负责这个页面的全部行为：首屏透视网格、侧边目录构建与
   滚动跟随、剑 / 剑鞘 / BACK TO TOP、正文表格标记、upfold 组件等；本文件一行
   都不重复。

   引用顺序（attributions.html 的 page_scripts 块）：
       description.js      先加载
       attributions.js     后加载 —— 本文件（同为 defer，按文档顺序执行）

   为什么这里目前没有需要覆盖的逻辑：
   attributions 与 description 两页的差别只有"不显示侧边栏 + 正文左右各 4%"，
   两点都是纯样式，已由 attributions.css 覆盖。description.js 的侧边栏滚动 /
   渐隐逻辑继续正常引用页面里真实存在的
   <aside class="side-container" id="sideContainer"> 节点，只是该节点被 CSS
   隐藏，脚本不做多余读写；若在这个页面把目录构建整个跳过，反而会让后续的滚动
   逻辑提前 return，连带剑 / 剑鞘 / BACK TO TOP 一起失效。

   将来若某处【行为】需要按页面区分，把覆盖逻辑写在这里即可：本文件在
   description.js 之后执行，覆盖同一个全局名、或在同一元素上再挂一个监听都能生效
   （若确实要处理 DOM，注意 defer 脚本执行时 DOMContentLoaded 还没触发，
   写一个 document.addEventListener('DOMContentLoaded', …) 会比 description.js
   的同名回调晚注册、因而晚执行，正好用于收尾覆盖）。 */
(function () {
    'use strict';

    /* 便于在控制台确认两个脚本都到位：
       控制台执行 __ATTRIBUTIONS__ 即可看到 description.js 是否已执行
       （它会在 window 上留下 __IHP__ / __TABLES__ / __HEADING_SUB__ 等接口）。 */
    window.__ATTRIBUTIONS__ = {
        descriptionJsLoaded: !!(window.__IHP__ || window.__TABLES__ || window.__HEADING_SUB__),
        note: 'attributions 页面无脚本层差异；侧边栏隐藏与正文左右各 4% 由 attributions.css 覆盖。'
    };
})();
