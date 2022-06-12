// frameworks
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

export default class ShopSlotContextMenu extends ContextMenu {

    initItems() {
        super.setItems([
            {menuAction: "check", content: "Check"},
            {menuAction: "uncheck", content: "Uncheck"},
            "splitter",
            {menuAction: "associate", content: "Set Item"},
            {menuAction: "junk", content: "Set Junk"},
            {menuAction: "disassociate", content: "Clear Item"}
        ]);
    }

    setItems() {
        // nothing
    }

}

customElements.define("ootrt-ctxmenu-shopslot", ShopSlotContextMenu);
