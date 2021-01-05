import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import "/emcJS/ui/Icon.js";
import WorldRegistry from "/GameTrackerJS/registry/WorldRegistry.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import AbstractSubArea from "/GameTrackerJS/ui/world/SubArea.js";
import "/GameTrackerJS/ui/Badge.js";

const TPL = new Template(`
<div id="header" class="textarea">
    <div id="text"></div>
    <gt-badge id="badge"></gt-badge>
</div>
<div id="list">
    <slot></slot>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
:host {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    cursor: pointer;
    padding: 5px;
}
:host(:hover) {
    background-color: var(--main-hover-color, #ffffff32);
}
.textarea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    min-height: 35px;
    word-break: break-word;
}
.textarea:empty {
    display: none;
}
.textarea + .textarea {
    margin-top: 5px;
}
#text {
    display: flex;
    flex: 1;
    color: #ffffff;
    align-items: center;
}
#text[data-state="opened"] {
    color: var(--location-status-opened-color, #000000);
}
#text[data-state="available"] {
    color: var(--location-status-available-color, #000000);
}
#text[data-state="unavailable"] {
    color: var(--location-status-unavailable-color, #000000);
}
#text[data-state="possible"] {
    color: var(--location-status-possible-color, #000000);
}
.menu-tip {
    font-size: 0.7em;
    color: #777777;
    margin-left: 15px;
    float: right;
}
#list {
    width: 100%;
    margin-top: 5px;
}
:host(:empty) #list {
    display: none;
}
`);

export default class ListSubArea extends UIEventBusMixin(AbstractSubArea) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.registerGlobal(["state", "randomizer_options"], event => {
            if (this.isConnected) {
                this.refreshList();
            }
        });
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        this.refreshList();
    }

    refreshList() {
        this.innerHTML = ""; // TODO use ElementManager
        const state = this.getState();
        if (state != null) {
            const list = state.getFilteredList();
            if (list != null) {
                for (const record of list) {
                    const id = `${record.category}/${record.id}`;
                    const loc = WorldRegistry.get(id);
                    const uiReg = UIRegistry.get(`list-${record.category}`);
                    this.append(uiReg.create(loc.props.type, loc.ref));
                }
            }
        }
    }

}

UIRegistry.set("list-subarea", new UIRegistry(ListSubArea));
customElements.define('ootrt-list-subarea', ListSubArea);
