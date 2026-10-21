/* ==========================================================================
   text-23 的配套效果：左蛋白 → 箭头（从左往右扫开）→ 右盒子和蛋白
   --------------------------------------------------------------------------
   这一整段是 6.js 自己建 DOM、自己算的，和 3.js 的图标系统互不影响；
   素材只有一个文件里写死（下面的 ASSETS），想换图只改那三行。

   ★ 时间轴完全跟着 text-23：
        A（开始淡入） → H（淡入结束） → B（开始淡出） → E（完全消失）
      - 整组透明度 = text-23 的透明度包络（同一条 easeOut / 1-easeOut 曲线）；
      - 左蛋白从 A 开始跟着文字一起亮；
      - 箭头在【淡入窗口】的 25% ~ 65% 里从左往右扫开；
      - 盒子和右蛋白在淡入窗口的 65% ~ 100% 里出现 ——
        也就是 text-23 完全亮起来（H）时，三件已经全部到位并一直待到淡出；
      - 文字开始淡出（B）时三件一起随文字暗下去，E 时完全消失。
      ★ 为什么把三段压在淡入窗口里：text-23 在页面最末尾，用户滚到它面前时
        往往看到字就停手了。如果盒子要等到“停留窗口”过一半才出现，很容易
        以为它根本没做出来。现在只要 text-23 完整出现，盒子就一定在画面上。

   ★ “绑在滚轮上”：上面这些时刻全用 1.js 的进度（cur / freezePos）算，
     不是定时器 —— 往下滑往前走、往上滑倒着退回，滚轮停手画面就停住。

   ★ 两段一直在动的“小幅循环”（和滚轮无关，只在这组可见时跑）：
      - 左蛋白：原地轻轻放大缩小（LEFT_BREATH）；
      - 右蛋白：在盒子里“往下 + 缩小 → 往上 + 放大”反复（RIGHT_LOOP），
        盒子画在它上面，所以下沉时会被盒子的前挡板挡住，看起来像钻进盒子。

   ★ 所有静态位置都在 6.css 里用【画面百分比】写，画面本身由 text-23 的
     渲染盒量出来（见 layoutScene）：
        - 屏幕 / 字号 / 手机版 5.js 怎么变，画面都贴在文字正下方、同宽居中；
        - 不会出现“文字换行了、图还在老位置”的错位。
     ★ 本文件只写每帧会变的量（left/top/width/height/opacity/transform），
       静态的 left / top / width / z-index 一律留在 6.css。
   ========================================================================== */

