// frameworks
import ContextMenu from "/emcJS/ui/overlay/ctxmenu/ContextMenu.js";

// Track-OOT
import "/script/ui/items/ItemPicker.js";


export default class ItemPickerMenu extends ContextMenu {

    connectedCallback() {
        const itemPickerEl = document.createElement("ootrt-itempicker");
        itemPickerEl.setAttribute("grid", "pickable");
        itemPickerEl.addEventListener("pick", event => {
            const ev = new Event("pick");
            ev.item = event.detail;
            this.dispatchEvent(ev);
            /* --- */
            event.preventDefault();
            return false;
        });
        super.loadItems([itemPickerEl]);
    }

    loadItems() {
        // nothing
    }

}

customElements.define("ootrt-ctxmenu-itempicker", ItemPickerMenu);
