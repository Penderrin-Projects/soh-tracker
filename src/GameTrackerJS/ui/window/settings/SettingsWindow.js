/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import Window from "/emcJS/ui/overlay/Window.js";
import "/emcJS/ui/layout/panel/TabPanel.js";
import "/emcJS/ui/input/ListSelect.js";
/* asym-import: on */
import DataStorage from "../../../storage/DataStorage.js";
import Language from "../../../util/Language.js";
import "./SettingsTabContent.js";

const TPL = new Template(`
<emc-panel-tabpanel id="categories">
</emc-panel-tabpanel>
<div id="footer">
    <button id="submit" title="submit">
        submit
    </button>
    <button id="cancel" title="cancel">
        cancel
    </button>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
#body {
    height: 50vh;
}
#footer,
#submit,
#cancel {
    display: flex;
}
#categories {
    padding: 5px;
    overflow-x: auto;
    overflow-y: none;
}
#footer {
    height: 50px;
    padding: 10px 30px 10px;
    justify-content: flex-end;
    border-top: solid 2px #cccccc;
}
#submit,
#cancel {
    margin-left: 10px;
    padding: 5px;
    border: solid 1px black;
    border-radius: 2px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-appearance: none;
}
#submit:hover,
#cancel:hover {
    color: white;
    background-color: black;
}
`);

const Q_TAB = [
    "button:not([tabindex=\"-1\"])",
    "[href]:not([tabindex=\"-1\"])",
    "input:not([tabindex=\"-1\"])",
    "select:not([tabindex=\"-1\"])",
    "textarea:not([tabindex=\"-1\"])",
    "[tabindex]:not([tabindex=\"-1\"])"
].join(",");

const STORAGE = new WeakMap();

export default class SettingsWindow extends Window {

    constructor(title = "Settings", options = {}) {
        super(title, options.close);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        STORAGE.set(this, new DataStorage());
        const window = this.shadowRoot.getElementById("window");
        const body = this.shadowRoot.getElementById("body");
        body.innerHTML = "";
        const ctgrs = els.getElementById("categories");
        body.append(ctgrs);
        window.append(els.getElementById("footer"));

        ctgrs.onclick = (event) => {
            const targetEl = event.target.getAttribute("target");
            if (targetEl) {
                this.active = targetEl;
                event.preventDefault();
                return false;
            }
        }

        const sbm = this.shadowRoot.getElementById("submit");
        if (!!options.submit && typeof options.submit === "string") {
            sbm.innerHTML = options.submit;
            sbm.setAttribute("title", options.submit);
        }
        sbm.addEventListener("click", event => {
            const storage = STORAGE.get(this);
            const data = storage.getAll();
            const ev = new Event("submit");
            ev.data = data;
            this.dispatchEvent(ev);
            this.close();
        });

        const ccl = this.shadowRoot.getElementById("cancel");
        if (!!options.cancel && typeof options.cancel === "string") {
            ccl.innerHTML = options.cancel;
            ccl.setAttribute("title", options.cancel);
        }
        ccl.onclick = () => {
            this.dispatchEvent(new Event("cancel"));
            this.close();
        }
    }

    show(data = {}, category = "") {
        const categories = this.shadowRoot.getElementById("categories");
        if (category) {
            categories.active = category;
        } else {
            categories.active = "";
        }
        const storage = STORAGE.get(this);
        storage.setAll(data);
        super.show();
    }

    initialFocus() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById("submit"));
        a.push(this.shadowRoot.getElementById("cancel"));
        a.push(this.shadowRoot.getElementById("close"));
        a[0].focus();
    }

    focusFirst() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById("submit"));
        a.push(this.shadowRoot.getElementById("cancel"));
        a.unshift(this.shadowRoot.getElementById("close"));
        a[0].focus();
    }
    
    focusLast() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById("submit"));
        a.push(this.shadowRoot.getElementById("cancel"));
        a.unshift(this.shadowRoot.getElementById("close"));
        a[a.length - 1].focus();
    }
    
    get storage() {
        return STORAGE.get(this);
    }

    getTab(category) {
        const categories = this.shadowRoot.getElementById("categories");
        const tab = categories.getTab(category);
        if (tab != null) {
            const container = tab.querySelector(".container");
            return container;
        } else {
            const tab = categories.addTab(category, Language.generateLabel(category));
            const container = document.createElement("gt-window-settings-tab");
            container.className = "container";
            tab.append(container);
            return container;
        }
    }

    addStringInput(category, label, ref, def) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            panel.addStringInput(storage, label, ref, def);
        }
    }

    addNumberInput(category, label, ref, def, min, max) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            panel.addNumberInput(storage, label, ref, def, min, max);
        }
    }

    addRangeInput(category, label, ref, def, min, max) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            panel.addRangeInput(storage, label, ref, def, min, max);
        }
    }

    addCheckInput(category, label, ref, def) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            panel.addCheckInput(storage, label, ref, def);
        }
    }

    addChoiceInput(category, label, ref, def, values) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            panel.addChoiceInput(storage, label, ref, def, values);
        }
    }

    addListSelectInput(category, label, ref, def, multiple, values) {
        const panel = this.getTab(category);
        if (panel != null) {
            const storage = STORAGE.get(this);
            panel.addListSelectInput(storage, label, ref, def, multiple, values);
        }
    }

    addButton(category, label, ref, text = "", callback = null) {
        const panel = this.getTab(category);
        if (panel != null) {
            // const storage = STORAGE.get(this);
            panel.addButton(label, ref, text, callback = null);
        }
    }

    addElements(category, content) {
        const panel = this.getTab(category);
        if (panel != null) {
            panel.addElements(content);
        }
    }

}

customElements.define("gt-window-settings", SettingsWindow);
