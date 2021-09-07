// frameworks
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

export default class ExitContextMenu extends ContextMenu {

    initItems() {
        super.loadItems([
            {menuAction: "associate", content: "Bind Entrance"},
            {menuAction: "deassociate", content: "Unbind Entrance"},
            "splitter",
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

customElements.define("gt-ctxmenu-exit", ExitContextMenu);
