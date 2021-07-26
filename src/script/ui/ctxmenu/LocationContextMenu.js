// frameworks
import ContextMenu from "/emcJS/ui/overlay/ContextMenu.js";

export default class LocationContextMenu extends ContextMenu {

    connectedCallback() {
        super.loadItems([
            {menuAction: "check", content: "Check"},
            {menuAction: "uncheck", content: "Uncheck"},
            "splitter",
            {menuAction: "associate", content: "Set Item"},
            {menuAction: "disassociate", content: "Clear Item"},
            "splitter",
            {menuAction: "show_logic", content: "Show Logic"}
        ]);
    }

    loadItems() {
        // nothing
    }

}

customElements.define("ootrt-ctxmenu-location", LocationContextMenu);
