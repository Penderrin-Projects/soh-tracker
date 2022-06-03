// frameworks
import ObservableStorageObserver from "/emcJS/util/observer/ObservableStorageObserver.js";

// GameTrackerJS
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import AreaStateManager from "/GameTrackerJS/statemanager/world/area/AreaStateManager.js";
import DefaultAreaState from "/GameTrackerJS/state/world/area/DefaultAreaState.js";
import StateListHandler from "/GameTrackerJS/util/handler/StateListHandler.js";
// Track-OOT
import "../../../util/registerStorages.js";

const STORAGES = {dungeonTypes: Savestate.getStorage("dungeonTypes")};

const ALLOWED_TYPES = ["n", "v", "mq"];

function getAccessNeutralBoth(res_v, res_m) {
    if (res_v.value == AccessStateEnum.UNAVAILABLE || res_m.value == AccessStateEnum.UNAVAILABLE) {
        return AccessStateEnum.UNAVAILABLE;
    } else if (res_v.value == AccessStateEnum.POSSIBLE || res_m.value == AccessStateEnum.POSSIBLE) {
        return AccessStateEnum.POSSIBLE;
    } else if (res_v.value == AccessStateEnum.AVAILABLE || res_m.value == AccessStateEnum.AVAILABLE) {
        return AccessStateEnum.AVAILABLE;
    }
    return AccessStateEnum.OPENED;
}

function getAccessNeutralOne(res_v, res_m) {
    if (res_v.value == AccessStateEnum.AVAILABLE || res_m.value == AccessStateEnum.AVAILABLE) {
        return AccessStateEnum.AVAILABLE;
    } else if (res_v.value == AccessStateEnum.POSSIBLE || res_m.value == AccessStateEnum.POSSIBLE) {
        return AccessStateEnum.POSSIBLE;
    } else if (res_v.value == AccessStateEnum.UNAVAILABLE || res_m.value == AccessStateEnum.UNAVAILABLE) {
        return AccessStateEnum.UNAVAILABLE;
    }
    return AccessStateEnum.OPENED;
}

function getAccessNeutral(res_v, res_m) {
    if (SettingsStorage.get("unknown_dungeon_need_both")) {
        const value = getAccessNeutralBoth(res_v, res_m);
        return {
            done: Math.min(res_v.done, res_m.done),
            unopened: Math.min(res_v.done, res_m.done),
            reachable: Math.min(res_v.reachable, res_m.reachable),
            total: Math.min(res_v.total, res_m.total),
            entrances: res_v.entrances && res_m.entrances,
            value
        };
    } else {
        const value = getAccessNeutralOne(res_v, res_m);
        return {
            done: Math.max(res_v.done, res_m.done),
            unopened: Math.max(res_v.done, res_m.done),
            reachable: Math.max(res_v.reachable, res_m.reachable),
            total: Math.max(res_v.total, res_m.total),
            entrances: res_v.entrances || res_m.entrances,
            value
        };
    }
}

export default class DungeonState extends DefaultAreaState {

    #type = "n";

    #listHandler = null;

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        if (props.list_mq != null) {
            const dungeonTypesObserver = new ObservableStorageObserver(STORAGES.dungeonTypes, ref);
            this.#type = dungeonTypesObserver.value;
            dungeonTypesObserver.addEventListener("change", (event) => {
                this.type = event.value;
            });
        }

        /* LIST HANDLER */
        this.#listHandler = this.generateMQList();
        this.#listHandler.addEventListener("access", (event) => {
            this.onMQAccessChange(event);
        });
        this.#listHandler.addEventListener("change", (event) => {
            this.onMQListEntriesChange(event)
        });
    }

    // onVisibilityChange(event) {
    //     // ignore
    // }

    onAccessChange(event) {
        if (this.#type == "v") {
            const ev = new Event("access");
            ev.value = event.value;
            this.dispatchEvent(ev);
        } else if (this.#type != "mq") {
            const acc_mq = this.getAccessMQ();
            const acc = getAccessNeutral(event.value, acc_mq);
            const ev = new Event("access");
            ev.value = acc;
            this.dispatchEvent(ev);
        }
    }

    onListEntriesChange(event) {
        if (this.#type != "mq") {
            if (event.list != null) {
                const ev = new Event("listChange");
                ev.value = event.value;
                this.dispatchEvent(ev);
                this.checkVisibility();
            }
        }
    }

    onMQAccessChange(event) {
        if (this.#type == "mq") {
            const ev = new Event("access");
            ev.value = event.value;
            this.dispatchEvent(ev);
        } else if (this.#type != "v") {
            const acc_v = this.getAccessV();
            const acc = getAccessNeutral(acc_v, event.value);
            const ev = new Event("access");
            ev.value = acc;
            this.dispatchEvent(ev);
        }
    }

    onMQListEntriesChange(event) {
        if (this.#type != "v") {
            if (event.list != null) {
                const ev = new Event("listChange");
                ev.value = event.value;
                this.dispatchEvent(ev);
                this.checkVisibility();
            }
        }
    }

    set type(value) {
        const ref = this.ref;
        if (!ALLOWED_TYPES.includes(value)) {
            value = "n";
        }
        if (value != this.#type) {
            this.#type = value;
            STORAGES.dungeonTypes.set(ref, value);
            // external
            const typeEvent = new Event("type");
            typeEvent.value = value;
            this.dispatchEvent(typeEvent);

            const accessEvent = new Event("access");
            accessEvent.value = this.access;
            this.dispatchEvent(accessEvent);
        }
    }

    get type() {
        return this.#type;
    }

    get access() {
        return this.getAccess();
    }

    get listVisible() {
        if (this.#type == "v") {
            return super.listVisible;
        } else if (this.#type == "mq") {
            return this.#listHandler.visible;
        }
        return true;
    }

    getAccess(type = this.#type) {
        if (type == "v") {
            return this.getAccessV();
        } else if (type == "mq") {
            return this.getAccessMQ();
        } else {
            const acc_v = this.getAccessV();
            const acc_mq = this.getAccessMQ();
            const acc = getAccessNeutral(acc_v, acc_mq);
            return acc;
        }
    }

    getAccessV() {
        return super.access;
    }

    getAccessMQ() {
        return this.#listHandler.access ?? this.defaultAccess;
    }

    /* list */
    generateList() {
        const ref = `${this.ref}/v`;
        const list = this.props.list;
        const listHandler = new StateListHandler(ref, list);
        return listHandler;
    }

    generateMQList() {
        const ref = `${this.ref}/mq`;
        const list = this.props.list_mq;
        const listHandler = new StateListHandler(ref, list);
        return listHandler;
    }

    getList(type = this.#type) {
        if (type == "v") {
            return super.getList();
        }
        if (type == "mq") {
            return this.#listHandler.list;
        }
        return [];
    }

    setAllEntries(value = true) {
        if (this.#type == "v") {
            super.setAllEntries(value);
        } else if (this.#type == "mq") {
            this.#listHandler.setAllEntries(value);
        }
    }

}

AreaStateManager.register("dungeon", DungeonState);
AreaStateManager.register("boss_dungeon", DungeonState);
