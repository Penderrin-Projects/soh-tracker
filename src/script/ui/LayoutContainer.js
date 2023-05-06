// frameworks
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import Layout from "/emcJS/ui/layout/Layout.js";

// GameTrackerJS
import "/GameTrackerJS/ui/panel/exitlist/ExitList.js";
import "/GameTrackerJS/ui/panel/locationlist/LocationList.js";
// Track-OOT
import LayoutsResource from "/script/resource/LayoutsResource.js";
import "/script/ui/panel/itemgrid/ItemGrid.js";
import "/script/ui/panel/worldlist/WorldList.js";
import "/script/ui/panel/worldmap/WorldMap.js";
import "/script/ui/panel/shoplist/ShopList.js";
import "/script/ui/panel/songlist/SongList.js";
import "/script/ui/panel/dungeonstate/DungeonState.js";

const STYLE = new GlobalStyle(`
.state {
    display: inline;
    padding: 0 5px;
    white-space: nowrap;
}
`);

class HTMLTrackerLayoutContainer extends Layout {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    get layout() {
        return this.getAttribute("layout");
    }

    set layout(val) {
        this.setAttribute("layout", val);
    }

    static get observedAttributes() {
        return ["layout"];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "layout":
                if (oldValue != newValue) {
                    const layout = LayoutsResource.get(newValue);
                    if (layout) {
                        super.loadLayout(layout);
                    }
                }
                break;
        }
    }

}

customElements.define("ootrt-layoutcontainer", HTMLTrackerLayoutContainer);
