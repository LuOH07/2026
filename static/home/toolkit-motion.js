/* Replaces tool.webm in motion mode; shared with the standalone preview. */
(function () {
    "use strict";
    window.createHomeToolkitMotion = function () {
        const stage = document.createElement("div");
        stage.className = "bug-icon bug-icon-motion bug-icon-motion--toolkit";
        stage.setAttribute("role", "img");
        stage.setAttribute("aria-label", "工具箱打开，锤子与两把剪刀向两侧飞出");
        const base = "https://static.igem.wiki/teams/6059/wiki/home/";
        for (const [layer, file] of [
            ["body", "toolkit"], ["hammer", "hammer"],
            ["scissor-left", "scissor-right"], ["scissor-right", "scissor-right"],
            ["cover-left", "toolkit-leftcover"], ["cover-right", "toolkit-rightcover"]
        ]) {
            const image = document.createElement("img");
            image.className = "toolkit-motion__" + layer;
            image.src = base + file + ".avif";
            image.alt = "";
            image.draggable = false;
            stage.appendChild(image);
        }
        // Homepage scrubs one paused timeline; the preview may still autoplay.
        let scrollAnimations = null;
        stage.setProgress = function (progress) {
            if (!scrollAnimations) {
                stage.classList.add("is-playing");
                scrollAnimations = stage.getAnimations({ subtree: true });
                scrollAnimations.forEach(animation => animation.pause());
            }
            const fraction = Math.max(0, Math.min(1, progress));
            scrollAnimations.forEach(animation => {
                const duration = Number(animation.effect.getComputedTiming().endTime);
                animation.currentTime = fraction * duration;
            });
        };
        return stage;
    };
}());
