// GameTrackerJS
import ExitChoice from "/GameTrackerJS/ui/exit/ExitChoice.js";
// Track-OOT
import "../ctxmenu/ExitBindingMenu.js";

export default class HTMLTrackerExitChoice extends ExitChoice {

    constructor() {
        super();
        /* --- */
        this.setContextMenu("exitbinding", document.createElement("ootrt-ctxmenu-exitbinding"));
    }

}

customElements.define("ootrt-exitchoice", HTMLTrackerExitChoice);
