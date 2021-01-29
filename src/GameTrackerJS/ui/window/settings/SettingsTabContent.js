/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
/* asym-import: on */

const TPL = new Template(`
<div id="container"></div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host() {
    display: block;
    overflow-wrap: break-word;
    resize: none;
}
label.settings-option {
    display: flex;
    padding: 10px;
    align-items: center;
    justify-content: flex-start;
}
label.settings-option:hover {
    background-color: lightgray;
}
label.settings-option input[type="checkbox"] {
    margin-right: 10px;
}
label.settings-option emc-listselect {
    height: 300px;
}
label.settings-option .settings-input {
    width: 50%;
}
label.settings-option .option-text {
    display: inline-block;
    flex-basis: 500px;
    flex-shrink: 1;
    margin-right: 10px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
`);

export default class SettingsTabContent extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    addStringInput(storage, label, ref, def) {
        const el = generateField(label);
        const input = document.createElement("input");
        input.className = "settings-input";
        input.setAttribute("type", "text");
        input.value = storage.get(ref, def);
        input.dataset.ref = ref;
        el.append(input);
        // events
        storage.addEventListener("change", event => {
            if (event.data[ref] != null) {
                input.value = event.data[ref];
            }
        });
        input.addEventListener("change", event => {
            storage.set(ref, input.value);
        });
        // add element
        const container = this.shadowRoot.getElementById("container");
        container.append(el);
    }

    addNumberInput(storage, label, ref, def, min, max) {
        const el = generateField(label);
        const input = document.createElement("input");
        input.className = "settings-input";
        input.setAttribute("type", "number");
        input.value = storage.get(ref, def);
        if (!isNaN(min)) {
            input.setAttribute("min", min);
        }
        if (!isNaN(max)) {
            input.setAttribute("max", max);
        }
        input.dataset.ref = ref;
        el.append(input);
        // events
        storage.addEventListener("change", event => {
            if (event.data[ref] != null) {
                input.value = parseFloat(event.data[ref]);
            }
        });
        input.addEventListener("change", event => {
            storage.set(ref, parseFloat(input.value));
        });
        // add element
        const container = this.shadowRoot.getElementById("container");
        container.append(el);
    }

    addRangeInput(storage, label, ref, def, min, max) {
        const el = generateField(label);
        const input = document.createElement("input");
        input.className = "settings-input";
        input.setAttribute("type", "range");
        input.value = storage.get(ref, def);
        if (!isNaN(min)) {
            input.setAttribute("min", min);
        }
        if (!isNaN(max)) {
            input.setAttribute("max", max);
        }
        input.dataset.ref = ref;
        el.append(input);
        // events
        storage.addEventListener("change", event => {
            if (event.data[ref] != null) {
                input.value = parseFloat(event.data[ref]);
            }
        });
        input.addEventListener("change", event => {
            storage.set(ref, parseFloat(input.value));
        });
        // add element
        const container = this.shadowRoot.getElementById("container");
        container.append(el);
    }

    addCheckInput(storage, label, ref, def) {
        const el = generateField(label);
        const input = document.createElement("input");
        input.className = "settings-input";
        input.setAttribute("type", "checkbox");
        input.checked = !!storage.get(ref, !!def);
        input.dataset.ref = ref;
        el.append(input);
        // events
        storage.addEventListener("change", event => {
            if (event.data[ref] != null) {
                input.checked = !!event.data[ref];
            }
        });
        input.addEventListener("change", event => {
            storage.set(ref, !!input.checked);
        });
        // add element
        const container = this.shadowRoot.getElementById("container");
        container.append(el);
    }

    addChoiceInput(storage, label, ref, def, values) {
        const el = generateField(label);
        const input = document.createElement("select");
        input.className = "settings-input";
        input.setAttribute("type", "input");
        for (const value in values) {
            const opt = document.createElement("option");
            opt.value = value;
            opt.innerHTML = values[value];
            input.append(opt);
        }
        input.value = storage.get(ref, def);
        input.dataset.ref = ref;
        el.append(input);
        // events
        storage.addEventListener("change", event => {
            if (event.data[ref] != null) {
                input.value = event.data[ref];
            }
        });
        input.addEventListener("change", event => {
            storage.set(ref, input.value);
        });
        // add element
        const container = this.shadowRoot.getElementById("container");
        container.append(el);
    }

    addListSelectInput(storage, label, ref, def, multimode, values) {
        const el = generateField(label);
        const input = document.createElement("emc-listselect");
        input.className = "settings-input";
        input.setAttribute("type", "list");
        input.multimode = multimode;
        input.value = storage.get(ref, def);
        input.dataset.ref = ref;
        for (const value in values) {
            const opt = document.createElement("emc-option");
            opt.value = value;
            opt.innerHTML = values[value];
            input.append(opt);
        }
        el.append(input);
        // events
        storage.addEventListener("change", event => {
            if (event.data[ref] != null) {
                input.value = event.data[ref];
            }
        });
        input.addEventListener("change", event => {
            storage.set(ref, input.value);
        });
        // add element
        const container = this.shadowRoot.getElementById("container");
        container.append(el);
    }

    addButton(label, ref, text = "", callback = null) {
        const el = generateField(label);
        const input = document.createElement("button");
        input.className = "settings-button";
        input.setAttribute("type", "button");
        input.dataset.ref = ref;
        input.innerHTML = text;
        if (typeof callback == "function") {
            input.onclick = callback;
        }
        el.append(input);
        // add element
        const container = this.shadowRoot.getElementById("container");
        container.append(el);
    }

    addElements(content) {
        // add element
        const container = this.shadowRoot.getElementById("container");
        container.append(content);
    }

}

customElements.define("gt-window-settings-tab", SettingsTabContent);

function generateField(label) {
    const el = document.createElement("label");
    el.className = "settings-option";
    const text = document.createElement("span");
    text.innerHTML = label;
    text.className = "option-text";
    el.append(text);
    return el;
}
