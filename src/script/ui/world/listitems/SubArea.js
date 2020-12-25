import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import "/emcJS/ui/Icon.js";
import AbstractSubArea from "/script/ui/world/abstract/SubArea.js";

const TPL = new Template(`
<div id="header" class="textarea">
    <div id="text"></div>
    <div id="badge">
        <emc-icon src="images/icons/entrance.svg"></emc-icon>
        <emc-icon id="badge-time" src="images/icons/time_always.svg"></emc-icon>
        <emc-icon id="badge-era" src="images/icons/era_none.svg"></emc-icon>
    </div>
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
#badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    flex-shrink: 0;
    margin-left: 5px;
    border: 1px solid var(--navigation-background-color, #ffffff);
    border-radius: 2px;
}
#badge emc-icon {
    width: 25px;
    height: 25px;
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

export default class ListSubArea extends AbstractSubArea {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    // TODO generate sublist similar to this function
    /*refresh() {
        if (this.ref) {
            const data = FileData.get(`world/${this.ref}`);
            this.innerHTML = "";
            if (data) {
                // check access logic
                const res = ListLogic.check(data.list.filter(ListLogic.filterUnusedChecks));
                this.shadowRoot.getElementById("text").dataset.state = VALUE_STATES[res.value];
                // create list entries
                data.list.forEach(record => {
                    const loc = MarkerRegistry.get(`${record.category}/${record.id}`);
                    if (!!loc && loc.visible()) {
                        const el = loc.listItem;
                        this.append(el);
                    }
                });
            }
        } else {
            this.shadowRoot.getElementById("text").dataset.state = "unavailable";
        }
    }*/

}

customElements.define('ootrt-list-subarea', ListSubArea);
