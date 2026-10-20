/* ========================================================
   0. 侧边栏文字工具：首单词首字母大写
   ========================================================
   侧边目录（#tocNav）里每个标题的文字，只把【第一个单词的首字母】改成
   大写，其余字符一个都不动 —— 正文标题本身写没写大写都一样：

       <h2 class="heading-2">the evolution of gene-editing technology</h2>
       正文：the evolution of gene-editing technology   （原样，不动）
       侧边：The evolution of gene-editing technology

   规则细节：
     · 只改第一个“字母”字符，它前面的数字、空格、引号、括号一律跳过
       （"1. the ..." → "1. The ..."、"“better”..." → "“Better”..."）；
     · 只改这一个字母，其余字符一概不动（绝不把整串小写化）：
       首字母本来是大写就原样返回；"mRNA …" → "MRNA …" 里的 R、N 也保持原样；
     · 找不到字母（纯数字 / 纯符号标题）就原样返回。

   ★ 这个函数被【两处】用到，两处必须用同一个 —— 任何一处漏掉，
     另一处都会把文字改回原样（它们在同一个目录项上先后写文字）：
       ① 第 2 节 headingLabel()：首次构建目录项时的文字与 title 提示；
       ② 第 4 节 cleanTocItem()：剔除 <e> 之后按标题重算目录文字。
   正文 DOM 永远不会被这里改动（只改目录项的 .toc-text 文字节点）。
   ======================================================== */
function capitalizeSidebarLabel(text) {
    if (!text) return '';

    for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);

        /* “有大小写之分”的字符：小写化与大写化结果不同的才是字母。
           数字、空格、标点、引号两类结果相同，直接跳过（不算首字母）。 */
        if (ch.toLowerCase() === ch.toUpperCase()) continue;

        var upper = ch.toUpperCase();
        if (upper === ch) return text;          /* 首字母已经是大写：一个字都不用改 */
        return text.slice(0, i) + upper + text.slice(i + 1);
    }

    return text;                                 /* 整串没有字母（纯数字 / 纯符号） */
}

