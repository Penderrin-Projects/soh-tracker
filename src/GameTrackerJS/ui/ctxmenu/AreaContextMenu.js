// frameworks
import ContextMenu from "/emcJS/ui/overlay/ContextMenu.js";

export default class AreaContextMenu extends ContextMenu {

    connectedCallback() {
        super.loadItems([
            {menuAction: "check", content: "Check All"},
            {menuAction: "uncheck", content: "Uncheck All"},
            "splitter",
            {menuAction: "setwoth", content: "Set WOTH"},
            {menuAction: "setbarren", content: "Set Barren"},
            {menuAction: "clearhint", content: "Clear Hint"}
        ]);
    }

    loadItems() {
        // nothing
    }

}

customElements.define("gt-ctxmenu-area", AreaContextMenu);
