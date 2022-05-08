// frameworks
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import Helper from "/emcJS/util/helper/Helper.js";

import LocationStateManager from "../../statemanager/world/location/LocationStateManager.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";

const ACCESS = new WeakMap();
const LIST_RESOLVED = new WeakMap();
const LIST_FILTERED = new WeakMap();

export function getDefaultAccess() {
    return {
        done: 0,
        unopened: 0,
        reachable: 0,
        total: 0,
        value: AccessStateEnum.OPENED
    };
}

export default class OverworldListHandler extends EventTarget {

    constructor() {
        super();
        /* --- */
        ACCESS.set(this, getDefaultAccess());
        setTimeout(() => {
            this.#generateList();
        }, 0);
    }

    #generateList() {
        const entityList = new Map();
        const filteredEntityList = new Map();
        for (const [key, loc] of LocationStateManager) {
            const record = {
                "id": key,
                "x": 0,
                "y": 0,
                "category": "location"
            };
            entityList.set(loc, record);
            if (loc.isVisible()) {
                filteredEntityList.set(loc, record);
            }
            /* event manager */
            const eventManager = new EventTargetManager(loc);
            eventManager.set("access", () => {
                if (filteredEntityList.has(loc)) {
                    this.#refreshAccess();
                }
            });
            eventManager.set("visiblity", () => {
                if (loc.isVisible()) {
                    if (!filteredEntityList.has(loc)) {
                        filteredEntityList.set(loc, entityList.get(loc));
                        this.#refreshAccess();
                    }
                } else if (filteredEntityList.has(loc)) {
                    filteredEntityList.delete(loc);
                    this.#refreshAccess();
                }
            });
        }
        /* --- */
        LIST_RESOLVED.set(this, entityList);
        LIST_FILTERED.set(this, filteredEntityList);
        this.#refreshAccess();
    }

    #setAccess(value) {
        if (value != null) {
            const old = ACCESS.get(this);
            if (!Helper.isEqual(old, value)) {
                ACCESS.set(this, value);
                // external
                const event = new Event("access");
                event.data = value;
                this.dispatchEvent(event);
            }
        }
    }

    #refreshAccess() {
        const entityList = LIST_FILTERED.get(this);
        const access = {
            done: 0,
            unopened: 0,
            reachable: 0,
            total: 0,
            value: AccessStateEnum.OPENED
        };
        for (const [loc] of entityList) {
            if (loc.isVisible()) {
                const {done, unopened, reachable, total} = loc.access;
                access.done += done;
                access.unopened += unopened;
                access.reachable += reachable;
                access.total += total;
            }
        }
        if (access.unopened > 0) {
            if (access.reachable > 0) {
                if (access.unopened == access.reachable) {
                    access.value = AccessStateEnum.AVAILABLE;
                } else {
                    access.value = AccessStateEnum.POSSIBLE;
                }
            } else {
                access.value = AccessStateEnum.UNAVAILABLE;
            }
        }
        this.#setAccess(access);
    }

    get access() {
        return ACCESS.get(this);
    }

}