document.addEventListener('DOMContentLoaded', () => {

    /* 移动端断点：1024px —— 与 description.css 第 8 节、以及全站页眉
       head_foot.css / head_foot.js 的移动端断点完全一致。
       （曾经这里是 820px：821~1024px 这段夹缝里本页仍按 PC 布局显示侧边栏，
       而页眉在 ≤1024px 用一条裸 nav 选择器接管了侧边栏里的 #tocNav，
       于是出现“有 sidebar 但没有文字”。两边断点统一后夹缝消失。） */
    const MOBILE_MAX_WIDTH = 1024;
    const mobileViewport = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
    const isMobile = () => mobileViewport.matches;

    const canvas = document.getElementById('gridCanvas');
    if (canvas) {
        const container = document.querySelector('.grid-container');
        const ctx = canvas.getContext('2d');

        function injectLeftDnaImage() {
            if (document.querySelector('.left-dna-wrapper')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'left-dna-wrapper';

            const img = document.createElement('img');
            img.src = 'https://static.igem.wiki/teams/6059/wiki/members/title/dna-1.avif';
            img.alt = 'DNA Structure Left';
            img.className = 'left-dna-image';

            img.onerror = function () {
                this.onerror = null;
                this.src = 'https://placehold.co/260x520/e2ecef/829699?text=DNA_1.png';
            };

            wrapper.appendChild(img);
            container.appendChild(wrapper);
        }

        function injectBottomRightDnaImage() {
            if (document.querySelector('.bottom-right-dna-wrapper')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'bottom-right-dna-wrapper';

            const img = document.createElement('img');
            img.src = 'https://static.igem.wiki/teams/6059/wiki/members/title/dna-2.avif';
            img.alt = 'DNA Structure Bottom Right';
            img.className = 'bottom-right-dna-image';

            img.onerror = function () {
                this.onerror = null;
                this.src = 'https://placehold.co/260x520/e2ecef/829699?text=DNA_2.png';
            };

            wrapper.appendChild(img);
            container.appendChild(wrapper);
        }

        function injectRightProteinImage() {
            if (document.querySelector('.right-protein-wrapper')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'right-protein-wrapper';

            const img = document.createElement('img');
            img.src = 'https://static.igem.wiki/teams/6059/wiki/members/title/protein.avif';
            img.alt = 'Protein Structure Right';
            img.className = 'right-protein-image';

            img.onerror = function () {
                this.onerror = null;
                this.src = 'https://placehold.co/260x260/e2ecef/829699?text=protein.png';
            };

            wrapper.appendChild(img);
            container.appendChild(wrapper);
        }

        function injectCenterImage() {
            if (document.querySelector('.center-image-wrapper')) return;

            const wrapper = document.createElement('div');
            wrapper.className = 'center-image-wrapper';

            const img = document.createElement('img');
            img.src = 'https://static.igem.wiki/teams/6059/wiki/members/title/title.avif';
            img.alt = 'Title';
            img.className = 'title-image';

            img.onerror = function () {
                this.onerror = null;
                this.src = 'https://placehold.co/480x240/ffffff/a5b4b5?text=title.png';
            };

            wrapper.appendChild(img);
            container.appendChild(wrapper);
        }

        function injectTextElements() {
            // 注入中央描述文字
            if (!document.querySelector('.center-description-wrapper')) {
                const descWrapper = document.createElement('div');
                descWrapper.className = 'center-description-wrapper';

                const descP = document.createElement('p');
                descP.className = 'center-description-text';
                descP.innerHTML = 'We are an international team of students, researchers,<br>and innovators exploring the frontiers of bacterial<br>genome engineering through the power of STING.';

                descWrapper.appendChild(descP);
                container.appendChild(descWrapper);
            }

            // 注入底部 SCROLL TO EXPLORE 区域
            if (!document.querySelector('.scroll-explore-wrapper')) {
                const scrollWrapper = document.createElement('div');
                scrollWrapper.className = 'scroll-explore-wrapper';

                const leftLine = document.createElement('span');
                leftLine.className = 'scroll-line';

                const scrollText = document.createElement('span');
                scrollText.className = 'scroll-text';
                scrollText.textContent = 'SCROLL  TO  EXPLORE';

                const rightLine = document.createElement('span');
                rightLine.className = 'scroll-line';

                scrollWrapper.appendChild(leftLine);
                scrollWrapper.appendChild(scrollText);
                scrollWrapper.appendChild(rightLine);
                container.appendChild(scrollWrapper);
            }

            // 注入底部点阵装饰条
            if (!document.querySelector('.bottom-dots-decor')) {
                const dotsDecor = document.createElement('div');
                dotsDecor.className = 'bottom-dots-decor';
                container.appendChild(dotsDecor);
            }
        }

        /* ------------------------------------------------------------------
         * 首屏透视网格
         * PC 端（宽度 > 1024px）与 static/members/title/title.js 完全一致：
         * THEME、CEILING_H_STEPS、WALL_V_STEPS、resizeCanvas、
         * drawInfiniteCeiling、drawInfiniteSideWalls、drawGrid 的取值、
         * 参数顺序与绘制顺序逐行对应，改动 title.js 时这里同步即可。
         * 窄屏几何见 drawNarrowHeroGrid，仅作用于 ≤1024px 的窗口（那时
         * #gridCanvas 已被 description.css 第 8.4 节隐藏）。
         * ------------------------------------------------------------------ */
        const THEME = {
            gridColor: '#A5B4B5',
            lineWidth: 2.4,
        };

        const CEILING_H_STEPS = [0.06, 0.29, 0.51, 0.73];
        const WALL_V_STEPS = [0.035, 0.170, 0.300, 0.425, 0.545, 0.660, 0.770, 0.875];

        function resizeCanvas() {
            const dpr = window.devicePixelRatio || 1;

            // PC 端与 title.js 完全一致：画布尺寸直接取整个窗口视口
            let width = window.innerWidth;
            let height = window.innerHeight;

            // 窄屏首屏高度由移动端贴图撑开，画布改为跟随 #heroWrapper 实测尺寸
            if (window.innerWidth <= MOBILE_MAX_WIDTH) {
                const heroWrapper = document.getElementById('heroWrapper');
                width = Math.max(width, heroWrapper ? heroWrapper.clientWidth : 0);
                height = heroWrapper ? heroWrapper.clientHeight : height;
            }

            canvas.width = width * dpr;
            canvas.height = height * dpr;
            canvas.style.width = width + 'px';
            canvas.style.height = height + 'px';

            ctx.scale(dpr, dpr);
            drawGrid(width, height);
        }

        function drawInfiniteCeiling(ctx, w, h, vpX, vpY, geom) {
            ctx.save();
            ctx.strokeStyle = THEME.gridColor;
            ctx.lineWidth = THEME.lineWidth;
            ctx.lineCap = 'round';

            const { innerTop, cNearX, cFarX } = geom;

            ctx.beginPath();
            ctx.moveTo(cFarX, innerTop);
            ctx.lineTo(w - cFarX, innerTop);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(cNearX, 0);
            ctx.lineTo(cFarX, innerTop);
            ctx.moveTo(w - cNearX, 0);
            ctx.lineTo(w - cFarX, innerTop);
            ctx.stroke();

            CEILING_H_STEPS.forEach((t) => {
                const y = innerTop * t;
                const leftX = cNearX + (cFarX - cNearX) * t;
                const rightX = (w - cNearX) - (cFarX - cNearX) * t;

                ctx.beginPath();
                ctx.moveTo(leftX, y);
                ctx.lineTo(rightX, y);
                ctx.stroke();
            });

            const ceilingSpanNear = w - 2 * cNearX;
            const topRaysCount = 9;

            for (let i = 1; i < topRaysCount; i++) {
                const ratio = i / topRaysCount;
                const startX = cNearX + ceilingSpanNear * ratio;
                const endX = cFarX + (w - 2 * cFarX) * ratio;

                ctx.beginPath();
                ctx.moveTo(startX, 0);
                ctx.lineTo(endX, innerTop);
                ctx.stroke();
            }

            ctx.restore();
        }

        function drawInfiniteSideWalls(ctx, w, h, vpX, vpY, geom) {
            ctx.save();
            ctx.strokeStyle = THEME.gridColor;
            ctx.lineWidth = THEME.lineWidth;
            ctx.lineCap = 'round';

            const { innerTop, wNearTopY, wFarTopY, wFarX, wNearBottomY, wFarBottomY } = geom;

            ['left', 'right'].forEach((side) => {
                const isLeft = side === 'left';
                const outerEdgeX = isLeft ? 0 : w;
                const farX       = isLeft ? wFarX : (w - wFarX);

                ctx.beginPath();
                ctx.moveTo(farX, wFarTopY);
                ctx.lineTo(farX, wFarBottomY);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(outerEdgeX, wNearTopY);
                ctx.lineTo(farX, wFarTopY);
                ctx.moveTo(outerEdgeX, wNearBottomY);
                ctx.lineTo(farX, wFarBottomY);
                ctx.stroke();

                WALL_V_STEPS.forEach((step) => {
                    const currentX = isLeft ? (farX * step) : (w - (w - farX) * step);
                    const topY = wNearTopY + (wFarTopY - wNearTopY) * step;
                    const bottomY = wNearBottomY + (wFarBottomY - wNearBottomY) * step;

                    ctx.beginPath();
                    ctx.moveTo(currentX, topY);
                    ctx.lineTo(currentX, bottomY);
                    ctx.stroke();
                });

                const hRaysCount = 9;
                for (let i = 1; i < hRaysCount; i++) {
                    const ratio = i / hRaysCount;
                    const startY = wNearTopY + (wNearBottomY - wNearTopY) * ratio;
                    const endY = wFarTopY + (wFarBottomY - wFarTopY) * ratio;

                    ctx.beginPath();
                    ctx.moveTo(outerEdgeX, startY);
                    ctx.lineTo(farX, endY);
                    ctx.stroke();
                }
            });

            ctx.restore();
        }

        function drawGrid(w, h) {
            ctx.clearRect(0, 0, w, h);

            // 窄屏（≤1024px）另用一套几何，PC 分支不受影响
            if (window.innerWidth <= MOBILE_MAX_WIDTH && h < w * 1.4) {
                drawNarrowHeroGrid(w, h);
                return;
            }

            /* 以下与 static/members/title/title.js 的 drawGrid 完全一致 */
            const vpX = w * 0.5;
            const vpY = h * 0.45;

            const innerTop = h * 0.1452;
            const baselineNearX = w * 0.14;
            const baselineFarX = w * 0.284;

            const gapOffset = Math.max(12, Math.min(w, h) * 0.016);
            const slope = innerTop / (baselineFarX - baselineNearX);

            const geom = {
                innerTop: innerTop,
                cNearX: baselineNearX + gapOffset,
                cFarX: baselineFarX + gapOffset,
                wFarX: baselineFarX - gapOffset,
                wNearTopY: (innerTop + gapOffset * slope) - slope * (baselineFarX - gapOffset),
                wFarTopY: innerTop + gapOffset * slope,
                wNearBottomY: h * 0.748,
                wFarBottomY: h * 0.4862
            };

            drawInfiniteCeiling(ctx, w, h, vpX, vpY, geom);
            drawInfiniteSideWalls(ctx, w, h, vpX, vpY, geom);
        }

        /* 窄屏几何：PC 那套按 1440x900 调好的比例在接近正方形的首屏上会把
           墙体前沿算到 y<0（上部被裁掉），天花板远端也会比墙体视平线高出一个
           gapOffset，导致顶上左右两角空白，因此窄屏单独调整几何。 */
        function drawNarrowHeroGrid(w, h) {
            const gapOffset = Math.max(12, w * 0.03);

            // 天花板与墙体共用同一条视平线（wFarTopY）与同一个透视中心。
            // slope 越大远端收得越紧 = 两侧墙越窄；0.39 使单侧墙宽
            // (390-116.1)=273.9 -> 163.9 的 3/5；同时把整块网格按顶部
            // 固定导航高度（80px）下移，否则顶部网格会被导航条盖住。
            const slope = 0.39;
            const headerOffset = 84;

            const cNearX = gapOffset;
            const cFarX = (w / 2) * (1 - slope) - gapOffset * slope;
            const wFarX = cFarX;

            const geom = {
                innerTop: headerOffset + h * 0.16 * (1 - slope),
                cNearX: cNearX,
                cFarX: cFarX,
                wFarX: wFarX,
                wNearTopY: headerOffset + h * 0.16,
                wFarTopY: headerOffset + h * 0.16 * (1 - slope),
                wNearBottomY: h * 0.748,
                wFarBottomY: h * 0.4862
            };

            const vpX = w * 0.5;
            const vpY = h * 0.45;

            drawInfiniteCeiling(ctx, w, h, vpX, vpY, geom);
            drawInfiniteSideWalls(ctx, w, h, vpX, vpY, geom);
        }

        function init() {
            injectLeftDnaImage();
            injectBottomRightDnaImage();
            injectRightProteinImage();
            injectCenterImage();
            injectTextElements();
            resizeCanvas();
        }

        window.addEventListener('resize', resizeCanvas, { passive: true });
        init();
    }

    /* -------------------------------------------------------------
     * 2. 侧边栏 TOC 目录构建与滚动跟随（含底边齐平与渐隐逻辑）
     * -------------------------------------------------------------
     * 侧边栏只允许两种状态，二者都带文字或干脆没有：
     *   ① 宽屏（>1024px）：显示，目录一定建好、文字一定可见；
     *   ② 窄屏（≤1024px）：整块不显示（与手机端一致，由 CSS 隐藏）。
     * 绝不允许“显示侧边栏但里面没有文字”。为此：
     *   · 断点与页眉 head_foot 保持一致（见本文件开头的 MOBILE_MAX_WIDTH）；
     *   · 目录宽窄屏【一律构建】：窄屏只是被 CSS 藏起来，不建目录的话，
     *     从窄屏拖宽到宽屏就会出现“侧边栏显示了却一个字都没有”；
     *   · 目录为空（页面没有标题 / 脚本异常）时给侧边栏加 .is-empty，
     *     由 description.css 第 3.2 节整块隐藏；
     *   · description.css 第 3.1 节还给 #tocNav 加固过权重，防止它被
     *     页眉那条裸 nav 选择器（opacity: 0 / visibility: hidden）“劫持”。
     * ------------------------------------------------------------- */
    const tocNav = document.getElementById('tocNav');
    const mainContainer = document.getElementById('mainContainer');
    const sideContainer = document.getElementById('sideContainer');

    if (!tocNav || !mainContainer) return;

    /* 目录里有没有条目 —— 侧边栏“有底板、没文字”的状态以它为准。
       与 CSS 的 .side-container:has(.toc-nav:empty) 是同一件事的两个兜底：
       这里负责老浏览器与运行中被清空的目录，那边负责“脚本根本没跑起来”。 */
    const syncSidebarContent = () => {
        if (!sideContainer) return;
        sideContainer.classList.toggle('is-empty', tocNav.querySelectorAll('.toc-item').length === 0);
    };

    if (sideContainer) {
        const updateSidebarPosition = () => {
            // 窄屏侧边栏由 CSS 整块隐藏，不必再算位置（也避免对隐藏元素读写布局）
            if (isMobile()) return;

            const mainRect = mainContainer.getBoundingClientRect();
            const sidebarRect = sideContainer.getBoundingClientRect();
            const sidebarHeight = sideContainer.offsetHeight || sidebarRect.height;
            const targetTop = window.innerHeight * 0.15;
            
            // 计算 Sidebar 底边与 mainContainer 底边完全对齐时的顶部坐标
            const alignedTop = mainRect.bottom - sidebarHeight;

            // 1. 顶部进入阶段：页面刚滑过 Hero 区域，未完全进入视口 15%
            if (mainRect.top > targetTop) {
                sideContainer.style.top = `${mainRect.top}px`;
                sideContainer.style.opacity = '1';
                sideContainer.style.visibility = 'visible';
                sideContainer.style.pointerEvents = 'auto';
            }
            // 2. 正文中间阅读阶段：正常固定在视口 15vh，完全可见
            else if (alignedTop > targetTop) {
                sideContainer.style.top = `${targetTop}px`;
                sideContainer.style.opacity = '1';
                sideContainer.style.visibility = 'visible';
                sideContainer.style.pointerEvents = 'auto';
            }
            // 3. 底部齐平阶段：底边贴齐主体卡片底边；滚轮继续往下滑动则平滑淡出，往上滚动则线性恢复
            else {
                // 让 Sidebar 底边严格与 mainContainer 底边齐平对齐并随之向上移动
                sideContainer.style.top = `${alignedTop}px`;

                // 纯滚轮/滚动距离计算：超过齐平临界点后向下滑动的溢出距离 (px)
                const overflowDistance = targetTop - alignedTop; // >= 0

                /* 渐隐滚动的缓冲行程（160px 行程提供最自然的滚轮过渡感）。
                   但行程必须收在“页面能滚到的最后一像素”之内，否则底边对齐之后
                   剩下的滚动距离不够 160px 时，透明度就停在一个大于 0 的值上 ——
                   这就是“拉到底 sidebar 没有完全消失”：侧边栏半透明地压在正文
                   末段上，直到最后一屏也不归零。
                   所以实际行程取 min(160, 底部还能再滚出来的溢出量)：
                   一到底，opacity 正好是 0（<= 0.02 即 visibility: hidden）。 */
                const docMaxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
                const mainBottomInDoc = mainRect.bottom + window.scrollY;
                // 滚到最底时侧边栏的齐平位置 → 那时还能溢出多少
                const overflowAtBottom = Math.max(0, targetTop - (mainBottomInDoc - docMaxScroll - sidebarHeight));
                const fadeRange = Math.max(1, Math.min(160, overflowAtBottom));

                const fadeProgress = Math.min(1, Math.max(0, overflowDistance / fadeRange));
                const opacity = Math.max(0, 1 - fadeProgress);

                sideContainer.style.opacity = `${opacity}`;
                if (opacity <= 0.02) {
                    sideContainer.style.visibility = 'hidden';
                    sideContainer.style.pointerEvents = 'none';
                } else {
                    sideContainer.style.visibility = 'visible';
                    sideContainer.style.pointerEvents = 'auto';
                }
            }
        };

        window.addEventListener('scroll', updateSidebarPosition, { passive: true });
        window.addEventListener('resize', updateSidebarPosition, { passive: true });
        updateSidebarPosition();
    }

    const headings = mainContainer.querySelectorAll('h1.heading-1, h2.heading-2, h3.heading-3, h1.heading-reference');

    /* 目录宽窄屏【一律构建】：窄屏的侧边栏虽然被 CSS 整块隐藏，但目录照建，
       这样窗口从窄拖宽（或旋转平板）跨过断点时，侧边栏一出现就已经有文字，
       不会出现“有 sidebar 但没有文字”的中间状态。构建成本只是十来个 <a>。
       页面若一个标题都没有，目录就是空的，最后由 syncSidebarContent() 把
       整块侧边栏隐藏（而不是留一个空壳）。 */
    tocNav.innerHTML = '';

    let h1Index = 0;
    let h2Index = 0;
    let h3Index = 0;
    let refIndex = 0;

    const activeChainMap = {};
    let currentH1Id = null;
    let currentH2Id = null;

    /* 侧边目录里的标题文字：只取主标题，不含副标题（副标题见第 8 节）。
       第 8 节在 DOMContentLoaded 之前就把副标题搬出了标题元素，正常情况下
       这里根本走不到克隆分支；留着是为了兜住“副标题是后来才插进标题里的”
       这类极端情况，保证侧边栏里永远不会混进副标题文字。

       最后一步的 capitalizeSidebarLabel() 是【侧边栏专属】的排版规则：
       目录里每个标题都首单词首字母大写，正文标题保持原样（见本文件第 0 节）。
       第 4 节 cleanTocItem() 重算目录文字时用的是同一个函数，否则那边会把
       这里的大写改回去。 */
    const headingLabel = (heading) => {
        if (!heading.querySelector('.heading-sub')) {
            return capitalizeSidebarLabel(heading.textContent.trim());
        }

        const clone = heading.cloneNode(true);
        const cloneSub = clone.querySelector('.heading-sub');
        if (cloneSub && cloneSub.parentNode) cloneSub.parentNode.removeChild(cloneSub);
        return capitalizeSidebarLabel(clone.textContent.trim());
    };

    headings.forEach((heading) => {
        const isH1 = heading.matches('h1.heading-1');
        const isH2 = heading.matches('h2.heading-2');
        const isH3 = heading.matches('h3.heading-3');
        const isRef = heading.matches('h1.heading-reference');

        if (!heading.id) {
            if (isH1) {
                h1Index++;
                heading.id = `heading-1-${h1Index}`;
            } else if (isH2) {
                h2Index++;
                heading.id = `heading-2-${h2Index}`;
            } else if (isH3) {
                h3Index++;
                heading.id = `heading-3-${h3Index}`;
            } else if (isRef) {
                refIndex++;
                heading.id = `heading-reference-${refIndex}`;
            }
        }

        if (isH1 || isRef) {
            currentH1Id = heading.id;
            currentH2Id = null;
            activeChainMap[heading.id] = [heading.id];
        } else if (isH2) {
            currentH2Id = heading.id;
            activeChainMap[heading.id] = currentH1Id ? [currentH1Id, heading.id] : [heading.id];
        } else if (isH3) {
            const chain = [];
            if (currentH1Id) chain.push(currentH1Id);
            if (currentH2Id) chain.push(currentH2Id);
            chain.push(heading.id);
            activeChainMap[heading.id] = chain;
        }

        const tocItem = document.createElement('a');
        if (isH1 || isRef) {
            tocItem.className = 'toc-item toc-item-h1';
        } else if (isH2) {
            tocItem.className = 'toc-item toc-item-h2';
        } else {
            tocItem.className = 'toc-item toc-item-h3';
        }
        tocItem.href = `#${heading.id}`;
        tocItem.setAttribute('data-target', heading.id);
        tocItem.title = headingLabel(heading);

        if (isH1 || isRef) {
            const circle = document.createElement('span');
            circle.className = 'toc-circle';
            circle.setAttribute('aria-hidden', 'true');

            const text = document.createElement('span');
            text.className = 'toc-text';
            text.textContent = headingLabel(heading);

            tocItem.appendChild(circle);
            tocItem.appendChild(text);
        } else if (isH2) {
            const text = document.createElement('span');
            text.textContent = headingLabel(heading);
            text.className = 'toc-text';

            const triangle = document.createElement('span');
            triangle.className = 'toc-triangle';
            triangle.setAttribute('aria-hidden', 'true');

            tocItem.appendChild(text);
            tocItem.appendChild(triangle);
        } else if (isH3) {
            const text = document.createElement('span');
            text.className = 'toc-text';
            text.textContent = headingLabel(heading);

            tocItem.appendChild(text);
        }

        tocItem.addEventListener('click', (e) => {
            e.preventDefault();
            const targetEl = document.getElementById(heading.id);
            if (targetEl) {
                targetEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                if (history.pushState) {
                    history.pushState(null, '', `#${heading.id}`);
                }
                centerTocItemInSidebar(tocItem);
            }
        });

        tocNav.appendChild(tocItem);
    });

    /* 目录建完立刻核对侧边栏状态：有条目 → 可以显示（宽屏）；
       一条都没有 → 加 .is-empty，整块隐藏，绝不留空壳 */
    syncSidebarContent();

    /* 侧边栏的滚动发生在目录本体 #tocNav 上，不在 .side-container 上
       （description.css 第 3 节：本体 overflow: hidden，上下沿的渐隐留白才
       钉得住）。所以目录的滚动读写、以及“居中某个条目”时量取的视口，
       一律以 tocNav 为准；侧边栏本体只用来判断显示状态。 */
    const tocScroller = tocNav;

    const centerTocItemInSidebar = (item) => {
        if (!sideContainer || !item) return;
        const viewportRect = tocScroller.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const itemCenterOffset = (itemRect.top - viewportRect.top) + (itemRect.height / 2);
        // clientHeight 含目录本体的上下留白、不含滚动条，才是真正“看得到的高度”
        const viewportCenter = tocScroller.clientHeight / 2;
        const targetScrollTop = tocScroller.scrollTop + (itemCenterOffset - viewportCenter);

        tocScroller.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: 'smooth'
        });
    };

    let lastActiveId = null;

    const updateActiveToc = () => {
        const triggerPoint = window.innerHeight * 0.25;
        let currentHeading = null;

        const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
        if (isBottom) {
            currentHeading = headings[headings.length - 1];
        } else {
            for (let i = 0; i < headings.length; i++) {
                const rect = headings[i].getBoundingClientRect();
                if (rect.top <= triggerPoint) {
                    currentHeading = headings[i];
                } else {
                    break;
                }
            }
        }

        if (!currentHeading && headings.length > 0) {
            const firstRect = headings[0].getBoundingClientRect();
            if (firstRect.top <= window.innerHeight * 0.8) {
                currentHeading = headings[0];
            }
        }

        const activeIds = currentHeading ? (activeChainMap[currentHeading.id] || []) : [];
        const allTocItems = tocNav.querySelectorAll('.toc-item');
        allTocItems.forEach((item) => {
            const targetId = item.getAttribute('data-target');
            if (activeIds.includes(targetId)) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        if (currentHeading && currentHeading.id !== lastActiveId) {
            lastActiveId = currentHeading.id;
            const activeItem = tocNav.querySelector(`.toc-item[data-target="${currentHeading.id}"]`);
            if (activeItem) {
                centerTocItemInSidebar(activeItem);
            }
        } else if (!currentHeading && lastActiveId !== null) {
            lastActiveId = null;
            if (sideContainer) {
                tocScroller.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }
    };

    window.addEventListener('scroll', updateActiveToc, { passive: true });
    window.addEventListener('resize', updateActiveToc, { passive: true });
    updateActiveToc();

    /* -------------------------------------------------------------
     * 3. 宝剑 & 剑鞘滚动条与 Back to Top 逻辑
     * ------------------------------------------------------------- */
    const sword = document.getElementById('scrollSword');
    const scabbard = document.getElementById('scrollScabbard');
    const backToTop = document.getElementById('scrollBackToTop');

    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const getScrollBounds = () => {
        const targetTop = window.innerHeight * 0.10;
        const mainRect = mainContainer.getBoundingClientRect();
        const startScroll = mainRect.top + window.scrollY - targetTop;
        const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
        const scrollRange = Math.max(maxScroll - startScroll, 1);
        return { startScroll, maxScroll, scrollRange, targetTop, mainRect };
    };

    const updateSwordScabbardPosition = () => {
        if (!sword || !scabbard || !mainContainer) return;
        // 窄屏这两件装饰由 CSS 整块隐藏，跳过计算（窗口拖宽后 resize 会重算）
        if (isMobile()) return;

        const { startScroll, scrollRange, targetTop, mainRect } = getScrollBounds();
        const sword20PercentOffsetPx = window.innerHeight * 0.1;

        if (mainRect.top > targetTop) {
            sword.style.top = `${mainRect.top}px`;
            scabbard.style.top = `${mainRect.top + sword20PercentOffsetPx}px`;
        } else {
            sword.style.top = '10vh';

            let progress = 0;
            if (scrollRange > 0) {
                progress = Math.min(Math.max((window.scrollY - startScroll) / scrollRange, 0), 1);
            }

            const minTop = 20;
            const currentTop = Math.max(minTop, minTop + progress * 25);
            scabbard.style.top = `${currentTop}vh`;
        }

        if (backToTop) {
            const scabbardRect = scabbard.getBoundingClientRect();
            const scabbardCenterY = scabbardRect.top + scabbardRect.height / 2;
            backToTop.style.top = `${scabbardCenterY}px`;
            backToTop.style.transform = 'translateY(-50%)';

            if (scabbardRect.width > 0 && scabbardRect.left > 0) {
                const offsetRight = window.innerWidth - scabbardRect.left - 3;
                backToTop.style.right = `${offsetRight}px`;
            }
        }
    };

    let isDragging = false;
    let startDragY = 0;
    let startScrollY = 0;
    let cachedBounds = null;
    let dragRafId = null;
    let latestClientY = 0;

    if (scabbard) {
        scabbard.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            startDragY = e.clientY;
            latestClientY = e.clientY;
            startScrollY = window.scrollY;
            
            cachedBounds = getScrollBounds();
            document.documentElement.style.scrollBehavior = 'auto';

            scabbard.classList.add('dragging');
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging || !cachedBounds) return;
            latestClientY = e.clientY;

            if (!dragRafId) {
                dragRafId = requestAnimationFrame(() => {
                    dragRafId = null;
                    if (!isDragging || !cachedBounds) return;

                    const deltaY = latestClientY - startDragY;
                    const travelDistancePx = window.innerHeight * 0.25;
                    const scrollDelta = (deltaY / travelDistancePx) * cachedBounds.scrollRange;

                    window.scrollTo({
                        top: Math.max(0, Math.min(cachedBounds.maxScroll, startScrollY + scrollDelta)),
                        behavior: 'auto'
                    });
                });
            }
        });

        const stopDragging = () => {
            if (isDragging) {
                isDragging = false;
                cachedBounds = null;
                if (dragRafId) {
                    cancelAnimationFrame(dragRafId);
                    dragRafId = null;
                }

                document.documentElement.style.scrollBehavior = '';
                scabbard.classList.remove('dragging');
                document.body.style.userSelect = '';
            }
        };

        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('mouseleave', stopDragging);
        scabbard.addEventListener('load', updateSwordScabbardPosition);
    }

    if (sword) {
        sword.addEventListener('click', (e) => {
            if (e.target === scabbard) return;
            const { startScroll, scrollRange } = getScrollBounds();
            const swordRect = sword.getBoundingClientRect();
            const clickOffset = e.clientY - swordRect.top;
            const minClickOffset = swordRect.height * 0.2;
            const effectiveRange = swordRect.height * 0.5;

            const targetProgress = Math.min(Math.max((clickOffset - minClickOffset) / effectiveRange, 0), 1);

            window.scrollTo({
                top: startScroll + targetProgress * scrollRange,
                behavior: 'smooth'
            });
        });
    }

    window.addEventListener('scroll', updateSwordScabbardPosition, { passive: true });
    window.addEventListener('resize', updateSwordScabbardPosition, { passive: true });
    updateSwordScabbardPosition();
});

/* ========================================================
   4. 正文 <e></e> 标签：剔除侧边目录里的文字
      （原 IHP.js 的全部逻辑已并入本文件）
   ========================================================

   在 HTML 里把一段文字包进 <e></e>，即可：
       · 正文中 —— 正常显示（样式见 description.css 第 9.1 节）；
       · 侧边栏目录中 —— 不显示（样式兜底见第 9.3 节）。

   实现方式：本文件第 2 节的目录构建用 heading.textContent 生成目录
   文字，所以只要在目录项生成后，把其中的 <e> 节点整个删掉即可。
   用 MutationObserver 监听 #tocNav，既能覆盖第 2 节的首次构建，也能
   覆盖窗口变宽 / 其它脚本重建目录的情况。

   注意：正文里的 <e></e> 一个都不会被改动，只在“克隆出来的节点”
   上做剔除，因此正文永远照常显示。

   剔除完还会按第 0 节的规则把目录文字的首单词首字母大写（本文件 4.1
   的 cleanTocItem 里调用的 capitalizeSidebarLabel）：这一节会把目录文字
   整段重写，不在这里再大写一次的话，第 2 节大写好的文字会被改回原样。

   执行时机：本段代码写在文件末尾、DOMContentLoaded 回调之外，defer
   脚本执行时（readyState 已是 interactive）就会直接启动；此刻第 2 节
   的目录尚未构建，真正生效的是下面的 MutationObserver 回调。
   ======================================================== */
(function () {
    'use strict';

    /* 隐藏标记标签：<e></e>（HTML 标签名大小写不敏感，<e> / <E> 都行） */
    var HIDE_TAG = 'e';
    /* 取“目录文字”时要一并剔掉的节点：<e></e> 与标题副标题（见第 8 节 /
       description.css 第 14 节）。副标题只是主标题下面的一行标签，
       不该出现在侧边目录里。 */
    var TOC_HIDE_SELECTOR = HIDE_TAG + ', .heading-sub';
    /* 供 processToc() 判断“这一项已经清理过”的标记 */
    var PROCESSED_FLAG = 'ihpEProcessed';
    /* 兼容 :scope 尚未普及的环境（老 Safari / 老 Edge） */
    var matches = function (el, selector) {
        var fn = el.matches || el.msMatchesSelector || el.webkitMatchesSelector;
        return fn ? fn.call(el, selector) : false;
    };

    /* ------------------------------------------------------
       4.1 侧边目录（TOC）：剔除 <e></e> 内的文字
       ------------------------------------------------------ */

    /* 只保留“正文可见文字”：<e></e> 与标题副标题（.heading-sub）整段丢弃。
       在克隆节点上操作，绝不影响正文 DOM。 */
    function visibleTextOnly(source) {
        if (!source) return '';
        if (!source.querySelector(TOC_HIDE_SELECTOR)) return source.textContent || '';

        var clone = source.cloneNode(true);
        Array.prototype.forEach.call(clone.querySelectorAll(TOC_HIDE_SELECTOR), function (node) {
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
        //
        // 这里必须再套一次 capitalizeSidebarLabel()：目录文字会被本函数
        // 整段重写，如果只大写一次（第 2 节的 headingLabel），这一步就会
        // 把首字母改回标题原本的大小写。两处用同一个函数，正文一个字不动。
        var label = capitalizeSidebarLabel(visibleTextOnly(heading).trim());

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
       4.2 标题排版兜底
       ------------------------------------------------------
       description.css 把 .heading-* 设成了 display: flex，flex 会把直接
       子元素块化：写在标题里的 <e> 会从行内变成块级，导致
       "标题前半 <e>隐藏段</e>" 这样的标题在正文里断成左右两栏。
       description.css 第 9.2 节用 :has(e) + display: contents 解决这个问题；
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
       4.3 启动
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
       即可看到该标题在侧边栏里会显示成什么（含首字母大写）。 */
    window.__IHP__ = {
        sidebarLabel: function (heading) {
            return capitalizeSidebarLabel(visibleTextOnly(heading).trim());
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

/* ========================================================
   5. 正文表格：标记首行与末行
   ========================================================
   配合 description.css 第 12 节使用。CSS 没法可靠地判断“哪一行是
   第一行 / 最后一行”：带 <thead> 的表格里，tbody 的第一行同样是
   :first-child；有 <tfoot> 时 tbody 的最后一行也不是 :last-child。
   所以这里在运行时按真实的 <tr> 顺序加上标记类，CSS 只管画线。

   行数 / 列数 / 内容都在 HTML 里自由增减：每次只按当前 <tr> 的先后
   顺序重算，完全不关心单元格里写了什么；表格内部结构被改动后会由
   MutationObserver 自动重算。

   兜底：即使本段脚本没执行，description.css 第 12 节里的结构选择器
   也能画出同样的三条线。
   ======================================================== */
(function () {
    'use strict';

    /* 正文卡片里的所有表格都套用这套样式 */
    var TABLE_SELECTOR = '.main-container table';
    /* 已处理的表格会带上这个类，作为稳定钩子（便于调试或单独覆盖） */
    var TABLE_CLASS = 'wp-table';
    var FIRST_ROW_CLASS = 'wp-table-first-row';
    var LAST_ROW_CLASS = 'wp-table-last-row';

    /* 判断某个 <tr> 是否属于这张表：嵌套表格里的行不参与标记 */
    function belongsTo(row, table) {
        var node = row.parentNode;
        while (node && node !== table) {
            if (node.tagName === 'TABLE') return false;
            node = node.parentNode;
        }
        return node === table;
    }

    /* 重新标记单张表的首行与末行 */
    function markTable(table) {
        if (!table.classList.contains(TABLE_CLASS)) {
            table.classList.add(TABLE_CLASS);
        }

        var rows = [];
        Array.prototype.forEach.call(table.querySelectorAll('tr'), function (row) {
            if (belongsTo(row, table)) rows.push(row);
        });

        Array.prototype.forEach.call(rows, function (row) {
            row.classList.remove(FIRST_ROW_CLASS);
            row.classList.remove(LAST_ROW_CLASS);
        });

        // 只有一行的表格会同时拿到上下两条线，属于预期行为
        if (!rows.length) return;
        rows[0].classList.add(FIRST_ROW_CLASS);
        rows[rows.length - 1].classList.add(LAST_ROW_CLASS);
    }

    function markAllTables() {
        Array.prototype.forEach.call(document.querySelectorAll(TABLE_SELECTOR), markTable);
    }

    /* ------------------------------------------------------
       5.1 表格增删行 / 列后自动重算
       ------------------------------------------------------
       用 requestAnimationFrame 合并连续的改动，避免一次改多行时
       反复读写 DOM。 */
    var frameId = null;

    function scheduleMark() {
        if (frameId !== null) return;
        if (typeof requestAnimationFrame === 'function') {
            frameId = requestAnimationFrame(function () {
                frameId = null;
                markAllTables();
            });
        } else {
            markAllTables();
        }
    }

    /* 这次改动是否发生在表格里（或本身就是一张表格） */
    function touchesTable(node) {
        if (!node || node.nodeType !== 1) return false;
        if (node.tagName === 'TABLE') return true;
        if (node.querySelector && node.querySelector('table')) return true;

        var parent = node.parentNode;
        while (parent) {
            if (parent.tagName === 'TABLE') return true;
            parent = parent.parentNode;
        }
        return false;
    }

    function observeTables() {
        var scope = document.getElementById('mainContainer') ||
                    document.querySelector('.main-container');
        if (!scope || typeof MutationObserver !== 'function') return;

        new MutationObserver(function (records) {
            for (var i = 0; i < records.length; i++) {
                var record = records[i];
                if (touchesTable(record.target) ||
                    touchesTable(record.addedNodes[0]) ||
                    touchesTable(record.removedNodes[0])) {
                    scheduleMark();
                    return;
                }
            }
        }).observe(scope, { childList: true, subtree: true });
    }

    /* ------------------------------------------------------
       5.2 启动（与第 4 节同理：defer 执行时 DOM 已可解析）
       ------------------------------------------------------ */
    function start() {
        markAllTables();
        observeTables();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }

    /* 只读调试接口：控制台执行 __TABLES__.refresh() 可手动重算标记 */
    window.__TABLES__ = { refresh: markAllTables };
})();

/* ========================================================
   6. upfold 组件：点击展开 / 收起隐藏文字
   ========================================================
   配合 description.css 第 13 节。结构约定：
       <upfold>标签文字<upfold-text>点击后展开的正文</upfold-text></upfold>
   也支持 class 写法：<span class="upfold">…<span class="upfold-text">…</span></span>。

   这里做四件事：
   ① 把标签文字包进 <span class="upfold-label">。胶囊的底色 / 内边距都画在
      这一层上，而展开的正文只是它的兄弟节点 —— 于是正文天生就在胶囊盒子
      外面，不会被胶囊的背景框住（见 description.css 第 13 节）。
   ② 往胶囊上挂两枚装饰（见 6.1 / 6.2）：左端的小人图标、右端压在底色
      下面的剑。它们的素材引用、位置、尺寸、层级都在本文件里给，
      description.css 第 13 节只留胶囊本身长什么样。
   ③ 给带隐藏文字的组件绑定点击 / 键盘开合并切换 .is-open：展开时把胶囊的
      底色从 #53DEB7 换成 #D3F8DD，同时把文字从白色换成正文字体颜色 #465E77。
   ④ 展开出来的正文左侧铺一排左右交替的脚印（见 6.3）：正文从第 3.5 个字符
      开始（与脚印最右侧隔 0.5ch），左脚印的左边缘在 0–1ch、右脚印在 1–2ch
      里各自随机；每个脚印的上沿间距（1.5~2.5 个脚印高）与旋转角度也都是
      随机值，一直排到放不下；点开时这一串脚印还会从上往下挨个出现（见 6.4）。

   展开后的文字会被自动加上 .body-text 类，所以排版与正文完全一致
   （字号、行距、颜色、两端对齐都跟着 .body-text 走，正文格式以后改了
   这里自动跟随）。点击展开出来的文字本身不会收起，方便选中 / 复制。

   没有 <upfold-text> 的组件只做第 ① ② 步：保持静态胶囊外观，点击无反应。
   ======================================================== */
(function () {
    'use strict';

    var HOST_SELECTOR = '.main-container upfold, .main-container .upfold';
    var CONTENT_SELECTOR = 'upfold-text, .upfold-text';
    var LABEL_CLASS = 'upfold-label';
    var OPEN_CLASS = 'is-open';
    var READY_ATTR = 'data-upfold-ready';
    /* 展开文字左侧那一排脚印（6.3）：素材与随机范围都在这儿 */
    var RAIL_CLASS = 'upfold-rail';
    var FOOT_CLASS = 'upfold-foot';
    var PROBE_CLASS = 'upfold-rail-probe';
    var EMPTY_CLASS = 'is-empty';
    var FOOT_SRC = {
        left: 'https://static.igem.wiki/teams/6059/wiki/notebook/left.avif',
        right: 'https://static.igem.wiki/teams/6059/wiki/notebook/right.avif'
    };
    /* 轨道基准尺寸（ch）：默认值，实际以 CSS 变量 --upfold-rail-span 为准
       —— CSS 才是唯一出处，改那边就够 */
    var RAIL_SPAN = 1;            /* 每侧“左边缘”的随机范围宽（对应 --upfold-rail-span） */
    /* 随机范围 */
    var FOOT_GAP_MIN = 1.5;       /* 相邻脚印上沿的间距：1.5 ~ 2.5 个脚印高 */
    var FOOT_GAP_MAX = 2.5;
    var FOOT_ROTATE = 20;         /* 旋转角度：±20° */
    var RAND_PER_FOOT = 3;        /* 每个脚印固定消耗 3 个随机数（见 6.3） */
    var FOOT_LIMIT = 200;         /* 兜底：整块展开区最多画这么多个脚印 */
    /* 展开时“从上往下挨个出现”的动效参数（见 6.4）：
       每秒出现 FOOT_REVEAL_PER_SECOND 个脚印（= 每 1000 / 它 毫秒排到下一个），
       每个脚印用 DURATION 毫秒从 SCALE 倍大小、全透明放大到原始大小 */
    var FOOT_REVEAL_PER_SECOND = 4;   /* 出现速度：1 秒 4 个（每 250ms 一个） */
    var FOOT_REVEAL_DURATION = 320;
    var FOOT_REVEAL_SCALE = 0.4;

    /* ------------------------------------------------------
       胶囊上两枚装饰：素材引用 + 站位 / 尺寸 / 层级
       ------------------------------------------------------
       原先这两枚装饰一半在 CSS（kid-2.avif 的 ::before 背景图、
       剑的 .upfold-sword 规则），一半在这里（图片 URL），想换个位置或
       换张素材得翻两个文件。现在整块收到本文件，description.css 第 13 节
       只留胶囊（矩形）本身的样式。
       换素材 / 挪位置 / 调大小，只改下面这几行。 */
    var KID_CLASS = 'upfold-kid';
    var KID_SRC = 'https://static.igem.wiki/teams/6059/wiki/notebook/kid-2.avif';
    var KID_SIZE = '4em';         /* 图标边长（em，跟着胶囊字号一起缩放） */
    var KID_GAP = '0.4em';        /* 图标与标签文字之间的距离 */
    var KID_TOP = '40%';          /* 图标中心在胶囊高度上的位置 */

    var SWORD_CLASS = 'upfold-sword';
    var SWORD_SRC = 'https://static.igem.wiki/teams/6059/wiki/notebook/sword1-0.avif';
    var SWORD_RIGHT = '10%';      /* 剑的右边缘距胶囊右边 10% */
    var SWORD_TOP = '40%';        /* 剑的【中心线】所在高度：50% 是正中，40% = 往上挪 10% */
    var SWORD_HEIGHT = '190%';    /* 长度与第一版一致（> 100% 才会上下各露一节） */
    var SWORD_MAX_WIDTH = '3em';  /* 兜底：素材若过宽，最多占这么宽 */

    /* 一个 <upfold> 里【所有】点击后展开的正文块。
       可以写多块，每块展开后就是独立的一段正文：
           <upfold>标签文字
               <upfold-text>第一段……</upfold-text>
               <upfold-text>第二段……</upfold-text>
           </upfold>
       两块都会各自被加上 .body-text（见 setup），段与段之间的空档由
       description.css 第 13 节给，看起来就跟正文分了两段一样。 */
    function contentsOf(host) {
        return Array.prototype.slice.call(host.querySelectorAll(CONTENT_SELECTOR));
    }

    /* 第一块正文：左侧那排脚印（见 6.3）只铺在它旁边，所以单独取一次 */
    function contentOf(host) {
        return host.querySelector(CONTENT_SELECTOR);
    }

    /* 这个节点是某个正文块本身，或者包着某个正文块的外壳？
       两种情况都不能被搬进 .upfold-label —— 否则正文会跑进胶囊里。 */
    function holdsContent(node, contents) {
        if (node.nodeType !== 1) return false;

        for (var i = 0; i < contents.length; i++) {
            if (node === contents[i]) return true;
            if (node.contains && node.contains(contents[i])) return true;
        }
        return false;
    }

    /* 把标签文字搬进 .upfold-label，隐藏文字留在原处当兄弟节点。
       逐个搬节点而不是重写 innerHTML，是为了不破坏已有的事件监听。

       注意传进来的是【全部】正文块：写了两块 <upfold-text> 时两块都要留在
       原地。以前这里只认第一块（contentOf 的 querySelector 只返回第一个），
       第二块就被当成“标签文字”搬进胶囊 —— 那正是“第一段写在标题里”的原因。 */
    function wrapLabel(host, contents) {
        var existing = host.querySelector('.' + LABEL_CLASS);
        if (existing) return existing;

        var label = document.createElement('span');
        label.className = LABEL_CLASS;

        var movable = [];
        Array.prototype.forEach.call(host.childNodes, function (node) {
            if (holdsContent(node, contents)) return;   // 正文块（或包着它的外壳）留在原地
            movable.push(node);
        });

        Array.prototype.forEach.call(movable, function (node) {
            label.appendChild(node);
        });

        host.insertBefore(label, host.firstChild);
        return label;
    }

    /* ------------------------------------------------------
       6.1 胶囊左端的装饰图标（kid-2.avif）
       ------------------------------------------------------
       往 .upfold-label 里塞一张小人的图片，贴在矩形左端、压在底色之上
       （z-index: 1）。素材引用与站位（位置 / 尺寸 / 层级）都在这里一次性
       写成内联样式，description.css 里不再有这条背景图。

       标签的左内边距也在这里按“图标 + 间距”算出来，于是文字自动为图标
       让位（原先写在 CSS 的 padding-left 里）；图片加载失败就把图标撤掉
       并把左内边距还原，不让文字白白退一截。

       纯装饰：不拦鼠标（pointer-events: none）、不被读屏朗读（aria-hidden）。 */
    function injectKid(label) {
        if (!label || label.querySelector('.' + KID_CLASS)) return;

        var kid = document.createElement('img');
        kid.className = KID_CLASS;
        kid.src = KID_SRC;
        kid.alt = '';
        kid.setAttribute('aria-hidden', 'true');

        kid.style.position = 'absolute';
        kid.style.left = '0';
        kid.style.top = KID_TOP;
        kid.style.transform = 'translateY(-50%)';
        kid.style.width = KID_SIZE;
        kid.style.height = KID_SIZE;
        kid.style.objectFit = 'contain';     /* 素材不是正方形也不会被压扁 */
        kid.style.pointerEvents = 'none';
        kid.style.zIndex = '1';              /* 明确压在底色之上 */

        kid.addEventListener('error', function () {
            if (kid.parentNode) kid.parentNode.removeChild(kid);
            label.style.paddingLeft = '';    // 图标没了，文字不必再让位
        });

        // 绝对定位，放在最前面也不会挤走标签文字
        label.insertBefore(kid, label.firstChild);

        // 文字为图标让位：左内边距 = 图标边长 + 间距
        label.style.paddingLeft = 'calc(' + KID_SIZE + ' + ' + KID_GAP + ')';
    }

    /* ------------------------------------------------------
       6.2 胶囊右端的剑形装饰（sword1.avif）
       ------------------------------------------------------
       往 .upfold-label 里塞一张剑的图片：绝对定位 + z-index: -1，
       位置是矩形的 right 10% / top 40%，再用 translateY(-50%) 把剑的
       【中心线】对在这条线上 —— top 量的是中心线，不是上边缘。
       中心线在 40% 而不是 50%，所以它并没有居中，而是比第一版（居中）
       整体往上挪了 10% 的胶囊高度：上方露 55%、下方露 35%。
       高度写成百分比，胶囊变高变矮、窄屏换字号，剑都跟着缩放。

       用真 <img> 而不是 CSS 背景图，是为了让“宽度按原图比例自动算”
       （height 给定 → width: auto 用素材自身宽高比），以后换素材不用
       回来量尺寸、改样式。

       宿主（<upfold>）要加 isolation: isolate：.upfold-label 自身
       position: relative 但没有 z-index，本来不构成层叠上下文，剑的
       z-index: -1 会一路穿到页面最外面的层叠上下文里、被正文白卡片盖住；
       把宿主做成层叠上下文后，-1 只在本组件内部生效 —— 剑画在胶囊底色
       之前，所以被矩形挡住、只漏出上下两头。

       纯装饰：alt="" + aria-hidden，鼠标事件由 pointer-events 关掉，
       既不拦点击也不挡选中；图片加载失败就整张撤掉，不留下破图。 */
    function injectSword(host, label) {
        if (!host || !label) return;

        // 不管这一次插没插过图，先保证层叠上下文在
        host.style.isolation = 'isolate';

        if (label.querySelector('.' + SWORD_CLASS)) return;

        var sword = document.createElement('img');
        sword.className = SWORD_CLASS;
        sword.src = SWORD_SRC;
        sword.alt = '';
        sword.setAttribute('aria-hidden', 'true');

        sword.style.position = 'absolute';
        sword.style.right = SWORD_RIGHT;
        sword.style.top = SWORD_TOP;             /* 这里量的是剑的中心线 */
        sword.style.transform = 'translateY(-50%)';  /* 中心线对到 top（40% = 比居中高 10%） */
        sword.style.height = SWORD_HEIGHT;
        sword.style.width = 'auto';              /* 宽度按原图比例自动算 */
        sword.style.maxWidth = SWORD_MAX_WIDTH;
        sword.style.objectFit = 'contain';       /* 被 maxWidth 卡住也不拉变形 */
        sword.style.zIndex = '-1';               /* 压在胶囊底色下面 */
        sword.style.pointerEvents = 'none';

        sword.addEventListener('error', function () {
            if (sword.parentNode) sword.parentNode.removeChild(sword);
        });

        // 绝对定位，放在最前面也不会挤走标签文字
        label.insertBefore(sword, label.firstChild);
    }

    /* ------------------------------------------------------
       6.3 展开文字左侧的脚印轨道
       ------------------------------------------------------
       正文左侧让出 3.5ch（description.css 第 13 节的 padding-left），正文从
       3.5ch 起。脚印宽 1ch，落点左右分开随机（宽度取自 CSS 的
       --upfold-rail-span）：左脚印的左边缘落 0 ~ 1ch、右脚印落 1 ~ 2ch
       —— 脚印最右到 3ch，与正文之间留 0.5ch 空隙。素材左右各一张，交替往下排：

           · 左脚印 1 的上沿固定在最上面（= 正文顶部，不随机）；
           · 之后每个脚印的上沿 = 上一个的上沿 + 1.5 ~ 2.5 个【本脚印】高度
             （间隔都大于 1 个脚印高，所以上下不会叠在一起）；
           · 一直排到“离整块展开区底部已经放不下下一个脚印”为止。

       展开区的高度 = 第一块正文的顶边 → 最后一块正文的底边（见
       expandedHeight）：所以正文分成两段及以上时，第二段左侧一样有脚印，
       脚印从第一段一路铺到最后一段，不会只铺满第一段。

       横向浮动、上下间距、旋转（-20° ~ +20°）都是随机值，但同一个脚印
       在整页生命周期里只用同一组数：随机数按“轨道 + 序号”缓存在
       randomOf() 里，所以窗口缩放、反复展开收起重算时每个脚印都待在原地；
       刷新页面后轨道重建、缓存清空，于是重新随机一遍。

       脚印只是装饰：不响应鼠标（pointer-events: none）、不被读屏朗读
       （aria-hidden）。高度要等素材加载完才知道，所以左右两枚“探针”
       各自加载完后再排一次；正文高度变化由 ResizeObserver 触发重算。

       位置算好之后，如果是“点开”触发的这一次排布，还会按 6.4 的规则
       让脚印从上往下挨个出现；缩放等重排不播动画，脚印直接就位。 */
    function railOf(content) {
        var rail = content.querySelector('.' + RAIL_CLASS);
        if (rail) return rail;

        rail = document.createElement('span');
        rail.className = RAIL_CLASS;
        rail.setAttribute('aria-hidden', 'true');

        // 左右各留一枚探针：宽度与脚印一致，只用来量出脚印高度，
        // 平时不可见（CSS 的 .upfold-rail-probe），量完一直留着便于重算。
        ['left', 'right'].forEach(function (side) {
            var probe = document.createElement('img');
            probe.className = FOOT_CLASS + ' ' + PROBE_CLASS;
            probe.setAttribute('data-side', side);
            probe.src = FOOT_SRC[side];
            probe.alt = '';
            // 高度要等素材加载完才知道，load 之后再排一次
            probe.addEventListener('load', function () { fillRail(content); });
            // 素材坏了就整条轨道收起来，别留一个破图占位
            probe.addEventListener('error', function () { rail.classList.add(EMPTY_CLASS); });
            rail.appendChild(probe);
        });

        // 放在最前面：绝对定位，不会挤走正文（正文由 CSS 的 padding 让位）
        content.insertBefore(rail, content.firstChild);
        return rail;
    }

    /* 量出某种脚印按 1.5ch 渲染时的高度（px）；没加载完（或坏了）返回 0 */
    function probeHeight(rail, side) {
        var probe = rail.querySelector('.' + PROBE_CLASS + '[data-side="' + side + '"]');
        if (!probe || !probe.complete || !probe.naturalWidth) return 0;
        return probe.getBoundingClientRect().height;
    }

    /* 每侧“左边缘”的随机范围宽（ch）：从 CSS 变量 --upfold-rail-span 读。
       左脚印落 0 ~ span，右脚印落 span ~ 2×span（当前 1ch → 左 0~1ch、
       右 1~2ch）；读不到就用代码里的默认值。 */
    function railSpan(rail) {
        var span = RAIL_SPAN;

        if (window.getComputedStyle) {
            var v = parseFloat(window.getComputedStyle(rail).getPropertyValue('--upfold-rail-span'));
            if (v > 0) span = v;
        }

        return span;
    }

    /* 稳定的随机数：同一条轨道、同一个序号只生成一次并缓存。
       重算时取到的还是原来那组数；刷新后轨道是新建的，缓存清空 —— 重新随机。 */
    function randomOf(rail, index) {
        if (!rail.__upfoldRandom) rail.__upfoldRandom = [];
        var cache = rail.__upfoldRandom;
        if (cache[index] === undefined) cache[index] = Math.random();
        return cache[index];
    }

    function randomBetween(rail, index, min, max) {
        return min + randomOf(rail, index) * (max - min);
    }

    /* 造一个脚印：从已经加载好的探针克隆，省得每次重排都重新解码素材。
       克隆不带事件监听（探针上那两个 load / error 不会被复制）。 */
    function makeFoot(rail, side) {
        var probe = rail.querySelector('.' + PROBE_CLASS + '[data-side="' + side + '"]');
        var foot = probe ? probe.cloneNode(false) : document.createElement('img');

        foot.className = FOOT_CLASS;      // 去掉探针类：位置由下面写内联
        foot.alt = '';
        if (!foot.getAttribute('src')) foot.src = FOOT_SRC[side];
        return foot;
    }

    /* 从某个正文块往上找它所属的 <upfold>（宿主） */
    function hostOf(content) {
        var node = content.parentNode;

        while (node && node.nodeType === 1) {
            if (node.tagName === 'UPFOLD' ||
                (node.classList && node.classList.contains('upfold'))) return node;
            node = node.parentNode;
        }
        return null;
    }

    /* 整块展开区的高度（px）：从【第一块】正文的顶边，到【最后一块】正文的
       底边。只写了一段时就是这一段自己的高度（与以前完全一样）；写了两段及
       以上时，脚印会一路排到第二段的底部 —— 这样每一段左侧都有脚印。
       注意：所有正文块都是宿主的直接子级，它们是【兄弟】不是父子，
       所以第二块的位置只能靠 getBoundingClientRect() 量，不能用 offsetTop。 */
    function expandedHeight(content) {
        var host = hostOf(content);
        var blocks = (host && host.querySelectorAll) ? contentsOf(host) : [];

        if (blocks.length < 2) return content.clientHeight;

        var top = blocks[0].getBoundingClientRect().top;
        var bottom = blocks[blocks.length - 1].getBoundingClientRect().bottom;
        return Math.max(0, bottom - top);
    }

    function fillRail(content) {
        var rail = railOf(content);

        var heights = {
            left: probeHeight(rail, 'left'),
            right: probeHeight(rail, 'right')
        };
        // 还没加载完先不排，等 load 回调
        if (!heights.left || !heights.right) return;

        // 整块展开区的高度：脚印从第一段的顶边一直排到最后一段的底边
        // （写了两段及以上时，第二段左侧也要有脚印，见 expandedHeight）
        var limit = expandedHeight(content);
        if (!limit) return;

        var span = railSpan(rail);
        var sides = ['left', 'right'];

        /* 第一步：只算位置，不碰 DOM。
           每放一个脚印固定消耗 3 个随机数（横向 / 上沿间距 / 旋转），
           序号可预期，所以同一组缓存数总能算出同一份排布。 */
        var plan = [];
        var marks = [];
        var prevTop = 0;

        while (plan.length < FOOT_LIMIT) {
            var index = plan.length;
            var side = sides[index % 2];
            var height = heights[side];
            var base = index * RAND_PER_FOOT;

            // 上沿：第一个（左）固定在最上面；之后每个都比上一个低
            // 1.5 ~ 2.5 个本脚印的高度
            var top = 0;
            if (index > 0) {
                top = prevTop + randomBetween(rail, base + 1, FOOT_GAP_MIN, FOOT_GAP_MAX) * height;
            }

            // 离本段底部放不下下一个脚印就停
            if (top + height > limit) break;

            // 横向：左脚印的左边缘落 0 ~ span，右脚印落 span ~ 2×span
            var offset = randomBetween(rail, base, 0, span);
            if (index % 2 === 1) offset += span;

            var rotate = randomBetween(rail, base + 2, -FOOT_ROTATE, FOOT_ROTATE);

            plan.push({
                side: side,
                left: offset.toFixed(3) + 'ch',
                top: top.toFixed(2) + 'px',
                rotate: rotate.toFixed(2)
            });
            marks.push(side + offset.toFixed(3) + ',' + top.toFixed(2) + ',' + rotate.toFixed(2));
            prevTop = top;
        }

        /* 第二步：这份排布和历史完全一样时就不动 DOM。
           必要性：展开会让内容从 display: none 变成可见，ResizeObserver
           紧接着就会回调一次；若无条件删掉重建，刚刚开始播放的“挨个出现”
           动效会连元素一起被换掉，动画等于没播。位置没变就不重建，
           正在跑的动画也能继续跑完。 */
        var signature = plan.length + '|' + marks.join(';');
        var sameAsBefore = signature === rail.__upfoldLayout &&
                           !!rail.querySelector('.' + FOOT_CLASS + ':not(.' + PROBE_CLASS + ')');

        if (!sameAsBefore) {
            // 清掉上一轮排出来的脚印（两枚探针留着继续量高度）
            Array.prototype.forEach.call(rail.querySelectorAll('.' + FOOT_CLASS), function (el) {
                if (!el.classList.contains(PROBE_CLASS)) rail.removeChild(el);
            });

            var batch = document.createDocumentFragment();
            plan.forEach(function (item) {
                var foot = makeFoot(rail, item.side);
                foot.style.left = item.left;
                foot.style.top = item.top;
                foot.style.transform = 'rotate(' + item.rotate + 'deg)';
                batch.appendChild(foot);
            });
            rail.appendChild(batch);
            rail.__upfoldLayout = signature;
        }

        // 一个都放不下时整条藏起来。用 visibility 而不是 display：
        // 探针还得留着量高度，正文一变高就能重新长出来。
        if (plan.length) {
            rail.classList.remove(EMPTY_CLASS);
        } else {
            rail.classList.add(EMPTY_CLASS);
        }

        /* 这一次要不要播“挨个出现”：只有 setOpen() 展开时才会打上标记
           （见上面的说明）。窗口缩放等重排不会打标记，所以脚印是直接
           就位的，不会每次都重新淡入一遍。
           标记只在这里消费掉 —— 素材还没加载完时上面会提前 return，
           标记留着，等 load 回调真正排好脚印时再播。
           位置没变（sameAsBefore）时元素还在原地，直接对它们重播一次即可。 */
        if (rail.__upfoldReveal) {
            rail.__upfoldReveal = false;
            revealFeet(rail);
        }
    }

    /* ------------------------------------------------------
       6.4 展开动效：脚印从上往下挨个出现
       ------------------------------------------------------
       点开时第 i 个脚印比第一个晚 i × (1000 / FOOT_REVEAL_PER_SECOND) 毫秒
       （当前 1 秒 4 个 → 每隔 250ms 排到下一个），从 40% 大小、全透明放大
       到原始大小（同时保留它自己的随机旋转角度）——于是视觉上是一串脚印
       自上而下依次“踩”出来。

       注意两件事：
       · 单个脚印的淡入时长是 320ms，现在比 250ms 的间隔长一点，所以相邻
         两个会有很短的叠影（看起来更连贯）；想严格一个接一个就把
         FOOT_REVEAL_DURATION 调到 250 以下（如 200）。
       · 总时长随脚印个数线性增长：16 个约 3.8s、25 个约 6s、40 个约 9.8s
         （最后一个的开始时间 = (个数 − 1) × 250ms）。嫌久就继续调大
         FOOT_REVEAL_PER_SECOND，或给它加个总时长上限再按比例压缩间隔。

       用 Web Animations API 而不是 CSS @keyframes：每个脚印的旋转角度
       都是内联的随机值，关键帧必须由 JS 现算；这样动效也完全待在 JS 里，
       description.css 不需要加任何动画样式。fill: 'backwards' 让脚印在
       轮到自己之前保持“不可见”的起始态，动画结束后又自动回到元素自身的
       样式（透明度 1 + 内联旋转），所以不留后遗症。

       截图 / 老浏览器：不支持 Element.animate 时直接全部显示（静态效果）；
       系统开了“减少动态效果”时同样跳过，避免无谓的动画。 */
    function revealFeet(rail) {
        var feet = rail.querySelectorAll('.' + FOOT_CLASS + ':not(.' + PROBE_CLASS + ')');
        if (!feet.length) return;

        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (!feet[0].animate) return;

        Array.prototype.forEach.call(feet, function (foot, index) {
            var rot = foot.style.transform || 'rotate(0deg)';

            foot.animate([
                { opacity: 0, transform: rot + ' scale(' + FOOT_REVEAL_SCALE + ')' },
                { opacity: 1, transform: rot + ' scale(1)' }
            ], {
                duration: FOOT_REVEAL_DURATION,
                delay: index * (1000 / FOOT_REVEAL_PER_SECOND),
                easing: 'ease-out',
                fill: 'backwards'
            });
        });
    }

    function setOpen(host, open) {
        if (open) {
            host.classList.add(OPEN_CLASS);
        } else {
            host.classList.remove(OPEN_CLASS);
        }
        host.setAttribute('aria-expanded', open ? 'true' : 'false');

        // 展开的瞬间内容刚变成可见，这时才量得到高度，顺手把脚印补齐。
        // rail 上的标记表示“这一次要播挨个出现的动效”（见 6.4）；
        // 素材还没加载完的话，标记会留到 load 回调那次排布时再用。
        if (open) {
            var content = contentOf(host);
            if (content) {
                var rail = railOf(content);
                if (rail) rail.__upfoldReveal = true;
                fillRail(content);
            }
        }
    }

    function toggle(host) {
        setOpen(host, !host.classList.contains(OPEN_CLASS));
    }

    /* 点击是否落在展开出来的正文里（写了几块正文就查几块） */
    function isInsideContent(host, node) {
        if (!node || node.nodeType !== 1) return false;

        var contents = contentsOf(host);
        if (!contents.length) return false;

        var current = node;
        while (current) {
            if (contents.indexOf(current) !== -1) return true;
            current = current.parentNode;
        }
        return false;
    }

    function setup(host) {
        if (host.getAttribute(READY_ATTR) === '1') return;

        // 全部正文块；第一块另外单独取出来给脚印轨道用
        var contents = contentsOf(host);
        var content = contents[0] || null;

        // 无论能不能展开，都先把标签包起来：胶囊外观挂在 .upfold-label 上
        var label = wrapLabel(host, contents);
        // 胶囊上的两枚装饰：素材引用 / 站位 / 尺寸 / 层级都在 6.1、6.2 里给
        injectKid(label);
        injectSword(host, label);
        host.setAttribute(READY_ATTR, '1');

        if (!content) return;              // 没有隐藏内容：静态胶囊，点击无反应

        // 让组件可聚焦、可被读屏识别为可展开控件
        if (!host.hasAttribute('tabindex')) host.setAttribute('tabindex', '0');
        if (!host.hasAttribute('role')) host.setAttribute('role', 'button');
        host.setAttribute('aria-expanded', 'false');

        // 展开文字的排版直接复用 .body-text（见 description.css 第 5 / 13 节）。
        // 每一块正文都要加：只给第一块加的话，第二段以后就没有正文字号 /
        // 行距 / 两端对齐，会掉回页面的默认字体。
        contents.forEach(function (block) {
            if (!block.classList.contains('body-text')) {
                block.classList.add('body-text');
            }
        });

        // 窗口缩放 / 字体变化 / 里面的图片加载完，正文高度都会变，轨道跟着重算
        // （脚印要铺满整块展开区，所以每一块正文都要观察 —— 见 fillRail）
        if (typeof ResizeObserver === 'function') {
            var railObserver = new ResizeObserver(function () { fillRail(content); });
            contents.forEach(function (block) { railObserver.observe(block); });
        } else if (window.addEventListener) {
            window.addEventListener('resize', function () { fillRail(content); }, { passive: true });
        }

        host.addEventListener('click', function (event) {
            // 已展开时，点正文本身不收起，方便选中 / 复制文字
            if (host.classList.contains(OPEN_CLASS) && isInsideContent(host, event.target)) return;
            toggle(host);
        });

        host.addEventListener('keydown', function (event) {
            var key = event.key;
            if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
                event.preventDefault();
                toggle(host);
            } else if (key === 'Escape') {
                setOpen(host, false);
            }
        });
    }

    function initUpfolds() {
        Array.prototype.forEach.call(document.querySelectorAll(HOST_SELECTOR), setup);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initUpfolds);
    } else {
        initUpfolds();
    }

    /* 只读调试接口：
       __UPFOLD__.refresh() 重新扫描组件（例如页面里动态插入了新的 <upfold>）；
       __UPFOLD__.refill()  强制重排脚印（不传参就取页面上第一个 upfold），
       用来验证“排布没变就不重建 DOM、正在播的动效不被打断”这条路径。 */
    window.__UPFOLD__ = {
        refresh: initUpfolds,
        refill: function (host) {
            var target = host || document.querySelector(HOST_SELECTOR);
            var content = target ? contentOf(target) : null;
            if (!content) return false;
            fillRail(content);
            return true;
        }
    };
})();

/* ========================================================
   7. 悬浮装饰（宝剑 / 剑鞘 / BACK TO TOP）：动效与定位
   ========================================================
   这三件装饰的【定位、尺寸、层级、变换、过渡】原先写在 description.css
   第 7 节里，现在整块收到这里，由脚本写成内联样式：

       · 它们的 top 本来就会被第 3 节的滚动 / 拖拽逻辑反复改写，
         参数与改写它的代码放在一起，改一处就够；
       · transition / will-change 是给动效用的参数，也一并归在这里。

   description.css 只留它们的外观：光标、颜色、字体、白空间、
   hover 泛光、object-fit。

   元素本身（<img class="scroll-sword"> / <img class="scroll-scabbard">
   / <div class="scroll-back-to-top">）仍然写在页面 HTML 里 —— 它们分散在
   二十来个页面上，这里只负责把动效参数补上。窄屏隐藏仍然由
   description.css 第 8.3 节的 display: none !important 负责
   （内联样式压不过 !important，所以手机端照样不显示）。

   执行时机：defer 脚本执行时 DOM 已解析完（readyState 为 interactive），
   这里立刻写一遍，紧接着第 3 节的 updateSwordScabbardPosition() 会在
   这个基础上继续按滚动位置改 top。
   ======================================================== */
(function () {
    'use strict';

    /* 三件装饰的动效参数：键名对应页面上的 id */
    var DECOR_STYLE = {
        scrollSword: {
            position: 'fixed',
            right: '0',
            top: '10vh',
            height: '50vh',
            width: 'auto',
            zIndex: '90',
            transform: 'translateX(40%)',
            transition: 'filter 0.2s ease'
        },
        scrollScabbard: {
            position: 'fixed',
            right: '0',
            top: '23vh',
            height: '50vh',
            width: 'auto',
            zIndex: '91',
            transform: 'translateX(30%)',
            willChange: 'top',
            transition: 'filter 0.2s ease'
        },
        scrollBackToTop: {
            position: 'fixed',
            right: '45px',
            top: '23vh',
            zIndex: '92',
            transform: 'translateY(-50%)',
            willChange: 'top, transform',
            transition: 'filter 0.2s ease'
        }
    };

    function applyStyle(el, style) {
        if (!el) return;
        Object.keys(style).forEach(function (key) {
            el.style[key] = style[key];
        });
    }

    function applyScrollDecorStyles() {
        applyStyle(document.getElementById('scrollSword'), DECOR_STYLE.scrollSword);
        applyStyle(document.getElementById('scrollScabbard'), DECOR_STYLE.scrollScabbard);
        applyStyle(document.getElementById('scrollBackToTop'), DECOR_STYLE.scrollBackToTop);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyScrollDecorStyles);
    } else {
        applyScrollDecorStyles();
    }
})();

/* ========================================================
   8. 标题副标题：把 HTML 里的副标题搬到主标题下方
   ========================================================
   配合 description.css 第 14 节。副标题的文字写在 HTML 里，这段脚本只做
   一次结构搬运，外观一律由 CSS 负责。

   HTML 三种写法（页面里可以混用，推荐第 ① 种）：

     ① 直接写在标题标签内部：
        <h1 class="heading-1">Inspiration<span class="heading-sub">Inspiration Sub</span></h1>

     ② 挂在标题属性上：
        <h1 class="heading-1" data-subtitle="Inspiration Sub">Inspiration</h1>

     ③ 自己写成紧跟标题后面的兄弟元素（不依赖本段脚本，页面照原样渲染）：
        <h1 class="heading-1">Inspiration</h1>
        <div class="heading-sub-row"><span class="heading-sub">Inspiration Sub</span></div>

   ① ② 会被本段改写成 ③ 的结构，并给标题加一个 .has-heading-sub 类：

        <h1 class="heading-1 has-heading-sub">Inspiration</h1>
        <div class="heading-sub-row heading-sub-h1">
            <span class="heading-sub">Inspiration Sub</span>
        </div>

   为什么要搬这一下：.heading-1/2/3 是 display: flex 的一行（箭头 + 标题
   文字 + 装饰横线），副标题留在里面就会挤在同一行上。搬到标题外面之后，
   主标题那一行一个节点都没动 —— 字号、颜色、箭头、高度、位置全部保持
   原样，副标题只是下面多出来的一行；行容器是块级的，里面只放【行内】的
   .heading-sub，矩形宽度才会随文字伸缩、换行时每行各自一个圆角框
   （见 description.css 第 14 节）。

   搬到标题外面还有第二个好处：第 2 节用标题的 textContent 生成侧边目录，
   这时副标题已经不在标题里了，侧边栏不会混进副标题文字（第 2 / 4 节另外
   还留了一道 .heading-sub 的过滤，见 headingLabel() 与 visibleTextOnly()）。

   执行时机：本文件是 defer 脚本，执行时 DOM 已解析完（readyState 已是
   interactive），所以这里立刻跑一遍 —— 早于第 2 节在 DOMContentLoaded
   回调里构建目录，页面也不会闪一下“副标题还挤在标题行里”的中间态。
   照第 4 / 5 / 6 / 7 节的写法，仍按 readyState 兜一次普通 <script> 的情况。
   ======================================================== */
(function () {
    'use strict';

    var HEADING_SELECTOR = 'h1.heading-1, h2.heading-2, h3.heading-3, h1.heading-reference';
    var SUB_CLASS = 'heading-sub';
    var ROW_CLASS = 'heading-sub-row';
    var HAS_SUB_CLASS = 'has-heading-sub';
    var SUBTITLE_ATTR = 'data-subtitle';

    /* 标题里写的副标题元素（写法 ①）：只看标题的直接子元素，
       也就是 <h1 …>主标题<span class="heading-sub">副标题</span></h1> 这种。 */
    function subsOf(heading) {
        var subs = [];
        Array.prototype.forEach.call(heading.children, function (child) {
            if (child.classList && child.classList.contains(SUB_CLASS)) subs.push(child);
        });
        return subs;
    }

    /* 这一级标题对应哪一级副标题的样式类（description.css 第 14.3 节） */
    function levelClassOf(heading) {
        if (heading.classList.contains('heading-2')) return 'heading-sub-h2';
        if (heading.classList.contains('heading-3')) return 'heading-sub-h3';
        if (heading.classList.contains('heading-reference')) return 'heading-sub-reference';
        return 'heading-sub-h1';
    }

    function lift(heading) {
        var next = heading.nextElementSibling;

        /* 已经跟在标题后面的行容器：可能是上一次搬出来的，也可能是页面里
           手写的（写法 ③）。有它就复用，绝不重复插。 */
        var row = (next && next.classList && next.classList.contains(ROW_CLASS)) ? next : null;

        var subs = subsOf(heading);

        /* 标题里没有副标题元素，标题后面也没有行容器，就看看属性（写法 ②） */
        if (!subs.length && !row) {
            var text = heading.getAttribute(SUBTITLE_ATTR);
            if (text === null || text.trim() === '') return;   // 这个标题没有副标题

            var span = document.createElement('span');
            span.className = SUB_CLASS;
            span.textContent = text;
            subs.push(span);
        }

        /* 副标题已经在标题外面、标题里也没有多余的元素（写法 ③）：
           补上两个类就行，一个节点都不用搬。 */
        if (!subs.length) {
            row.classList.add(levelClassOf(heading));
            heading.classList.add(HAS_SUB_CLASS);
            return;
        }

        /* 剩下的情况都要把标题里的副标题搬进行容器：没有行容器就新建一个
           插在标题后面（这次搬完，标题里就不会再有 .heading-sub 了）。 */
        if (!row) {
            row = document.createElement('div');
            row.className = ROW_CLASS + ' ' + levelClassOf(heading);
            heading.parentNode.insertBefore(row, heading.nextSibling);
        } else {
            row.classList.add(levelClassOf(heading));
        }

        Array.prototype.forEach.call(subs, function (sub) {
            row.appendChild(sub);
        });

        heading.classList.add(HAS_SUB_CLASS);
    }

    function initHeadingSubs() {
        var scope = document.getElementById('mainContainer') ||
                    document.querySelector('.main-container') ||
                    document;

        Array.prototype.forEach.call(scope.querySelectorAll(HEADING_SELECTOR), lift);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHeadingSubs);
    } else {
        initHeadingSubs();
    }

    /* 只读调试接口：控制台执行 __HEADING_SUB__.refresh() 可重扫一遍
       （例如页面里动态插入了新的标题）。已搬过的标题不会被重复处理。 */
    window.__HEADING_SUB__ = { refresh: initHeadingSubs };
})();

/* ========================================================
   9. 侧边栏下方的静态图标（pole.avif，自己上下浮动）
   ========================================================
   配合 description.css 第 15 节。侧边栏下方那片空白里挂一张静态图标
   （https://static.igem.wiki/teams/6059/wiki/home/pole.avif），让它自己
   缓慢地上下浮动；不点、不拦鼠标，纯粹是这一栏的装饰。

   原先这里是“Kill Switch”组件（suicide.webm 视频 + 绿 / 灰开关，正放 /
   倒放细菌变灰）。换成静态图标后，那套播放机、开关状态机与视频素材一起
   删掉了 —— 本节只剩下“挂在侧边栏下方、跟着侧边栏出现 / 移动、在页脚碰到
   它之前收起”这一件事，浮动本身交给 CSS。

   一、它长在哪儿（与侧边栏绑定的部分）
   ------------------------------------------------------
   组件【不是】侧边栏的子元素：.side-container 是 overflow: hidden 的深蓝
   底板（第 3 / 3.0 节要的就是这个裁切），塞进去会被裁掉。它是一层独立的
   fixed 图层，坐标由下面 9.5 节的 sync() 按侧边栏的【实时位置】算出来：

       left   = 0
       width  = 正文白卡片的左边缘（第 4 节 .main-container 的 margin-left），
                也就是左侧那条空白带的宽度
       top    = 侧边栏当前的下沿 + 一点空隙
       height = 固定值：侧边栏贴在视口 15% 时“视口底部减去 top”的那一段
                （不跟侧边栏一起变高变矮，见 9.5 的 ①）

   所以侧边栏挪到哪儿、滑到哪儿，图标就贴在它的下沿跟到哪儿；正文白卡片
   的左右边界以后改了（比如 des.css 覆盖了 margin），图标也跟着改。

   二、什么时候出现（与侧边栏状态绑定的部分）
   ------------------------------------------------------
   第 2 节把侧边栏的滚动分成三段，图标逐段对应：

       ① 滑入段（mainRect.top > 15vh）：侧边栏的顶边还在 15vh 下面，正跟着
          正文往上走 —— 侧边栏都还没到位，图标也不出现；
       ② 正常段（固定在视口 15%）：侧边栏到位，图标淡入，贴在它下沿；
       ③ 收尾段（底边贴齐正文底边、再往下滚就淡出）：侧边栏的 opacity
          从 1 淡到 0（到底正好归零，见第 2 节的 fadeRange）；图标【不跟】
          着变淡 —— 它贴在侧边栏下沿继续走，直到页脚上沿快碰到它，就直接
          收起（.is-cut），绝不半透明地留在页面上、也绝不被页脚盖掉半截。

   判断依据一律取侧边栏【此刻的真实状态】（computed 的 display /
   visibility + 内联 opacity + getBoundingClientRect），而不是把第 2 节那
   套公式再抄一遍：以后第 2 节的算法怎么改，这里都不用跟着改，两边天然
   永远是同一件事（图标尺寸与页脚避让是本节自己的两条规则，见 9.5）。

   三、上下浮动（纯 CSS，见 description.css 第 15.1 节）
   ------------------------------------------------------
   浮动是一条 @keyframes 跑在 <img> 自己身上（translateY 在 ±--sp-float
   之间来回、无限循环），脚本一行都不用管：不读时间、不写内联样式、也不
   开 rAF。于是：

   · 外壳 .side-pole 的 transform 仍然留给淡入淡出（translateY(10px) → 0），
     与图标自己的浮动互不干扰；
   · 幅度 / 周期都写在 CSS 的 --sp-float / --sp-float-duration 里，
     想调快慢只改那两个变量（本节没有第二份数值）；
   · 系统开了“减少动态效果”时由 CSS 关掉动画（第 15.5 节），图标静止居中。

   ★ 想换素材：只改 9.1 的 ICO_SRC。
   ======================================================== */
(function () {
    'use strict';

    /* ------------------------------------------------------
       9.1 可调参数
       ------------------------------------------------------ */
    /* 图标素材：直接写 CDN 的绝对地址（与第 2 节的 DNA / 蛋白装饰同一写法），
       不依赖本脚本所在目录，页面放到哪一级都能加载 */
    var ICO_SRC = 'https://static.igem.wiki/teams/6059/wiki/home/pole.avif';

    /* 断点与视口比例：必须与 description.css 第 8 节、第 2 节的取值一致 */
    var MOBILE_MAX = 1024;          /* ≤ 它就是窄屏：侧边栏整块隐藏，图标也不显示 */
    var NORMAL_TOP_RATIO = 0.15;    /* 侧边栏的“正常位置” = 视口高度的 15%（第 2 节） */
    var GAP_RATIO = 0.035;          /* 图标与侧边栏下沿之间的空隙（视口高度比例） */
    var BOTTOM_RATIO = 0.02;        /* 图标底边距视口底部的留白（视口高度比例） */
    var MIN_HEIGHT = 96;            /* 算出来的高度比它还小就不显示（窗口太矮时） */
    var FADE_EPS = 0.02;            /* 透明度低于它就算“已经看不见”（与第 2 节判据一致） */
    var FOOTER_GAP = 16;            /* 页脚上沿离图标下沿不到这么多 px 就把图标直接收起
                                       （不让页脚把图标盖掉半截，见 9.5 的 ③） */

    /* ------------------------------------------------------
       9.2 运行时状态
       ------------------------------------------------------ */
    var side = null;        /* #sideContainer：位置与透明度的来源 */
    var main = null;        /* #mainContainer：只用来量左侧空白带的宽度 */
    var foot = null;        /* 页脚 <footer>：图标不许被它盖住（见 9.5 的 ③） */
    var el = null;          /* 外壳 .side-pole */
    var ico = null;         /* <img class="side-pole__ico"> */
    var gutter = 0;         /* 左侧空白带的宽度（px），随窗口尺寸重算 */
    var broken = false;     /* 图标加载不出来：整块收起来，不留空壳 */

    /* ------------------------------------------------------
       9.3 图标加载失败
       ------------------------------------------------------
       CDN 挂了 / 文件路径不对：整块收起来，宁可什么都不显示，也不在侧边栏
       下面留一个 img 的破图图标。 */
    function onIcoError() {
        broken = true;
        hideComponent();
    }

    /* ------------------------------------------------------
       9.4 造 DOM
       ------------------------------------------------------
       外壳 → 一张图标。全部由脚本建，页面 HTML 里一个字都不用写
       （见 CSS 第 15 节开头的说明）。
       图标是纯装饰：alt 为空 + 外壳 aria-hidden，读屏器完全跳过。 */
    function build() {
        if (el) return;

        el = document.createElement('div');
        el.className = 'side-pole';
        el.id = 'sidePole';
        el.setAttribute('aria-hidden', 'true');

        ico = document.createElement('img');
        ico.className = 'side-pole__ico';
        ico.src = ICO_SRC;
        ico.alt = '';
        ico.decoding = 'async';
        ico.setAttribute('draggable', 'false');
        ico.addEventListener('error', onIcoError);

        el.appendChild(ico);
        document.body.appendChild(el);
    }

    /* ------------------------------------------------------
       9.5 位置、尺寸与显隐：与侧边栏的三段滚动对齐
       ------------------------------------------------------
       全部从侧边栏【此刻的真实状态】推出来（见本节开头“二”），组件自己不
       再重算一套公式：

         · 窄屏 / 图标坏了                → 不显示；
         · 侧边栏 display: none 或不可见  → 不显示（例如目录为空时的 .is-empty）；
         · 侧边栏顶边还在 15vh 下面       → ① 滑入段，不显示；
         · 侧边栏 opacity ≤ 0.02          → 页尾淡出已经走完，不显示；
         · 页脚上沿离图标下沿不到 FOOTER_GAP
                                          → 立刻收起（见下面的说明）；
         · 其余（② 正常段 / ③ 收尾段）    → 显示，贴在侧边栏下沿。

       三件事与以前不同，都是一次只做一件、互不牵连：

       ① 尺寸固定。以前 height = 视口底部 − 图标上沿，而图标上沿跟着侧边栏的
          下沿走：侧边栏在页尾往上收（底边贴齐正文卡片）时，这段高度会从
          ≈176px 长到 ≈310px，图标跟着放大 1.7 倍。现在只按“侧边栏贴在
          15% 那一刻”的高度算（fixedHeight），之后无论侧边栏怎么滑，
          图标都是同一个尺寸、跟着上下移动。
       ② 不再跟侧边栏一起变淡。以前把侧边栏的内联 opacity 直接写给图标，
          于是页尾那段里图标会半透明地留在页面上。现在图标要么整块在（CSS
          的 opacity: 1），要么被收起；侧边栏自己的淡出与它无关。
       ③ 页脚快碰到时就收起。图标是左侧空白带里的装饰，页脚又从最下面整条
          升上来（footer 的 z-index: 40 高于图标的 9），两者的边缘一交叠，
          图标就会被页脚从下往上“吃掉”半截 —— 看着像被裁掉了一块。所以
          在页脚上沿离图标下沿不足 FOOTER_GAP 时直接收起（.is-cut，不做
          渐变），宁可整块消失，也不留半截露在页脚上。

       抖动 / 高度不够（窗口太矮）也一并按“不显示”处理，绝不半截露在外面。 */
    function sync() {
        if (!el) return;

        if (window.innerWidth <= MOBILE_MAX || broken) { hideComponent(); return; }

        var cs = window.getComputedStyle(side);
        if (cs.display === 'none' || cs.visibility !== 'visible') { hideComponent(); return; }

        var rect = side.getBoundingClientRect();
        var vh = window.innerHeight;
        var normalTop = vh * NORMAL_TOP_RATIO;

        /* ① 滑入段：侧边栏还没滑到正常位置 —— 图标也不出现 */
        if (rect.top > normalTop + 1) { hideComponent(); return; }

        /* 页尾：侧边栏本体已经被第 2 节淡到看不见了 —— 图标不单独留在页面上 */
        var opacity = parseFloat(side.style.opacity);
        if (isNaN(opacity)) opacity = 1;
        if (opacity <= FADE_EPS) { hideComponent(); return; }

        /* 尺寸：固定成“侧边栏贴在视口 15%”那一刻的高度（见上面 ①） */
        var fixedHeight = (vh - vh * BOTTOM_RATIO) -
                          (vh * NORMAL_TOP_RATIO + rect.height + vh * GAP_RATIO);
        if (fixedHeight < MIN_HEIGHT) { hideComponent(); return; }

        var top = rect.bottom + vh * GAP_RATIO;
        var bottom = top + fixedHeight;

        /* 页脚快碰到图标下沿：直接收起（见上面 ③） */
        var footerTop = foot ? foot.getBoundingClientRect().top : Infinity;
        if (footerTop - bottom < FOOTER_GAP) { hideNow(); return; }

        el.style.left = '0px';
        el.style.width = gutter + 'px';
        el.style.top = Math.round(top) + 'px';
        el.style.height = Math.round(fixedHeight) + 'px';

        el.classList.remove('is-cut');
        el.classList.add('is-visible');
        /* 不透明度回到 CSS 的 opacity: 1（见上面 ②）：图标不跟侧边栏一起变淡 */
        el.style.opacity = '';
    }

    /* 收起来：摘掉 .is-visible，CSS 回到 opacity: 0 并延迟隐藏（走 0.2s 过渡） */
    function hideComponent() {
        if (!el) return;
        el.classList.remove('is-visible');
        el.classList.remove('is-cut');
        el.style.opacity = '';
    }

    /* 立刻收起：不做任何过渡（见上面 ③）。页脚要碰到图标时用它 ——
       200ms 的淡出在这条路径上反而会让图标“先被页脚盖住、再慢慢淡掉”。 */
    function hideNow() {
        if (!el) return;
        el.classList.remove('is-visible');
        el.classList.add('is-cut');
        el.style.opacity = '';
    }

    /* 左侧空白带的宽度 = 正文白卡片的左边缘（第 4 节 .main-container 的
       margin-left）。它只在窗口尺寸变化时变，所以单独量一次缓存起来，
       滚动时不再读。量不出来（布局还没好）就按桌面档的 17% 兜底。 */
    function measure() {
        gutter = 0;

        if (main) {
            var r = main.getBoundingClientRect();
            if (r.left > 0) gutter = Math.round(r.left);
        }

        if (gutter < 40) gutter = Math.round(window.innerWidth * 0.17);
    }

    /* 滚动 / 缩放都合并到一帧里算：第 2 节先写好侧边栏的内联样式，本节在
       同一个 rAF 里读它的结果并写图标的位置，画到屏幕上时两边是同一帧。 */
    var rafId = null;

    function schedule() {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(function () {
            rafId = null;
            sync();
        });
    }

    /* ------------------------------------------------------
       9.6 启动
       ------------------------------------------------------
       ★ 必须等 DOMContentLoaded 之后再跑，不能像第 4~8 节那样“readyState
         不是 loading 就立刻跑”：defer 脚本执行时 readyState 是 interactive，
         而【目录】与【侧边栏的内联 top / opacity】都是第 2 节在它自己的
         DOMContentLoaded 回调里才建好 / 写上的。本节抢在前面跑的话：

           · #tocNav 还是空的 → 第 3.2 节的 .side-container:has(.toc-nav:empty)
             让侧边栏 display: none；
           · 本节 sync() 一看“侧边栏不显示”就把图标收起来；
           · 而后面再没有滚动 / 缩放事件来唤醒它 → 图标永远不出现。

         所以这里（连同下面 load 上的一次兜底重算）都统一排到那两个事件
         之后：定时器 / 事件回调注册的先后顺序保证了第 2 节的回调一定先
         执行完（它在文件开头就注册了）。 */
    function start() {
        side = document.getElementById('sideContainer');
        main = document.getElementById('mainContainer') ||
               document.querySelector('.main-container');
        /* 页脚：图标在它升上来之前就要收起（见 9.5 的 ③）。页面上没有
           <footer> 时保持 null，判定里按 Infinity 处理 —— 图标正常显示。 */
        foot = document.querySelector('footer');

        /* 没有侧边栏的页面（页面上没有 <aside class="side-container">）什么都不做 */
        if (!side || !main) return;

        /* 脚本被重复加载时只建一次 */
        if (document.getElementById('sidePole')) return;

        build();
        measure();
        sync();

        /* 目录被清空 → 侧边栏整块隐藏（第 3.2 节的 .is-empty）：图标跟着消失 */
        if (typeof MutationObserver === 'function') {
            new MutationObserver(schedule).observe(side, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
    }

    if (document.readyState === 'loading' || document.readyState === 'interactive') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
        /* 脚本比 DOMContentLoaded 还晚到（被动态注入等）：这时第 2 节的
           回调早就跑完了，直接算一遍即可；再补一帧防止样式还没上屏。 */
        schedule();
    }

    /* 图片 / 字体都就位之后再算一次：布局高度定下来，位置才是最终值 */
    window.addEventListener('load', function () {
        measure();
        schedule();
    }, { passive: true });

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', function () {
        measure();
        schedule();
    }, { passive: true });

    /* 只读调试接口：
       __SIDE_POLE__.sync()   立刻重算一次位置 / 透明度；
       __SIDE_POLE__.state()  看当前状态（是否显示、左侧空白带多宽、图标是否加载失败）。 */
    window.__SIDE_POLE__ = {
        sync: function () {
            measure();
            sync();
            return el ? el.className : null;
        },
        state: function () {
            return {
                gutter: gutter,
                broken: broken,
                visible: !!(el && el.classList.contains('is-visible'))
            };
        }
    };
})();
