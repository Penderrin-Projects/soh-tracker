// frameworks
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";


// GameTrackerJS
import WorldResource from "/GameTrackerJS/resource/WorldResource.js";
import LocationStateManager from "/GameTrackerJS/state/world/location/StateManager.js";
import "/GameTrackerJS/state/world/OverworldState.js";
import AreaStateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import "/GameTrackerJS/state/world/exit/StateManager.js";
import "/GameTrackerJS/state/world/location/StateManager.js";
import "/GameTrackerJS/state/world/subarea/StateManager.js";
import "/GameTrackerJS/state/world/subexit/StateManager.js";
// Track-OOT
import "/script/state/world/CustomWorldStates.js";

const TPL = new Template(`
<div class="state">
    <span id="locations-done">#</span> done / <span id="locations-available">#</span> avail / <span id="locations-missing">#</span> miss
</div>
`);
    
const STYLE = new GlobalStyle(`
.state {
    display: inline;
    padding: 0 5px;
    white-space: nowrap;
}
`);

const DUNGEON_TYPES = [
    "dungeon",
    "boss_dungeon"
];
const locationMarkerData = WorldResource.get("marker/location");
const areaMarkerData = WorldResource.get("marker/area");

function checkList(entityList) {
    let reachable = 0;
    let unopened = 0;
    let done = 0;
    for (const loc of entityList) {
        if (loc.isVisible()) {
            const access = loc.access;
            reachable += access.reachable;
            unopened += access.unopened;
            done += access.done;
        }
    }
    return {reachable, unopened, done};
}

const LIST = new WeakMap();
const DUNGEON_LIST = new WeakMap();

export default class LocationState extends UIEventBusMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const {entityList, dungeonList} = this.generateList(locationMarkerData);
        LIST.set(this, entityList);
        DUNGEON_LIST.set(this, dungeonList);
        this.updateStates();
    }
    
    updateStates() {
        const dungeonList = DUNGEON_LIST.get(this);
        const entityList = LIST.get(this);
        const doneEl = this.shadowRoot.getElementById("locations-done");
        const availEl = this.shadowRoot.getElementById("locations-available");
        const missEl = this.shadowRoot.getElementById("locations-missing");
        let reachable_min = 0;
        let reachable_max = 0;
        let unopened_min = 0;
        let unopened_max = 0;
        let done_min = 0;
        let done_max = 0;
        for (const area of dungeonList) {
            if (area.type == "v" || area.type == "mq") {
                const access = area.access;
                reachable_min += access.reachable;
                reachable_max += access.reachable;
                unopened_min += access.unopened;
                unopened_max += access.unopened;
                done_min += access.done;
                done_max += access.done;
            } else {
                const cv = area.getAccessV();
                const cm = area.getAccessMQ();
                if (cv.reachable < cm.reachable) {
                    reachable_min += cv.reachable;
                    reachable_max += cm.reachable;
                } else {
                    reachable_min += cm.reachable;
                    reachable_max += cv.reachable;
                }
                if (cv.unopened < cm.unopened) {
                    unopened_min += cv.unopened;
                    unopened_max += cm.unopened;
                } else {
                    unopened_min += cm.unopened;
                    unopened_max += cv.unopened;
                }
                if (cv.done < cm.done) {
                    done_min += cv.done;
                    done_max += cm.done;
                } else {
                    done_min += cm.done;
                    done_max += cv.done;
                }
            }
        }
        {
            const {reachable, unopened, done} = checkList(entityList);
            reachable_min += reachable;
            reachable_max += reachable;
            unopened_min += unopened;
            unopened_max += unopened;
            done_min += done;
            done_max += done;
        }
        if (reachable_min == reachable_max) {
            availEl.innerHTML = reachable_min;
        } else {
            availEl.innerHTML = `[${reachable_min}..${reachable_max}]`;
        }
        if (unopened_min == unopened_max) {
            missEl.innerHTML = unopened_min;
        } else {
            missEl.innerHTML = `[${unopened_min}..${unopened_max}]`;
        }
        if (done_min == done_max) {
            doneEl.innerHTML = done_min;
        } else {
            doneEl.innerHTML = `[${done_min}..${done_max}]`;
        }
    }

    generateList(list) {
        const usedLocations = new Set();
        const entityList = new Set();
        const dungeonList = new Set();
        for (const key in areaMarkerData) {
            const area = AreaStateManager.get(key);
            if (DUNGEON_TYPES.includes(area.props.type)) {
                dungeonList.add(area);
                const eventManager = new EventTargetManager(area);
                eventManager.set("access", () => {
                    this.updateStates();
                });
                /* --- */
                const listV = area.getRawList("v");
                const listMQ = area.getRawList("mq");
                for (const entry of listV) {
                    usedLocations.add(entry.id);
                }
                for (const entry of listMQ) {
                    usedLocations.add(entry.id);
                }
            }
        }
        for (const key in list) {
            if (!usedLocations.has(key)) {
                const loc = LocationStateManager.get(key);
                if (loc != null) {
                    const eventManager = new EventTargetManager(loc);
                    entityList.add(loc);
                    eventManager.set(["access", "visible", "filter"], () => {
                        this.updateStates();
                    });
                }
            }
        }
        return {entityList, dungeonList};
    }

}

customElements.define("ootrt-locationstate", LocationState);
