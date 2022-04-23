// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

// GameTrackerJS
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import AccessStateEnum from "/GameTrackerJS/enum/AccessStateEnum.js";
import AreaStateManager from "/GameTrackerJS/statemanager/world/area/AreaStateManager.js";
import DefaultAreaState from "/GameTrackerJS/state/world/area/DefaultAreaState.js";
import StateListHandler from "/GameTrackerJS/util/handler/StateListHandler.js";

const STORAGES = {dungeonTypes: Savestate.getStorage("dungeonTypes")};

const ALLOWED_TYPES = ["n", "v", "mq"];
const TYPE = new WeakMap();
const LIST_HANDLER = new WeakMap();

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

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        if (props.list_mq != null) {
            const dungeonTypesObserver = new DataStorageValueObserver(STORAGES.dungeonTypes, ref, "n");
            TYPE.set(this, dungeonTypesObserver.value);
            dungeonTypesObserver.addEventListener("change", (event) => {
                this.type = event.data;
            });
        }

        /* LIST HANDLER */
        const listHandler = this.generateMQList();
        listHandler.addEventListener("access", (event) => {
            this.onMQAccessChange(event);
        });
        listHandler.addEventListener("change", (event) => {
            this.onMQListEntriesChange(event)
        });
        LIST_HANDLER.set(this, listHandler);
    }

    onVisibilityChange(event) {
        // ignore
    }

    onAccessChange(event) {
        if (this.type == "v") {
            const ev = new Event("access");
            ev.data = event.data;
            this.dispatchEvent(ev);
        } else if (this.type != "mq") {
            const acc_mq = this.getAccessMQ();
            const acc = getAccessNeutral(event.data, acc_mq);
            const ev = new Event("access");
            ev.data = acc;
            this.dispatchEvent(ev);
        }
    }

    onListEntriesChange(event) {
        if (this.type != "mq") {
            this.checkAllFilter();
            if (event.list != null) {
                const ev = new Event("list_update");
                ev.data = event.list;
                this.dispatchEvent(ev);
            }
        }
    }

    onMQAccessChange(event) {
        if (this.type == "mq") {
            const ev = new Event("access");
            ev.data = event.data;
            this.dispatchEvent(ev);
        } else if (this.type != "v") {
            const acc_v = this.getAccessV();
            const acc = getAccessNeutral(acc_v, event.data);
            const ev = new Event("access");
            ev.data = acc;
            this.dispatchEvent(ev);
        }
    }

    onMQListEntriesChange(event) {
        if (this.type != "v") {
            this.checkAllFilter();
            if (event.list != null) {
                const ev = new Event("list_update");
                ev.data = event.list;
                this.dispatchEvent(ev);
            }
        }
    }

    set type(value) {
        const ref = this.ref;
        if (!ALLOWED_TYPES.includes(value)) {
            value = "n";
        }
        const old = this.type;
        if (value != old) {
            TYPE.set(this, value);
            STORAGES.dungeonTypes.set(ref, value);
            // external
            const event = new Event("type");
            event.data = value;
            this.dispatchEvent(event);
            
            const ev2 = new Event("access");
            ev2.data = this.access;
            this.dispatchEvent(ev2);
        }
    }

    get type() {
        return TYPE.get(this);
    }

    get access() {
        return this.getAccess();
    }

    getListVisiblity() {
        return true;
    }

    getAccess(type = this.type) {
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
        const listHandler = LIST_HANDLER.get(this);
        return listHandler.access ?? this.defaultAccess;
    }

    /* list */
    generateList() {
        const ref = `${this.ref}/v`;
        const list = this.props.list;
        const listHandler = new StateListHandler(list, ref);
        return listHandler;
    }

    generateMQList() {
        const ref = `${this.ref}/mq`;
        const list = this.props.list_mq;
        const listHandler = new StateListHandler(list, ref);
        return listHandler;
    }

    getList(type = this.type) {
        if (type == "v") {
            return super.getList();
        }
        if (type == "mq") {
            return this.props.list_mq;
        }
    }

    setAllEntries(value = true) {
        const type = this.type;
        if (type == "mq") {
            const listHandler = LIST_HANDLER.get(this);
            listHandler.setAllEntries(value);
        } else if (type == "v") {
            super.setAllEntries(value);
        }
    }

}

AreaStateManager.register("dungeon", DungeonState);
AreaStateManager.register("boss_dungeon", DungeonState);
