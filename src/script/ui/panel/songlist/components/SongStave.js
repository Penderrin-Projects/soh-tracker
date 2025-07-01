// frameworks
import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import CSSTemplate from "/emcJS/util/html/template/CSSTemplate.js";
import CustomElement from "/emcJS/ui/element/CustomElement.js";

const TPL = new HTMLTemplate(`
<div id="notes">
</div>
`);

const STYLE = new CSSTemplate(`
:host {
    display: flex;
    height: 100px;
    background-repeat: repeat-x;
    background-size: contain;
    background-image: url("/images/songs/lines.svg");
}
:host::before {
    width: 50px;
    height: 100px;
    background-repeat: no-repeat;
    background-size: auto 100%;
    background-position: center;
    background-image: url("/images/songs/key.svg");
    content: " ";
}
#notes {
    flex: 1;
}
.note {
    display: inline-block;
    height: 100px;
    width: 30px;
    background-repeat: no-repeat;
    background-size: contain;
    background-position-x: center;
}

.note.note_A {
    background-image: url("/images/songs/note_A.svg");
    background-position-y: 90%;
}

.note.note_D {
    background-image: url("/images/songs/note_D.svg");
    background-position-y: 75%;
}

.note.note_R {
    background-image: url("/images/songs/note_R.svg");
    background-position-y: 60%;
}

.note.note_L {
    background-image: url("/images/songs/note_L.svg");
    background-position-y: 45%;
}

.note.note_U {
    background-image: url("/images/songs/note_U.svg");
    background-position-y: 30%;
}
`);

export default class HTMLTrackerStave extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get value() {
        return this.getAttribute("value");
    }

    set value(val) {
        this.setAttribute("value", val);
    }

    static get observedAttributes() {
        return ["value"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            const notes = this.shadowRoot.getElementById("notes");
            notes.innerHTML = "";
            for (let i = 0; i < newValue.length; ++i) {
                const el = document.createElement("div");
                el.className = `note note_${newValue[i]}`;
                notes.append(el);
            }
        }
    }

}

customElements.define("ootrt-stave", HTMLTrackerStave);
