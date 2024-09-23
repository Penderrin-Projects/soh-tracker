import DataGridCell from "/emcJS/ui/dataview/datagrid/components/cell/DataGridCell.js";
import TPL from "./DataGridCellAPItem.js.html" assert {type: "html"};
import STYLE from "./DataGridCellAPItem.js.css" assert {type: "css"};

export default class DataGridCellAPItem extends DataGridCell {

    #valueEl;

    constructor(dataGridId) {
        super(dataGridId);
        this.shadowRoot.getElementById("content").append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#valueEl = this.shadowRoot.getElementById("value");
    }

    set value(val) {
        this.setJSONAttribute("value", val);
    }

    get value() {
        return this.getJSONAttribute("value");
    }

    onValueChange(value) {
        if (value == null) {
            this.#valueEl.innerText = "";
            this.#valueEl.className = "";
        } else {
            const {item, itemClass} = value;
            this.#valueEl.innerText = item;
            this.#valueEl.className = `item-${itemClass}`;
        }
    }

}

DataGridCell.registerCellType("apitems", DataGridCellAPItem, 200);
customElements.define("ootrt-grid-datagrid-cell-apitems", DataGridCellAPItem);
