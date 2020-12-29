import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import UIWorldRegistry from "/GameTrackerJS/registry/UIWorldRegistry.js";
import "/GameTrackerJS/ui/Badge.js";
import AbstractGossipstone from "../abstract/Gossipstone.js";

const TPL = new Template(`
<div id="marker"></div>
<emc-tooltip position="top" id="tooltip">
    <div class="textarea">
        <div id="text"></div>
        <div id="item"></div>
        <gt-badge id="badge"></gt-badge>
    </div>
    <div id="hintlocation" class="textarea"></div>
    <div id="hintitem" class="textarea"></div>
</emc-tooltip>
`);

const STYLE = new GlobalStyle(`
:host {
    position: absolute;
    display: inline;
    width: 32px;
    height: 32px;
    box-sizing: border-box;
    -moz-user-select: none;
    user-select: none;
    transform: translate(-8px, -8px);
}
:host(:hover) {
    z-index: 1000;
}
#marker {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background-color: var(--location-status-unavailable-color, #000000);
    border: solid 4px black;
    border-radius: 50%;
    cursor: pointer;
}
#marker[data-state="available"] {
    background-color: var(--location-status-available-color, #000000);
}
#marker[data-state="unavailable"] {
    background-color: var(--location-status-unavailable-color, #000000);
}
:host([checked="true"]) #marker {
    background-color: var(--location-status-opened-color, #000000);
}
#marker:hover {
    box-shadow: 0 0 2px 4px #67ffea;
}
#marker:hover + #tooltip {
    display: block;
}
#tooltip {
    padding: 5px 12px;
    -moz-user-select: none;
    user-select: none;
    white-space: nowrap;
    font-size: 30px;
}
.textarea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 46px;
    word-break: break-word;
}
.textarea:empty {
    display: none;
}
#text {
    display: flex;
    align-items: center;
    -moz-user-select: none;
    user-select: none;
    white-space: nowrap;
}
#item {
    margin-left: 5px;
}
#badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.1em;
    flex-shrink: 0;
    margin-left: 0.3em;
    border: 0.1em solid var(--navigation-background-color, #ffffff);
    border-radius: 0.3em;
}
#badge emc-icon {
    width: 30px;
    height: 30px;
}
`);

// TODO save gossipstone data to extra storage
export default class MapGossipstone extends AbstractGossipstone {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

UIWorldRegistry.get("map-location").register('gossipstone', MapGossipstone);
customElements.define('ootrt-map-gossipstone', MapGossipstone);
