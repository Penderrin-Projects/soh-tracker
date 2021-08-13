// GameTrackerJS
import ExitChoice from "/GameTrackerJS/ui/exit/ExitChoice.js";
// Track-OOT
import ExitBindingMenu from "../ctxmenu/ExitBindingMenu.js";

export default class HTMLTrackerExitChoice extends ExitChoice {

    constructor() {
        super();
        /* --- */
        this.setContextMenu("exitbinding", ExitBindingMenu);
    }

}

customElements.define("ootrt-exitchoice", HTMLTrackerExitChoice);
