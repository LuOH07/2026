/* Layered title: original media stays available through TOP_TITLE_MODE in 1.js. */
(function () {
    "use strict";
    window.createHomeTitleMotion = function () {
        const stage = document.createElement("div");
        stage.className = "home-title-motion";
        stage.setAttribute("role", "img");
        stage.setAttribute("aria-label", "STING，宝剑穿入标题，实验素材向四周展开");
        const base = "https://static.igem.wiki/teams/6059/wiki/home/";
        const layers = [
            ["sig", "s-i-g"], ["tn", "t-n"], ["sword", "longsword"],
            ["protein-top", "tnpb"], ["protein-bottom", "tnpb"],
            ["tube-blue", "tube-blue"], ["tube-yellow", "tube-yellow"],
            ["bases-top", "ctac"], ["bases-bottom", "ctac"],
            ["pipette-top", "pipette"], ["pipette-bottom", "pipette"]
        ];
        layers.forEach(([name, asset]) => {
            const image = document.createElement("img");
            image.className = "title-part title-part--" + name;
            image.src = base + asset + ".avif";
            image.alt = "";
            image.draggable = false;
            stage.appendChild(image);
        });
        let generation = 0;
        stage.ended = false;
        stage.duration = 3.2;
        stage.currentTime = 0;
        stage.play = async function () {
            const run = ++generation;
            await Promise.race([
                Promise.all([...stage.querySelectorAll("img")].map(img => img.decode().catch(() => {}))),
                new Promise(resolve => setTimeout(resolve, 2500))
            ]);
            if (run !== generation) return;
            stage.ended = false;
            stage.classList.remove("is-animating");
            void stage.offsetWidth;
            stage.classList.add("is-animating");
        };
        stage.addEventListener("animationend", event => {
            if (event.target !== stage || event.animationName !== "home-title-clock") return;
            stage.ended = true;
            stage.currentTime = stage.duration;
            stage.dispatchEvent(new Event("ended"));
        });
        return stage;
    };
}());
