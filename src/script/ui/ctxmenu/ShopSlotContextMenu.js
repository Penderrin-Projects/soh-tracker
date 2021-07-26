// frameworks
import ContextMenu from "/emcJS/ui/overlay/ContextMenu.js";

export default class ShopSlotContextMenu extends ContextMenu {

    connectedCallback() {
        super.loadItems([
            {menuAction: "check", content: "Check"},
            {menuAction: "uncheck", content: "Uncheck"},
            "splitter",
            {menuAction: "associate", content: "Set Item"},
            {menuAction: "junk", content: "Set Junk"},
            {menuAction: "disassociate", content: "Clear Item"}
        ]);
    }

    loadItems() {
        // nothing
    }

}

customElements.define("ootrt-ctxmenu-shopslot", ShopSlotContextMenu);
