// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";

// GameTrackerJS
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import "/GameTrackerJS/ui/Badge.js";
// Track-OOT
import AbstractGossipstone from "../abstract/Gossipstone.js";
import "./Location.js.js";

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
#marker[data-state="opened"] {
    background-color: var(--location-status-opened-color, #000000);
}
#marker[data-state="available"] {
    background-color: var(--location-status-available-color, #000000);
}
#marker[data-state="unavailable"] {
    background-color: var(--location-status-unavailable-color, #000000);
}
#marker[data-state="possible"] {
    background-color: var(--location-status-possible-color, #000000);
}
#marker:hover,
:host(.ctx-marked) #marker {
    box-shadow: 0 0 2px 4px #67ffea;
}
#marker:hover + #tooltip,
:host(.ctx-marked) #marker + #tooltp {
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
`);

// TODO save gossipstone data to extra storage
export default class MapGossipstone extends AbstractGossipstone {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

}

UIRegistry.get("map-location").register("gossipstone", MapGossipstone);
customElements.define("ootrt-map-gossipstone", MapGossipstone);
