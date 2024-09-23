import DataGridCell from "/emcJS/ui/dataview/datagrid/components/cell/DataGridCell.js";
import TPL from "./DataGridCellAPUser.js.html" assert {type: "html"};
import STYLE from "./DataGridCellAPUser.js.css" assert {type: "css"};

export default class DataGridCellAPUser extends DataGridCell {

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
            const {alias, current} = value;
            this.#valueEl.innerText = alias;
            this.#valueEl.className = `player-${current ? "current" : "other"}`;
        }
    }

}

DataGridCell.registerCellType("apuser", DataGridCellAPUser, 200);
customElements.define("ootrt-grid-datagrid-cell-apuser", DataGridCellAPUser);
