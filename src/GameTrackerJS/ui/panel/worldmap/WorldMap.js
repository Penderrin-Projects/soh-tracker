// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import { mix } from "/emcJS/util/Mixin.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "/emcJS/i18n/ui/I18nLabel.js";

import WorldListState from "../../../state/world/WorldListState.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";
import StateDataEventManagerMixin from "../../mixin/StateDataEventManager.js";
import "../../button/FilterMenuButton.js";
import "../../button/HintButton.js";
import "./components/WorldMapView.js";
import "./components/WorldMapOverview.js";

//TODO save map settings per map

const TPL = new Template(`
<gt-worldmap-view id="view"></gt-worldmap-view>
<div class="overview-wrapper">
    <gt-worldmap-overview id="overview"></gt-worldmap-overview>
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    position: relative;
    box-sizing: border-box;
    display: grid;
    min-height: 100%;
    width: 400px;
    height: 200px;
    user-select: none;
}
.overview-wrapper {
    position: absolute;
    bottom: 10px;
    left: 10px;
    border-style: solid;
    border-width: 2px;
    border-color: var(--page-border-color, #ffffff);
    transform-origin: bottom left;
    transform: scale(0.2);
    transition: transform .2s;
}
.overview-wrapper:hover {
    transform: scale(1);
}
`);

const BaseClass = mix(
    Panel
).with(
    StateDataEventManagerMixin
);

export default class WorldMap extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* state handler */
        WorldListState.addEventListener("area", event => {
            this.ref = event.data;
        });
        /* view */
        const viewEl = this.shadowRoot.getElementById("view");
        const overviewEl = this.shadowRoot.getElementById("overview");
        viewEl.addEventListener("transform", (event) => {
            // console.log("transform", event.x, event.y, event.zoom);
            overviewEl.setTransform(event.x, event.y, event.zoom);
        });
        overviewEl.addEventListener("move", (event) => {
            // console.log("move", event.x, event.y);
            viewEl.setTranslation(event.x, event.y);
        });
    }

    connectedCallback() {
        super.connectedCallback();
        /* init reference */
        this.ref = WorldListState.area;
    }

    get ref() {
        return this.getAttribute("ref") || WorldListState.config.default;
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
                    /* overview */
                    const overviewEl = this.shadowRoot.getElementById("overview");
                    if (overviewEl != null) {
                        overviewEl.ref = this.ref;
                    }
                    /* view */
                    const viewEl = this.shadowRoot.getElementById("view");
                    if (viewEl != null) {
                        viewEl.ref = this.ref;
                    }
                } break;
            }
        }
    }

}

Panel.registerReference("worldmap", WorldMap);
customElements.define("gt-worldmap", WorldMap);
