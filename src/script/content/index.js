import PageSwitcher from "../util/PageSwitcher.js";

PageSwitcher.addNavigationMixin("fullscreen", [{
    "content": "TOGGLE FULLSCREEN",
    "handler": toggleFullscreen
}]);

PageSwitcher.addHotkeyHandler("hk_fullscreen", toggleFullscreen);

function toggleFullscreen() {
    if (document.fullscreenEnabled) {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}
