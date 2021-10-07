import NavBar from "/emcJS/ui/navigation/NavBar.js";

NavBar.addMixin("fullscreen", [{
    "content": "TOGGLE FULLSCREEN",
    "handler": () => {
        if (document.fullscreenEnabled) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        }
    }
}]);