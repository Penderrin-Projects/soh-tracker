import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import StateDataEventManager from "/GameTrackerJS/ui/mixin/StateDataEventManager.js";
import Language from "/script/util/Language.js";
import SongStateManager from "/script/state/song/StateManager.js"
import "./SongStave.js";
import "./SongBuilder.js";

const TPL = new Template(`
<div class="caption">
    <span id="title"></span>
    <button id="edit" class="hidden">✎</button>
</div>
<ootrt-stave id="stave"></ootrt-stave>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
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
#edit {
    appearance: none;
    color: white;
    background-color: black;
    border: solid 1px white;
    margin-left: 15px;
    cursor: pointer;
}
#edit:hover {
    color: black;
    background-color: white;
}
#edit.hidden {
    display: none;
}
`);

function editSong(event) {
    const builder = document.createElement("ootrt-songbuilder");
    builder.value = this.shadowRoot.getElementById("stave").value;
    const d = new Dialog({title: Language.translate(this.ref), submit: true, cancel: true});
    d.addEventListener("submit", function(result) {
        if (result) {
            const state = this.getState();
            if (state != null) {
                state.notes = builder.value;
            }
        }
    }.bind(this));
    d.append(builder);
    d.show();
}

export default class HTMLTrackerSongField extends StateDataEventManager(HTMLElement) {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerStateHandler("notes", event => {
            const staveEl = this.shadowRoot.getElementById("stave");
            if (staveEl != null) {
                staveEl.value = event.data;
            }
        });

        /* mouse events */
        const buttonEl = this.shadowRoot.getElementById("edit");
        buttonEl.onclick = editSong.bind(this);
    }

    applyDefaultValues() {
        const buttonEl = this.shadowRoot.getElementById("edit");
        if (buttonEl != null) {
            buttonEl.classList.add("hidden");
        }
        const staveEl = this.shadowRoot.getElementById("stave");
        if (staveEl != null) {
            staveEl.value = "";
        }
    }

    applyStateValues(state) {
        if (state != null) {
            const buttonEl = this.shadowRoot.getElementById("edit");
            if (buttonEl != null) {
                if (state.props.editable) {
                    buttonEl.classList.remove("hidden");
                } else {
                    buttonEl.classList.add("hidden");
                }
            }
            const staveEl = this.shadowRoot.getElementById("stave");
            if (staveEl != null) {
                staveEl.value = state.notes;
            }
        }
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    static get observedAttributes() {
        return ['ref'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            const state = SongStateManager.get(this.ref);
            const titleEl = this.shadowRoot.getElementById("title");
            if (titleEl != null) {
                titleEl.innerHTML = Language.translate(newValue);
            }
            this.switchState(state);
        }
    }

}

customElements.define('ootrt-songfield', HTMLTrackerSongField);
