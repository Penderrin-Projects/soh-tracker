/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import "/emcJS/ui/input/ListSelect.js";
import "/emcJS/ui/input/SearchSelect.js";
import "/emcJS/ui/input/Option.js";
import "/emcJS/ui/input/InputWrapper.js";
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
    max-height: 300px;
}
label.settings-option .settings-input:not([type="checkbox"]) {
    flex: 1;
}
label.settings-option .settings-input:focus {
    box-shadow: 0 0 2px 2px var(--input-focus-color, #06b5ff);
    outline: none;
}
label.settings-option .settings-input:focus:not(:focus-visible) {
    box-shadow: none;
    outline: none;
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
        const input = document.createElement("input");
        input.className = "settings-input";
        input.setAttribute("type", "text");
        input.value = storage.get(ref, def);
        input.dataset.ref = ref;
        const el = generateField(label, input);
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
        const el = generateField(label, input);
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
        const el = generateField(label, input);
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
        const input = document.createElement("input");
        input.className = "settings-input";
        input.setAttribute("type", "checkbox");
        input.checked = !!storage.get(ref, !!def);
        input.dataset.ref = ref;
        const el = generateField(label, input);
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
        const input = document.createElement("emc-searchselect");
        input.className = "settings-input";
        input.setAttribute("type", "input");
        for (const value in values) {
            input.append(generateEmcOption(value, values[value]));
        }
        input.value = storage.get(ref, def);
        input.dataset.ref = ref;
        const el = generateField(label, input);
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

    addListSelectInput(storage, label, ref, def, multiple, values) {
        const input = document.createElement("emc-listselect");
        input.className = "settings-input";
        input.setAttribute("type", "list");
        input.multiple = multiple;
        input.dataset.ref = ref;
        const valueCache = new Set();
        for (const value in values) {
            input.append(generateEmcOption(value, values[value]));
            if (storage.get(value, def.includes(value))) {
                valueCache.add(value);
            }
            // events
            storage.addEventListener("change", event => {
                if (event.data[value] != null) {
                    if (event.data[value]) {
                        valueCache.add(value);
                    } else {
                        valueCache.delete(value);
                    }
                    input.value = Array.from(valueCache);
                }
            });
        }
        input.value = Array.from(valueCache);
        const el = generateField(label, input);
        // events
        input.addEventListener("change", event => {
            const data = new Set(input.value);
            const res = {};
            for (const value in values) {
                res[value] = data.has(value);
            }
            storage.setAll(res);
        });
        // add element
        const container = this.shadowRoot.getElementById("container");
        container.append(el);
    }

    addButton(label, ref, text = "", callback = null) {
        const input = document.createElement("button");
        input.className = "settings-button";
        input.setAttribute("type", "button");
        input.dataset.ref = ref;
        if (text instanceof HTMLElement) {
            input.append(text);
        } else {
            input.innerHTML = text;
        }
        if (typeof callback == "function") {
            input.onclick = callback;
        }
        const el = generateField(label, input);
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

function generateField(label, input) {
    const el = document.createElement("label");
    el.className = "settings-option";
    const text = document.createElement("span");
    if (label instanceof HTMLElement) {
        text.append(label);
    } else {
        text.innerHTML = label;
    }
    text.className = "option-text";
    el.append(text);
    const inputWrapper = document.createElement("emc-input-wrapper");
    inputWrapper.append(input);
    el.append(inputWrapper);
    return el;
}

function generateEmcOption(value, label) {
    const el = document.createElement("emc-option");
    el.value = value;
    if (label instanceof HTMLElement) {
        el.append(label);
    } else {
        el.innerHTML = label;
    }
    return el;
}
