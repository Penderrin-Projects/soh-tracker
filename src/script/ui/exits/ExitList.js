import FileData from "/emcJS/data/FileData.js";
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import Language from "/script/util/Language.js";
import "/GameTrackerJS/ui/ExitChoice.js";

const TPL = new Template(`
<div id="categories">
</div>
<div id="body">
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: block;
}
.panel {
    display: none;
    word-wrap: break-word;
    resize: none;
}
.panel.active {
    display: block;
}
#categories {
    padding: 5px;
    overflow-x: auto;
    overflow-y: none;
    border-bottom: solid 2px #cccccc;
}
.category {
    display: inline-flex;
    margin: 0 2px;
}
.category {
    padding: 5px;
    border: solid 1px white;
    border-radius: 2px;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    -webkit-appearance: none;
}
.category:hover {
    background-color: gray;
}
.category.active {
    color: black;
    background-color: white;
}
`);

export default class HTMLTrackerExitList extends UIEventBusMixin(Panel) {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const ctgrs = this.shadowRoot.getElementById('categories');
        ctgrs.onclick = (event) => {
            const targetEl = event.target.getAttribute('target');
            if (targetEl) {
                this.active = targetEl;
                event.preventDefault();
                return false;
            }
        }
        const exits = FileData.get("world/exit");
        for (const exit in exits) {
            const category = exits[exit].type;
            this.addEntrance(category, exit);
        }
    }

    get active() {
        return this.getAttribute('active');
    }

    set active(val) {
        this.setAttribute('active', val);
    }

    static get observedAttributes() {
        return ['active'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            if (oldValue) {
                const ol = this.shadowRoot.getElementById(`panel_${oldValue}`);
                if (ol) {
                    ol.classList.remove("active");
                }
                const ob = this.shadowRoot.querySelector(`[target="${oldValue}"]`);
                if (ob) {
                    ob.classList.remove("active");
                }
            }
            const nl = this.shadowRoot.getElementById(`panel_${newValue}`);
            if (nl) {
                nl.classList.add("active");
            }
            const nb = this.shadowRoot.querySelector(`[target="${newValue}"]`);
            if (nb) {
                nb.classList.add("active");
            }
        }
    }

    addTab(category) {
        const pnl = document.createElement('div');
        pnl.className = "panel";
        pnl.id = `panel_${category}`;
        pnl.dataset.ref = category;
        this.shadowRoot.getElementById('body').append(pnl);
        const cb = document.createElement('div');
        cb.className = "category";
        cb.setAttribute('target', category);
        cb.innerHTML = Language.translate(category);
        this.shadowRoot.getElementById('categories').append(cb);
        return pnl;
    }

    addEntrance(category, ref) {
        const el = document.createElement('gt-exitchoice');
        el.ref = ref;
        const panel = this.shadowRoot.getElementById(`panel_${category}`);
        if (panel != null) {
            panel.append(el);
        } else {
            this.addTab(category).append(el);
        }
    }

}

customElements.define('ootrt-exitlist', HTMLTrackerExitList);
