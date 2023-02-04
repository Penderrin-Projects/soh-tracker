// frameworks
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import {
    immute
} from "/emcJS/data/Immutable.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";

import LocationStateManager from "/GameTrackerJS/statemanager/world/location/LocationStateManager.js";
import AreaStateManager from "/GameTrackerJS/statemanager/world/area/AreaStateManager.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import ListRecordState from "/GameTrackerJS/state/world/ListRecordState.js";

const DUNGEON_TYPES = [
    "dungeon",
    "boss_dungeon"
];

export function getDefaultAccess() {
    return {
        done_min: 0,
        done_max: 0,
        unopened_min: 0,
        unopened_max: 0,
        reachable_min: 0,
        reachable_max: 0,
        total_min: 0,
        total_max: 0,
        value: AccessStateEnum.OPENED
    };
}

let instance = null;

export default class WorldSummaryHandler extends EventTarget {

    #access = getDefaultAccess();

    #entityList = new Set();

    #filteredEntityList = new Set();

    #dungeonList = new Set();

    constructor() {
        if (instance != null) {
            return instance;
        }
        super();
        instance = this;
        /* --- */
        this.#generateList();
    }

    #generateList = debounce(() => {
        const usedLocations = new Set();
        for (const [, area] of AreaStateManager) {
            if (DUNGEON_TYPES.includes(area.props.type)) {
                this.#dungeonList.add(area);
                const eventManager = new EventTargetManager(area);
                eventManager.set("access", () => {
                    this.#refreshAccess();
                });
                /* --- */
                const listV = area.props.list.filter((r) => r.category == "location").map((r) => r.id);
                const listMQ = area.props.list_mq.filter((r) => r.category == "location").map((r) => r.id);
                for (const entry of listV) {
                    usedLocations.add(entry);
                }
                for (const entry of listMQ) {
                    usedLocations.add(entry);
                }
            }
        }

        let idx = 0;
        for (const [key] of LocationStateManager) {
            if (!usedLocations.has(key)) {
                const record = {
                    "id": key,
                    "x": 0,
                    "y": 0,
                    "category": "location"
                };
                const recordState = new ListRecordState(`summary-${idx++}`, record);
                this.#entityList.add(recordState);
                if (recordState.visible) {
                    this.#filteredEntityList.add(recordState);
                }
                const eventManager = new EventTargetManager(recordState);
                eventManager.set("access", () => {
                    if (this.#filteredEntityList.has(recordState)) {
                        this.#refreshAccess();
                    }
                });
                eventManager.set("visibility", (event) => {
                    if (event.value) {
                        if (!this.#filteredEntityList.has(recordState)) {
                            this.#filteredEntityList.add(recordState);
                            this.#refreshAccess();
                        }
                    } else if (this.#filteredEntityList.has(recordState)) {
                        this.#filteredEntityList.delete(recordState);
                        this.#refreshAccess();
                    }
                });
            }
        }
        /* --- */
        this.#refreshAccess();
    });

    #setAccess(value) {
        if (value != null) {
            if (!isEqual(this.#access, value)) {
                this.#access = value;
                // external
                const event = new Event("access");
                event.value = value;
                this.dispatchEvent(event);
            }
        }
    }

    #refreshAccess() {
        const access = {
            done_min: 0,
            done_max: 0,
            unopened_min: 0,
            unopened_max: 0,
            reachable_min: 0,
            reachable_max: 0,
            total_min: 0,
            total_max: 0,
            value: AccessStateEnum.OPENED
        };
        for (const recordState of this.#filteredEntityList) {
            const {done, unopened, reachable, total} = recordState.access;
            access.done_min += done;
            access.done_max += done;
            access.unopened_min += unopened;
            access.unopened_max += unopened;
            access.reachable_min += reachable;
            access.reachable_max += reachable;
            access.total_min += total;
            access.total_max += total;
        }
        for (const area of this.#dungeonList) {
            if (area.type == "v" || area.type == "mq") {
                const {done, unopened, reachable, total} = area.access;
                access.done_min += done;
                access.done_max += done;
                access.unopened_min += unopened;
                access.unopened_max += unopened;
                access.reachable_min += reachable;
                access.reachable_max += reachable;
                access.total_min += total;
                access.total_max += total;
            } else {
                const {
                    done: doneV,
                    unopened: unopenedV,
                    reachable: reachableV,
                    total: totalV
                } = area.getAccess("v");
                const {
                    done: doneMQ,
                    unopened: unopenedMQ,
                    reachable: reachableMQ,
                    total: totalMQ
                } = area.getAccess("mq");
                if (doneV < doneMQ) {
                    access.done_min += doneV;
                    access.done_max += doneMQ;
                } else {
                    access.done_min += doneMQ;
                    access.done_max += doneV;
                }
                if (unopenedV < unopenedMQ) {
                    access.unopened_min += unopenedV;
                    access.unopened_max += unopenedMQ;
                } else {
                    access.unopened_min += unopenedMQ;
                    access.unopened_max += unopenedV;
                }
                if (reachableV < reachableMQ) {
                    access.reachable_min += reachableV;
                    access.reachable_max += reachableMQ;
                } else {
                    access.reachable_min += reachableMQ;
                    access.reachable_max += reachableV;
                }
                if (totalV < totalMQ) {
                    access.total_min += totalV;
                    access.total_max += totalMQ;
                } else {
                    access.total_min += totalMQ;
                    access.total_max += totalV;
                }
            }
        }
        if (access.unopened_max > 0) {
            if (access.reachable_max > 0) {
                if (access.unopened_max == access.reachable_max) {
                    access.value = AccessStateEnum.AVAILABLE;
                } else {
                    access.value = AccessStateEnum.POSSIBLE;
                }
            } else {
                access.value = AccessStateEnum.UNAVAILABLE;
            }
        }
        this.#setAccess(immute(access));
    }

    get access() {
        return this.#access;
    }

}
