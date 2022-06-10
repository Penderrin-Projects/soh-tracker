// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/element/CustomElement.js";
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";

// GameTrackerJS
import StateDataEventManagerMixin from "/GameTrackerJS/ui/mixin/StateDataEventManagerMixin.js";
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import SongStateManager from "/script/state/song/SongStateManager.js"
import "./SongStave.js";
import "./SongBuilder.js";

const TPL = new Template(`
<div class="caption">
    <span id="title"></span>
    <button id="edit" class="button hidden" title="edit">✎</button>
    <button id="reset" class="button hidden" title="reset">↶</button>
    <button id="clear" class="button hidden" title="clear">✕</button>
</div>
<ootrt-stave id="stave"></ootrt-stave>
`);

const STYLE = new GlobalStyle(`
:host {
    display: inline-block;
    width: 500px;
    padding: 10px;
    margin: 5px;
    border: solid 2px white;
}
.caption {
    display: flex;
    align-items: center;
    height: 30px;
}
.button {
    height: 24px;
    color: white;
    background-color: black;
    border: solid 1px white;
    margin-left: 15px;
    font-size: 1em;
    appearance: none;
    cursor: pointer;
}
.button:hover {
    color: black;
    background-color: white;
}
.button.hidden {
    display: none;
}
`);

export default class HTMLTrackerSongField extends StateDataEventManagerMixin(CustomElement) {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("notes", (event) => {
            const staveEl = this.shadowRoot.getElementById("stave");
            if (staveEl != null) {
                staveEl.value = event.value;
            }
        });

        /* mouse events */
        const editEl = this.shadowRoot.getElementById("edit");
        editEl.onclick = () => {
            this.#editSong();
        };
        const resetEl = this.shadowRoot.getElementById("reset");
        resetEl.onclick = () => {
            this.#resetSong();
        };
        const clearEl = this.shadowRoot.getElementById("clear");
        clearEl.onclick = () => {
            this.#clearSong();
        };
    }

    applyDefaultValues() {
        const editEl = this.shadowRoot.getElementById("edit");
        if (editEl != null) {
            editEl.classList.add("hidden");
        }
        const resetEl = this.shadowRoot.getElementById("reset");
        if (resetEl != null) {
            resetEl.classList.add("hidden");
        }
        const clearEl = this.shadowRoot.getElementById("clear");
        if (clearEl != null) {
            clearEl.classList.add("hidden");
        }
        const staveEl = this.shadowRoot.getElementById("stave");
        if (staveEl != null) {
            staveEl.value = "";
        }
    }

    applyStateValues(state) {
        if (state != null) {
            const editEl = this.shadowRoot.getElementById("edit");
            if (editEl != null) {
                editEl.classList.toggle("hidden", !state.props.editable);
            }
            const resetEl = this.shadowRoot.getElementById("reset");
            if (resetEl != null) {
                resetEl.classList.toggle("hidden", !state.props.editable);
            }
            const clearEl = this.shadowRoot.getElementById("clear");
            if (clearEl != null) {
                clearEl.classList.toggle("hidden", !state.props.editable);
            }
            const staveEl = this.shadowRoot.getElementById("stave");
            if (staveEl != null) {
                staveEl.value = state.notes;
            }
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    static get observedAttributes() {
        return ["ref"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            const state = SongStateManager.get(this.ref);
            const titleEl = this.shadowRoot.getElementById("title");
            if (titleEl != null) {
                Language.applyLabel(titleEl, `song[${newValue}]`);
            }
            this.switchState(state);
        }
    }

    #editSong() {
        const builder = document.createElement("ootrt-songbuilder");
        builder.value = this.shadowRoot.getElementById("stave").value;
        const d = new Dialog({title: Language.generateLabel(this.ref), submit: true, cancel: true});
        d.addEventListener("submit", (result) => {
            if (result) {
                const state = this.getState();
                if (state != null) {
                    state.notes = builder.value;
                }
            }
        });
        d.append(builder);
        d.show();
    }

    #resetSong() {
        const state = this.getState();
        if (state != null) {
            state.notes = null;
        }
    }

    #clearSong() {
        const state = this.getState();
        if (state != null) {
            state.notes = "";
        }
    }

}

customElements.define("ootrt-songfield", HTMLTrackerSongField);
