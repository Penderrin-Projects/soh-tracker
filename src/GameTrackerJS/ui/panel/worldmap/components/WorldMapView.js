// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import { mix } from "/emcJS/util/Mixin.js";
import ElementManager from "/emcJS/util/html/ElementManager.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/i18n/ui/I18nLabel.js";

import WorldListState from "../../../../state/world/WorldListState.js";
import WorldStateManagerRegistry from "../../../../statemanager/WorldStateManagerRegistry.js";
import AreaStateManager from "../../../../statemanager/world/area/AreaStateManager.js";
import UIRegistry from "../../../../registry/UIRegistry.js";
import StateDataEventManagerMixin from "../../../mixin/StateDataEventManager.js";
import "../../../button/FilterMenuButton.js";
import "../../../button/HintButton.js";
import "./entries/Location.js";
import "./entries/Area.js";
import "./entries/Exit.js";

const ZOOM_MIN = 10;
const ZOOM_MAX = 200;
const ZOOM_DEF = 60;
const ZOOM_SPD = 2;

const TPL = new Template(`
<slot id="map" style="--map-zoom: ${ZOOM_DEF};">
</slot>
`);

const STYLE = new GlobalStyle(`
:host {
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    user-select: none;
}
#map {
    display: block;
    width: 1000px;
    height: 1000px;
    flex-shrink: 0;
    background-color: var(--page-text-color, #000000);
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center;
    background-origin: content-box;
    transform-origin: center;
    transform: translate(calc(var(--map-offset-x, 0) * 1px), calc(var(--map-offset-y, 0) * 1px)) scale(calc(var(--map-zoom, 100) / 100));
}
::slotted(*) {
    position: absolute;
}
`);

const BaseClass = mix(
    Panel
).with(
    StateDataEventManagerMixin
);

const EL_MANAGER = new WeakMap();

function elementComposer(key, props) {
    const uiReg = UIRegistry.get(`worldmap-${props.category}`);
    if (uiReg != null) {
        const markerEl = uiReg.create(props.type, key);
        markerEl.left = props.x;
        markerEl.top = props.y;
        // XXX tooltips should really automatically adjust
        markerEl.tooltip = calculateTooltipPosition(props.x, props.y, props.areaWidth, props.areaHeight);
        return markerEl;
    }
}

export default class WorldMapView extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* state handler */
        WorldListState.addEventListener("area", event => {
            this.ref = event.data;
        });
        this.registerStateHandler("list_update", event => {
            this.refreshList();
        });
        /* --- */
        EL_MANAGER.set(this, new ElementManager(this, elementComposer));
    }

    applyDefaultValues() {
        /* map */
        const mapEl = this.shadowRoot.getElementById("map");
        if (mapEl != null) {
            mapEl.style.backgroundImage = "";
            mapEl.style.width = "600px";
            mapEl.style.height = "600px";
        }
        /* list */
        this.refreshList();
    }

    applyStateValues(state) {
        /* map */
        const mapEl = this.shadowRoot.getElementById("map");
        if (mapEl != null) {
            const mapData = state.props.map;
            mapEl.style.backgroundImage = `url("/images/maps/${mapData.background}")`;
            mapEl.style.width = `${mapData.width}px`;
            mapEl.style.height = `${mapData.height}px`;
        }
        /* list */
        this.refreshList();
    }

    get ref() {
        return this.getAttribute("ref") || WorldListState.default;
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    static get observedAttributes() {
        return ["ref"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = AreaStateManager.get(this.ref);
                    this.switchState(state);
                } break;
            }
        }
    }

    refreshList() {
        const elManager = EL_MANAGER.get(this);
        const elManagerData = [];
        const state = this.getState();
        let hasElements = false;
        if (state != null) {
            const list = state.getList();
            if (list != null && list.length > 0) {
                for (const record of list) {
                    const loc = WorldStateManagerRegistry.get(record.category).get(record.id);
                    elManagerData.push({
                        key: loc.ref,
                        category: record.category,
                        type: loc.props.type,
                        x: record.x,
                        y: record.y,
                        areaWidth: state.props.map.width,
                        areaHeight: state.props.map.height
                    });
                    if (loc.isVisible()) {
                        hasElements = true;
                    }
                }
            }
        }
        // this.classList.toggle("empty", !hasElements);
        elManager.manage(elManagerData);
    }

}

