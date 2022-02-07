// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";

// GameTrackerJS
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import "/GameTrackerJS/ui/Badge.js";
// Track-OOT
import AbstractLocation from "../abstract/Location.js";

const TPL = new Template(`
<div class="textarea">
    <div id="text"></div>
    <div id="item"></div>
    <gt-badge id="badge"></gt-badge>
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
:host(:hover),
:host(.ctx-marked) {
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
    align-items: center;
    color: #ffffff;
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
#item {
    margin-left: 5px;
}
.menu-tip {
    font-size: 0.7em;
    color: #777777;
    margin-left: 15px;
    float: right;
}
`);

export default class ListLocation extends AbstractLocation {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

UIRegistry.set("list-location", new UIRegistry(ListLocation));
customElements.define("ootrt-list-location", ListLocation);
