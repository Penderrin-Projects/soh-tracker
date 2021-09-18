// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import { mix } from "/emcJS/util/Mixin.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
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

const TPL = new Template(`
<div id="map">
    <div id="shadow">
        <div id="focus">
        </div>
    </div>
</div>
`);

const STYLE = new GlobalStyle(`
#map {
    position: relative;
    box-sizing: border-box;
    width: 200px;
    height: 200px;
    background-color: #000000;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-origin: content-box;
    overflow: hidden;
    
    border: solid 2px red;
}
#shadow {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
    flex-shrink: 0;
    pointer-events: none;
}
#focus {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-origin: content-box;
    overflow: hidden;

    clip-path: inset(
        calc(var(--top, 0) * 1px)
        calc(var(--right, 0) * 1px)
        calc(var(--bottom, 0) * 1px)
        calc(var(--left, 0) * 1px)
    );
}
`);

const WIDTH = new WeakMap();
const HEIGHT = new WeakMap();
const ZOOM = new WeakMap();
const OFFSET_X = new WeakMap();
const OFFSET_Y = new WeakMap();

const BaseClass = mix(
    Panel
).with(
    StateDataEventManagerMixin
);

export default class WorldMapOverview extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);

        /* VALUES */
        WIDTH.set(this, 0);
        HEIGHT.set(this, 0);
        ZOOM.set(this, 100);
        OFFSET_X.set(this, 0);
        OFFSET_Y.set(this, 0);

        /* MAP EVENTS */
        const mapEl = this.shadowRoot.getElementById("map");
        const mapEventManager = new EventTargetManager(mapEl);
        mapEventManager.set(["mousedown", "mousemove"], (event) => {
            if (!this.fixed && event.buttons === 1) {
                const evX = event.layerX;
                const evY = event.layerY;
                const zoom = ZOOM.get(this);
                const width = WIDTH.get(this);
                const height = HEIGHT.get(this);
                const vrtW = width * zoom / 100;
                const vrtH = height * zoom / 100;
                /* event */
                const ev = new Event("move");
                ev.x = -(evX - 100) * (vrtW / 200);
                ev.y = -(evY - 100) * (vrtH / 200);
                this.dispatchEvent(ev);
            }
            event.preventDefault();
            return false;
        });
    }

    setTransform(x, y, zoom) {
        OFFSET_X.set(this, x);
        OFFSET_Y.set(this, y);
        ZOOM.set(this, zoom);
        const width = WIDTH.get(this);
        const height = HEIGHT.get(this);
        this./*#*/__calcutlateMask(width, height, x, y, zoom);
    }

    /*#*/__calcutlateMask(width, height, x, y, zoom) {
        const focusEl = this.shadowRoot.getElementById("focus");
        if (focusEl != null) {
            if (width <= 0 || height <= 0) {
                focusEl.style.setProperty("--left", 0);
                focusEl.style.setProperty("--top", 0);
                focusEl.style.setProperty("--right", 0);
                focusEl.style.setProperty("--bottom", 0);
            } else {
                const scale = 200 / Math.max(width, height);
                const container = this.getRootNode().host;
                const cntW = container.clientWidth;
                const cntH = container.clientHeight;
                const mapW = width * zoom / 100;
                const mapH = height * zoom / 100;

                const minmapW = width * scale;
                const minmapH = height * scale;
                const rectW = minmapW / mapW * cntW;
                const rectH = minmapH / mapH * cntH;
                const halfW = rectW / 2;
                const halfH = rectH / 2;
                
                const posX = -x * minmapW / mapW;
                const posY = -y * minmapH / mapH;
                
                const left = 100 + posX - halfW;
                const top = 100 + posY - halfH;
                const right = 100 - posX - halfW;
                const bottom = 100 - posY - halfH;

                focusEl.style.setProperty("--left", left);
                focusEl.style.setProperty("--top", top);
                focusEl.style.setProperty("--right", right);
                focusEl.style.setProperty("--bottom", bottom);
            }
        }
    }

    applyDefaultValues() {
        /* VALUES */
        WIDTH.set(this, 0);
        HEIGHT.set(this, 0);
        /* map */
        const mapEl = this.shadowRoot.getElementById("map");
        if (mapEl != null) {
            mapEl.style.backgroundImage = "";
        }
        const focusEl = this.shadowRoot.getElementById("focus");
        if (focusEl != null) {
            focusEl.style.backgroundImage = "";
        }
    }

    applyStateValues(state) {
        const mapData = state.props.map;
        /* VALUES */
        WIDTH.set(this, mapData.width ?? 0);
        HEIGHT.set(this, mapData.height ?? 0);
        /* map */
        const mapEl = this.shadowRoot.getElementById("map");
        if (mapEl != null) {
            mapEl.style.backgroundImage = `url("/images/maps/${mapData.background}")`;
        }
        const focusEl = this.shadowRoot.getElementById("focus");
        if (focusEl != null) {
            focusEl.style.backgroundImage = `url("/images/maps/${mapData.background}")`;
        }
    }

    get ref() {
        return this.getAttribute("ref");
    }

    set ref(val) {
        this.setAttribute("ref", val);
    }

    get fixed() {
        const value = this.getAttribute("fixed");
        return !!value && value != "false";
    }

    set fixed(val) {
        this.setAttribute("fixed", !!val);
    }

    static get observedAttributes() {
        return ["ref"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "ref": {
                    const state = AreaStateManager.get(this.ref);
                    if (state?.hasMap) {
                        this.switchState(state);
                    } else {
                        const defaultState = AreaStateManager.get(WorldListState.config.defaultArea);
                        this.switchState(defaultState);
                    }
                } break;
            }
        }
    }

}

customElements.define("gt-worldmap-overview", WorldMapOverview);
