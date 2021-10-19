// frameworks
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

export default class GossipstoneContextMenu extends ContextMenu {

    initItems() {
        super.loadItems([
            {menuAction: "check", content: "Check"},
            {menuAction: "uncheck", content: "Uncheck"},
            "splitter",
            {menuAction: "sethint", content: "Set Hint"},
            {menuAction: "clearhint", content: "Clear Hint"},
            "splitter",
            {menuAction: "show_logic", content: "Show Logic"}
        ]);
    }

    loadItems() {
        // nothing
    }

}

customElements.define("ootrt-ctxmenu-gossipstone", GossipstoneContextMenu);