(function () {
    "use strict";

    /* ======================= 0. 可调参数 ======================= */

    /* 素材：都在 iGEM 的静态图床（和页面别的图标同一套地址） */
    const ASSETS = {
        protein: "https://static.igem.wiki/teams/6059/wiki/home/tnpb-3.avif",
        box: "https://static.igem.wiki/teams/6059/wiki/home/opentoolkit.avif",
        arrow: "https://static.igem.wiki/teams/6059/wiki/home/arrow-1.avif"
    };

    /* 认哪一句文字（text-23） */
    const HOST_SEL = ".text-23";

    /* 画面高 ÷ 宽。6.css 的 --t23-h-ratio 是同一个数（这里会读 CSS 的值，
       读不到才用这个兜底）。0.40 ≈ 需求图里三件图案的紧凑包围盒比例。 */
    const SCENE_H_RATIO_FALLBACK = 0.40;

    /* 画面贴在 text-23 下沿的间距：画面宽度的 3%，夹在 8px ~ 视口高 3.5% 之间。
       想更贴近文字就调小，想离远一点就调大。 */
    const GAP_RATIO = 0.03;
    const GAP_MIN = 8;
    const GAP_MAX_VH = 0.035;

    /* 左右 / 下方留白：画面不会顶到屏幕边缘 */
    const SIDE_PAD_RATIO = 0.02;
    const SIDE_PAD_MAX = 24;
    const BOTTOM_PAD_RATIO = 0.02;
    const BOTTOM_PAD_MAX = 24;

    /* 页面底部有 <footer> 时，画面不能画到页脚上面去（这个站点的页脚是
       z-index: 40 的普通文档流元素，而本效果只有 3，会被页脚盖住）。
       所以把“可用下边界”改成 min(视口底, 页脚顶 - 这个留白)。
       页面没有 footer（比如纯静态预览）时这段自动不生效。 */
    const FOOTER_GAP = 10;

    /* 三段的先后（单位 = text-23 的【淡入窗口】 H - A，也就是 0.6 秒那段）：
       左蛋白从 A 开始亮；箭头在淡入窗口的 25% 处冒头、65% 处扫完；
       盒子紧接着在 65% 处开始出现，到 100%（= 文字完全亮起）时到位。
       ★ 这样“文字一亮起来，盒子就已经在画面上”，不会出现“滚到 text-23
         只看到蛋白和箭头、以为盒子没做”的情况。
       想整体更慢 / 更晚：把这四个数往右挪（boxEnd > 1 表示拖到停留窗口里）；
       想更快：整体往左挪。 */
    const PHASE = {
        arrowStart: 0.25,
        arrowEnd: 0.65,
        boxStart: 0.65,
        boxEnd: 1.00
    };

    /* 左蛋白的呼吸：幅度 ±4%、周期 3.4 秒（正弦，来回都很柔） */
    const LEFT_BREATH = { amp: 0.04, period: 3.4 };

    /* 右蛋白在盒子里的循环：
        period  ：一次“下沉再上来”多少秒；
        scaleMin：沉到最下面时是原来的多少倍（0.58 = 缩小到六成）；
        travel  ：往下走多远，单位是【画面宽度】的倍数（0.07 ≈ 盒子的 1/5 高）。
       它从 top 起点开始：先往下缩，再往上长，循环往复。
       ★ 周期不要长过 text-23 的可见时间（正常速度下约 4 秒）：
         2.1 秒能完整看到一次“下去 → 上来”，慢滚时还会多循环几遍。 */
    const RIGHT_LOOP = { period: 2.1, scaleMin: 0.58, travel: 0.07 };

    /* 盒子 / 右蛋白“出现”时从 0.92 倍长到 1 倍；左蛋白从 0.94 倍长到 1 倍 */
    const APPEAR_SCALE = { left: 0.94, box: 0.92 };

    /* ======================= 1. 小工具 ======================= */
    const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
    const clamp01 = v => clamp(v, 0, 1);
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    /* 箭头遮罩用 easeInOut：先慢、中间快、最后收住 —— 左半边不会“一下子全亮”，
       能看清“从左边扫到右边”的过程（透明度仍然用 easeOut，和文字同步）。 */
    const easeInOut = t => (t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2);

    /* ======================= 2. 造 DOM =======================
       结构（顺序 = 画面里的上下层，CSS 里另有 z-index 兜底）：
           .t23-scene
             <img class="t23-part t23-left">    左蛋白
             <img class="t23-part t23-arrow">   箭头
             <img class="t23-part t23-right">   右蛋白（在盒子下面）
             <img class="t23-part t23-box">     盒子（压住右蛋白）
       容器 append 到 body；它是 position: fixed + pointer-events: none，
       纯装饰，不参与文字排版，也不挡滚轮 / 选中 / 悬停。
       ========================================================================= */
    const scene = document.createElement("div");
    scene.className = "t23-scene";
    scene.setAttribute("aria-hidden", "true");

    function makePart(cls, src, name) {
        const img = document.createElement("img");
        img.className = "t23-part " + cls;
        img.src = src;
        img.alt = "";
        img.decoding = "async";
        img.draggable = false;
        img.addEventListener("error", () => {
            console.error("[home] text-23 配套效果素材加载失败：", name, src);
        });
        return img;
    }

    const leftProtein = makePart("t23-left", ASSETS.protein, "左蛋白");
    const arrow = makePart("t23-arrow", ASSETS.arrow, "箭头");
    const rightProtein = makePart("t23-right", ASSETS.protein, "右蛋白");
    const box = makePart("t23-box", ASSETS.box, "盒子");

    scene.appendChild(leftProtein);
    scene.appendChild(arrow);
    scene.appendChild(rightProtein);
    scene.appendChild(box);
    document.body.appendChild(scene);

    /* ======================= 3. 读 1.js 的时间轴 ======================= */

    /* 在 1.js 的 items 里找 text-23 那一段（不缓存：resize / 5.js 重排后
       1.js 会把 items 整条重建，缓存的对象会失效）。 */
    function findHost() {
        const h = window.__home;
        const list = h && h.items;
        if (!list || !list.length) return null;
        for (let i = 0; i < list.length; i++) {
            const it = list[i];
            if (!it || !it.el || typeof it.el.matches !== "function") continue;
            try {
                if (it.el.matches(HOST_SEL)) return it;
            } catch (err) {
                console.warn("[home] text-23 配套效果：选择器无效", err);
                return null;
            }
        }
        return null;
    }

    /* 这一帧用哪个时钟：和 1.js render() / 3.js clockOf() 完全一致。
       text-23 目前不在冻结组里，所以正常就是 cur；留着这句是为了以后
       万一把它加进 FREEZE_GROUPS，效果也不会突然跟错时间轴。 */
    function clockOf(it) {
        const h = window.__home;
        if (h.freezeActive && it.freezeZone && it.freezeZone === h.frozenZone) return h.freezePos;
        return h.cur;
    }

    /* ======================= 4. 画面几何：贴着 text-23 的下方 =======================
       每帧只量一次 text-23 的 getBoundingClientRect()（1.js 刚写完 transform，
       量到的就是它这一帧在屏幕上的真实位置 / 真实高度）：
         · 宽度 = 文字盒子宽度（桌面 60% 屏宽、手机 100% 屏宽都自动适配）；
         · 高度 = 宽度 × --t23-h-ratio；
         · 左 = 和文字盒子【同中心】；
         · 上 = 文字盒子下沿 + 间距。
       屏幕太矮 / 大字把文字撑得很高时，按“还能用多少高度”把整组等比缩小，
       但永远保持“在文字下方”，不会跑到文字上面去。
       ========================================================================= */
    let sceneRatio = SCENE_H_RATIO_FALLBACK;
    let ratioRead = false;

    function readSceneRatio() {
        const raw = getComputedStyle(scene).getPropertyValue("--t23-h-ratio");
        const v = parseFloat(raw);
        sceneRatio = (isFinite(v) && v > 0) ? v : SCENE_H_RATIO_FALLBACK;
        ratioRead = true;
    }

    let lastGeom = { left: NaN, top: NaN, w: NaN, h: NaN };
    let footerEl = null;
    let footerLookedUp = false;

    /* 找页面页脚（只找一次；这个站点首页一定有 <footer>，纯静态预览时没有） */
    function getFooter() {
        if (!footerLookedUp) {
            footerEl = document.querySelector("footer");
            footerLookedUp = true;
        }
        return footerEl;
    }

    function layoutScene(hostEl) {
        if (!ratioRead) readSceneRatio();

        const rect = hostEl.getBoundingClientRect();
        if (!rect || !rect.width || !rect.height) return false;

        const vw = window.innerWidth || document.documentElement.clientWidth || 1;
        const vh = window.innerHeight || document.documentElement.clientHeight || 1;

        const sidePad = Math.min(SIDE_PAD_MAX, vw * SIDE_PAD_RATIO);
        const bottomPad = Math.min(BOTTOM_PAD_MAX, vh * BOTTOM_PAD_RATIO);
        const gap = Math.max(GAP_MIN, Math.min(rect.width * GAP_RATIO, vh * GAP_MAX_VH));

        /* 宽度先跟文字同宽（再留一点边），高度按比例 */
        let w = Math.min(rect.width, Math.max(1, vw - 2 * sidePad));
        let h = w * sceneRatio;
        let top = rect.bottom + gap;

        /* 下边界：视口底部，或者页脚顶边（哪个更靠上就用哪个）。
           ★ 页脚进入视口后，整组会按剩余高度等比缩小、仍然完整待在
             文字下方和页脚上方，不会被深色页脚切掉一截。 */
        let bottomLimit = vh - bottomPad;
        const footer = getFooter();
        if (footer) {
            const fr = footer.getBoundingClientRect();
            if (fr.height > 0 && fr.top > 0 && fr.top < vh) {
                bottomLimit = Math.min(bottomLimit, fr.top - FOOTER_GAP);
            }
        }

        /* 下面放不下：先用剩余高度把整组等比缩小 */
        if (top + h > bottomLimit) {
            const avail = bottomLimit - top;
            if (avail >= Math.max(80, vh * 0.14)) {
                h = avail;
                w = h / sceneRatio;
            } else {
                /* 极端情况（横屏手机 / 超大字号）：高度给一个下限，画面底边贴住
                   屏幕下方，但仍然从文字下沿往下放（宁可小一点，也不压到文字）。 */
                h = Math.max(80, Math.min(vh * 0.14, bottomLimit - Math.max(top, 0)));
                w = h / sceneRatio;
                top = Math.max(rect.bottom + Math.min(gap, 6), bottomLimit - h);
            }
        }

        if (!(w > 0) || !(h > 0)) return false;

        let left = rect.left + rect.width / 2 - w / 2;
        left = clamp(left, sidePad, Math.max(sidePad, vw - sidePad - w));

        /* 只在真的变了才写 DOM（页面停住时基本不写，省合成开销） */
        const rounded = {
            left: Math.round(left * 100) / 100,
            top: Math.round(top * 100) / 100,
            w: Math.round(w * 100) / 100,
            h: Math.round(h * 100) / 100
        };
        if (rounded.left !== lastGeom.left) scene.style.left = rounded.left + "px";
        if (rounded.top !== lastGeom.top) scene.style.top = rounded.top + "px";
        if (rounded.w !== lastGeom.w) {
            scene.style.width = rounded.w + "px";
            /* 阴影半径等用 --t23-u（= 画面宽 / 1440，和全站 --u 的意义一致） */
            scene.style.setProperty("--t23-u", (w / 1440).toFixed(4) + "px");
        }
        if (rounded.h !== lastGeom.h) scene.style.height = rounded.h + "px";
        lastGeom = rounded;

        return true;
    }

    /* ======================= 5. 箭头：从左往右扫开 =======================
       用的是和 3.js 图标 7 同一种“柔性遮罩”：
         r = easeOut(q) 从 0 → 1，遮罩的实心区右边缘从最左边扫到最右边，
         实心区后面再留 feather 宽的一段渐变，扫过去的地方不会是一条硬边。
       q = 1 之后直接 mask: none，后面的渲染不再受遮罩影响。
       ========================================================================= */
    const ARROW_FEATHER = 0.18;
    let arrowMask = "";

    function paintArrowReveal(q) {
        if (q >= 1) {
            if (arrowMask !== "none") {
                arrowMask = "none";
                arrow.style.webkitMaskImage = "none";
                arrow.style.maskImage = "none";
            }
            return;
        }
        const r = easeInOut(clamp01(q));
        const solid = Math.min(100, r * 100);
        const fade = Math.min(100, (r + ARROW_FEATHER) * 100);
        const m = "linear-gradient(90deg, #000 0%, #000 " + solid.toFixed(2) +
            "%, transparent " + fade.toFixed(2) + "%, transparent 100%)";
        if (m !== arrowMask) {
            arrowMask = m;
            arrow.style.webkitMaskImage = m;      /* 老 Chrome / Safari 认前缀版 */
            arrow.style.maskImage = m;
        }
    }

    /* ======================= 6. 每帧更新 =======================
       返回 true = 这一组现在可见（6.js 要继续排帧做呼吸 / 循环）。
       dt = 真实经过的秒数；1.js 的 render 触发时传 0（只更新进度 / 位置），
       自发 rAF 循环里传真实 dt（推进呼吸和右蛋白的上下循环）。
       ========================================================================= */
    let live = false;
    let clockT = 0;          /* 这组可见了多久（秒），只驱动两段小幅循环 */
    let rightT0 = 0;         /* 右蛋白循环的起点（盒子出现的那一刻） */
    let boxWasOn = false;    /* 上一帧盒子是否已经出现（用来重置右蛋白循环） */

    function setOpacity(el, v) {
        const s = v <= 0.001 ? "0" : v.toFixed(4);
        if (el.style.opacity !== s) el.style.opacity = s;
    }

    function hideScene() {
        if (scene.style.visibility !== "hidden") scene.style.visibility = "hidden";
        if (scene.style.opacity !== "0") scene.style.opacity = "0";
        setOpacity(leftProtein, 0);
        setOpacity(arrow, 0);
        setOpacity(rightProtein, 0);
        setOpacity(box, 0);
    }

    function updateScene(dt) {
        const it = findHost();
        if (!it) {
            live = false;
            hideScene();
            return false;
        }

        const p = clockOf(it);
        const A = it.A, H = it.H, B = it.B, E = it.E;

        /* ---- 整组的透明度包络：和 1.js 画 text-23 的那条曲线一模一样 ---- */
        let base = 0;
        if (p > A && p < E) {
            if (p < H) {
                base = easeOut((p - A) / Math.max(1e-6, H - A));
            } else if (p < B) {
                base = 1;
            } else {
                base = 1 - easeOut((p - B) / Math.max(1e-6, E - B));
            }
        }

        /* 文字还没轮到 / 已经消失 / 这一帧被 1.js 收起来了 → 整组一起藏 */
        if (base <= 0.001 || it.el.style.visibility === "hidden") {
            live = false;
            hideScene();
            return false;
        }

        /* 刚好从“不可见”变成“可见”：两段循环从头开始，右蛋白先从开口处出现 */
        if (!live) {
            live = true;
            clockT = 0;
            rightT0 = 0;
            boxWasOn = false;
        }
        clockT += dt;

        /* ---- 画面位置：贴着 text-23 下沿（见 layoutScene） ---- */
        if (!layoutScene(it.el)) {
            live = false;
            hideScene();
            return false;
        }

        /* ---- 三段先后（全部用进度算 → 绑在滚轮上，可倒放） ----
           ★ 用【淡入窗口 H - A】当这三段的表尺：
             文字淡入的 0.6 秒里依次放完“左蛋白 → 箭头 → 盒子”，
             所以 p 到 H（文字完全亮起）时盒子已经 100% 到位了。 */
        const fade = Math.max(1e-6, H - A);
        const arrowQ = clamp01(
            (p - (A + fade * PHASE.arrowStart)) /
            (fade * Math.max(1e-6, PHASE.arrowEnd - PHASE.arrowStart))
        );
        const boxQ = clamp01(
            (p - (A + fade * PHASE.boxStart)) /
            (fade * Math.max(1e-6, PHASE.boxEnd - PHASE.boxStart))
        );
        const appear = easeOut(boxQ);
        const leftT = clamp01((p - A) / Math.max(1e-6, H - A));

        const opStr = base.toFixed(4);
        if (scene.style.opacity !== opStr) scene.style.opacity = opStr;
        if (scene.style.visibility !== "visible") scene.style.visibility = "visible";

        /* ---- 左蛋白：淡入跟随文字；之后原地呼吸 ±4% ---- */
        const breath = 1 + LEFT_BREATH.amp * Math.sin((clockT / LEFT_BREATH.period) * Math.PI * 2);
        const leftScale = (APPEAR_SCALE.left + (1 - APPEAR_SCALE.left) * easeOut(leftT)) * breath;
        leftProtein.style.transform = "translate(-50%, -50%) scale(" + leftScale.toFixed(4) + ")";
        setOpacity(leftProtein, 1);

        /* ---- 箭头：透明度 + 从左往右的遮罩；扫完就保持全亮 ---- */
        setOpacity(arrow, easeOut(arrowQ));
        paintArrowReveal(arrowQ);
        if (arrow.style.transform !== "translate(-50%, -50%)") {
            arrow.style.transform = "translate(-50%, -50%)";
        }

        /* ---- 盒子：从 0.92 倍长到 1 倍（和右蛋白同时出现） ---- */
        const boxScale = APPEAR_SCALE.box + (1 - APPEAR_SCALE.box) * appear;
        box.style.transform = "translate(-50%, -50%) scale(" + boxScale.toFixed(4) + ")";
        setOpacity(box, appear);

        /* ---- 右蛋白：在盒子里重复“往下缩小 → 往上放大” ----
           相位 0 → 1：cos 从 1 到 -1 再到 1，sink 就是 0 → 1 → 0：
             sink = 0 在开口处、原大小；sink = 1 沉到最下面、缩到 scaleMin。
           travel 用“画面宽度”换算成 px，所以画面一大一小它都走同样的视觉距离。
           ★ 循环从【盒子出现的那一刻】开始：盒子刚亮起来时蛋白一定在开口处，
             不会一出现就已经沉到一半。往回滚到盒子消失再回来，循环也重新开始。 */
        const boxOn = boxQ > 0.001;
        if (boxOn && !boxWasOn) {
            rightT0 = clockT;
            boxWasOn = true;
        } else if (!boxOn) {
            boxWasOn = false;
            rightT0 = clockT;      /* 盒子还没出现：循环停在起点 */
        }
        const loopT = Math.max(0, clockT - rightT0);
        const cycle = ((loopT / RIGHT_LOOP.period) % 1 + 1) % 1;
        const sink = 0.5 - 0.5 * Math.cos(cycle * Math.PI * 2);
        const travelPx = lastGeom.w * RIGHT_LOOP.travel;
        const rightScale = (1 + (RIGHT_LOOP.scaleMin - 1) * sink) * boxScale;
        rightProtein.style.transform =
            "translate(-50%, -50%) translateY(" + (sink * travelPx).toFixed(2) + "px)" +
            " scale(" + rightScale.toFixed(4) + ")";
        setOpacity(rightProtein, appear);

        return true;
    }

    /* ======================= 7. 自发 rAF：只在这组可见时跑 =======================
       1.js 的 render() 只在滚动 / 缓动时排帧，页面停住时不会每帧画；
       但左蛋白的呼吸和右蛋白的上下循环要一直动，所以这里自己挂一个循环。
       · 可见时才跑，不可见时自动停（不白烧 CPU）；
       · 传真实 dt，页面停住 / 切标签页回来都不会“跳一大步”（dt 有上限）；
       · 滚轮改进度时 1.js 的 render 包装会立刻调一次 updateScene(0)，
         所以进度响应不依赖这个循环，不会慢一帧。
       ========================================================================= */
    let rafId = null;
    let lastTs = 0;
    const MAX_DT = 0.05;     /* 一帧最多按 50ms 算（和 1.js 的 tick 同一个上限） */

    function frame(now) {
        const dt = lastTs > 0 ? Math.min(MAX_DT, Math.max(0, (now - lastTs) / 1000)) : 1 / 60;
        lastTs = now;

        let on = false;
        try {
            on = updateScene(dt);
        } catch (err) {
            console.warn("[home] text-23 配套效果更新出错：", err);
        }

        if (on) {
            rafId = requestAnimationFrame(frame);
        } else {
            rafId = null;
            lastTs = 0;
        }
    }

    function ensureLoop() {
        if (rafId !== null) return;
        lastTs = 0;
        rafId = requestAnimationFrame(frame);
    }

    /* ======================= 8. 挂到 1.js 的渲染循环 =======================
       6.js 在 1.js / 3.js 之后加载，所以这里 window.render 已经是 3.js 包过的
       那一层；再包一层，等文字和图标都画完，最后摆这一组，同一帧、不闪。
       ========================================================================= */
    let hooked = false;
    let fallbackId = null;

    function hook() {
        if (typeof window.render !== "function") return false;
        if (window.render.__t23Scene) return true;

        const original = window.render;
        const wrapped = function () {
            const r = original.apply(this, arguments);
            try {
                if (updateScene(0)) ensureLoop();
            } catch (err) {
                console.warn("[home] text-23 配套效果更新出错：", err);
            }
            return r;
        };
        wrapped.__t23Scene = true;
        window.render = wrapped;
        return true;
    }

    /* 兜底：万一 6.js 被放到 1.js 前面执行，就先自己排帧，等两段脚本都跑完再挂上 */
    function fallbackTick() {
        if (hooked) {
            fallbackId = null;
            return;
        }
        try {
            if (updateScene(0)) ensureLoop();
        } catch (err) {
            /* 1.js 还没就绪时的报错直接忽略 */
        }
        fallbackId = requestAnimationFrame(fallbackTick);
    }

    function attach() {
        if (hooked) return;
        hooked = hook();
        if (hooked) {
            if (updateScene(0)) ensureLoop();
        } else if (fallbackId === null) {
            fallbackId = requestAnimationFrame(fallbackTick);
        }
    }

    /* 窗口尺寸变了：6.css 的 --t23-h-ratio 可能被改，重读一次；
       画面几何下一帧会自己重算。 */
    window.addEventListener("resize", () => {
        ratioRead = false;
    }, { passive: true });

    attach();
    document.addEventListener("DOMContentLoaded", attach, { once: true });
    window.addEventListener("load", attach, { once: true });

    /* 调试接口：控制台里
         __t23Scene.update()   强制刷一帧
         __t23Scene.phase()    看这一刻三段各自的进度
         __t23Scene.LEFT_BREATH / RIGHT_LOOP / PHASE 改完下一帧生效 */
    window.__t23Scene = {
        scene,
        parts: { leftProtein, arrow, rightProtein, box },
        update: () => updateScene(0),
        get phase() {
            const it = findHost();
            if (!it) return null;
            const p = clockOf(it);
            const fade = Math.max(1e-6, it.H - it.A);
            return {
                progress: p,
                arrow: clamp01(
                    (p - (it.A + fade * PHASE.arrowStart)) /
                    (fade * Math.max(1e-6, PHASE.arrowEnd - PHASE.arrowStart))
                ),
                box: clamp01(
                    (p - (it.A + fade * PHASE.boxStart)) /
                    (fade * Math.max(1e-6, PHASE.boxEnd - PHASE.boxStart))
                )
            };
        },
        PHASE,
        LEFT_BREATH,
        RIGHT_LOOP
    };
})();
