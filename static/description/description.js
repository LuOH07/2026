document.addEventListener('DOMContentLoaded', () => {

    /* 移动端（宽度 <= 820px，与 description.css 第 8 节断点保持一致）：
       侧边目录与滚动剑/剑鞘均由 CSS 隐藏，这里直接跳过相关逻辑，
       避免对隐藏元素做无用的布局读写。首屏 canvas 在两端都会绘制。 */
    const mobileViewport = window.matchMedia('(max-width: 820px)');
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
         * PC 端（宽度 > 820px）与 static/members/title/title.js 完全一致：
         * THEME、CEILING_H_STEPS、WALL_V_STEPS、resizeCanvas、
         * drawInfiniteCeiling、drawInfiniteSideWalls、drawGrid 的取值、
         * 参数顺序与绘制顺序逐行对应，改动 title.js 时这里同步即可。
         * 窄屏几何见 drawNarrowHeroGrid，仅作用于 ≤820px 的窗口（那时
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
            if (window.innerWidth <= 820) {
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

            // 窄屏（≤820px）另用一套几何，PC 分支不受影响
            if (window.innerWidth <= 820 && h < w * 1.4) {
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
     * ------------------------------------------------------------- */
    const tocNav = document.getElementById('tocNav');
    const mainContainer = document.getElementById('mainContainer');
    const sideContainer = document.getElementById('sideContainer');

    if (!tocNav || !mainContainer) return;

    if (sideContainer && !isMobile()) {
        const updateSidebarPosition = () => {
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
                // 渐隐滚动的缓冲行程（160px 行程提供最自然的滚轮过渡感）
                const fadeRange = 160;
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
    if (headings.length === 0) return;

    // 移动端隐藏了侧边目录，直接跳过目录构建（标题 id 已全部写好，锚点依然可用）
    if (isMobile()) return;

    tocNav.innerHTML = '';

    let h1Index = 0;
    let h2Index = 0;
    let h3Index = 0;
    let refIndex = 0;

    const activeChainMap = {};
    let currentH1Id = null;
    let currentH2Id = null;

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
        tocItem.title = heading.textContent.trim();

        if (isH1 || isRef) {
            const circle = document.createElement('span');
            circle.className = 'toc-circle';
            circle.setAttribute('aria-hidden', 'true');

            const text = document.createElement('span');
            text.className = 'toc-text';
            text.textContent = heading.textContent.trim();

            tocItem.appendChild(circle);
            tocItem.appendChild(text);
        } else if (isH2) {
            const text = document.createElement('span');
            text.textContent = heading.textContent.trim();
            text.className = 'toc-text';

            const triangle = document.createElement('span');
            triangle.className = 'toc-triangle';
            triangle.setAttribute('aria-hidden', 'true');

            tocItem.appendChild(text);
            tocItem.appendChild(triangle);
        } else if (isH3) {
            const text = document.createElement('span');
            text.className = 'toc-text';
            text.textContent = heading.textContent.trim();

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

    const centerTocItemInSidebar = (item) => {
        if (!sideContainer || !item) return;
        const containerRect = sideContainer.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        const itemCenterOffset = (itemRect.top - containerRect.top) + (itemRect.height / 2);
        const containerCenter = containerRect.height / 2;
        const targetScrollTop = sideContainer.scrollTop + (itemCenterOffset - containerCenter);

        sideContainer.scrollTo({
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
                sideContainer.scrollTo({
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