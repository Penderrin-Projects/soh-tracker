// frameworks
import ContextMenu from "/emcJS/ui/overlay/ContextMenu.js";

export default class ExitContextMenu extends ContextMenu {

    connectedCallback() {
        super.loadItems([
            {menuAction: "associate", content: "Bind Entrance"},
            {menuAction: "deassociate", content: "Unbind Entrance"}
        ]);
    }

    loadItems() {
        // nothing
    }

}

customElements.define("gt-ctxmenu-exitchoice", ExitContextMenu);