customElements.define("gt-worldmap-view", WorldMapView);

function calculateTooltipPosition(posX, posY, mapW, mapH) {
    const leftP = posX / mapW;
    const topP = posY / mapH;
    let tooltip = "";
    if (topP < 0.3) {
        tooltip = "bottom";
    } else if (topP > 0.7) {
        tooltip = "top";
    }
    if (leftP < 0.3) {
        tooltip += "right";
    } else if (leftP > 0.7) {
        tooltip += "left";
    }
    return tooltip || "top";
}

// XXX there must be a better way

let movePosX = 0;
let movePosY = 0;

function mapMoveBegin(event) {
    if (event.button === 0) {
        const target = event.target;
        if (typeof event.movementX == "undefined") {
            movePosX = event.x;
            movePosY = event.y;
        }
        if (target.id === "map") {
            target.classList.add("grabbed");
            target.addEventListener("mousemove", moveMap);
            target.addEventListener("mouseup", mapMoveEnd);
            target.addEventListener("mouseleave", mapMoveEnd);
        }
    }
}

function mapMoveEnd(event) {
    if (event.button === 0) {
        const target = event.target;
        target.classList.remove("grabbed");
        target.removeEventListener("mousemove", moveMap);
        target.removeEventListener("mouseup", mapMoveEnd);
        target.removeEventListener("mouseleave", mapMoveEnd);
    }
}

function moveMap(event) {
    if (event.button === 0) {
        const target = event.target;
        if (target.id === "map") {
            const vrtX = parseInt(target.style.getPropertyValue("--map-offset-x") || 0);
            const vrtY = parseInt(target.style.getPropertyValue("--map-offset-y") || 0);
            let forceX = 0;
            let forceY = 0;
            if (typeof event.movementX == "undefined") {
                forceX = event.x - movePosX;
                forceY = event.y - movePosY;
                movePosX = event.x;
                movePosY = event.y;
            } else {
                forceX = event.movementX;
                forceY = event.movementY;
            }
            target.style.setProperty("--map-offset-x", vrtX + forceX);
            target.style.setProperty("--map-offset-y", vrtY + forceY);
            mapContainBoundaries(target, target.parentNode);
        }
    }
}

function mapContainBoundaries(target, parent) {
    const mapvp = parent.querySelector("#map-viewport");

    const parW = parent.clientWidth;
    const parH = parent.clientHeight;

    const zoom = parseInt(target.style.getPropertyValue("--map-zoom") || 100) / 100;

    let vrtX = parseInt(target.style.getPropertyValue("--map-offset-x") || 0);
    let vrtY = parseInt(target.style.getPropertyValue("--map-offset-y") || 0);
    const vrtW = target.clientWidth * zoom;
    const vrtH = target.clientHeight * zoom;

    if (parW > vrtW) {
        const dst = parW / 2 - vrtW / 2;
        vrtX = Math.min(Math.max(-dst, vrtX), dst);
    } else {
        const dst = -(parW / 2 - vrtW / 2);
        vrtX = Math.min(Math.max(-dst, vrtX), dst);
    }
    if (parH > vrtH) {
        const dst = parH / 2 - vrtH / 2;
        vrtY = Math.min(Math.max(-dst, vrtY), dst);
    } else {
        const dst = -(parH / 2 - vrtH / 2);
        vrtY = Math.min(Math.max(-dst, vrtY), dst);
    }

    target.style.setProperty("--map-offset-x", vrtX);
    target.style.setProperty("--map-offset-y", vrtY);

    const sW = 246 / vrtW * parW;
    const sH = 138 / vrtH * parH;
    mapvp.style.width = sW + "px";
    mapvp.style.height = sH + "px";
    mapvp.style.transform = `translate(${-vrtX * 246 / vrtW}px, ${-vrtY * 138 / vrtH}px)`;
}
