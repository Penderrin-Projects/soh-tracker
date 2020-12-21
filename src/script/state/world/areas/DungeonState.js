import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import AreaStates from "/script/state/AreaStates.js";
import DefaultState from "/script/state/world/areas/DefaultState.js";
import WorldRegistry from "/script/state/WorldRegistry.js";

const TYPE = new WeakMap();

/*
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
*/

function internalTypeChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.applyTypeValue(change.newValue || "n");
    }
}

function dungeonTypeUpdate(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data[ref];
    if (change != null) {
        this.applyTypeValue(change.newValue || "n");
    }
}

export default class DungeonState extends DefaultState {

    constructor(ref, props, areaData) {
        super(ref, props, areaData);
        /* --- */
        this.applyTypeValue(StateStorage.readExtra("dungeontype", ref, "n"));
        /* EVENTS */
        EventBus.register("state::dungeontype", internalTypeChange.bind(this));
        EventBus.register("statechange_dungeontype", dungeonTypeUpdate.bind(this)); // TODO remove later
        this.addEventListener("type", event => {
            this.calculateAvailability();
        });
    }

    /*#*/applyTypeValue(newValue) {
        const type = TYPE.get(this);
        if (type != newValue) {
            TYPE.set(this, newValue);
            // external
            const event = new Event("type");
            event.data = newValue;
            this.dispatchEvent(event);
        }
    }

    stateLoaded(event) {
        const props = this.props;
        // type
        if (props["maxmq"] != null && props["related_dungeon"] != null) {
            const types = event.data.extra.dungeontype;
            if (types != null) {
                this.type = types[props.related_dungeon];
            } else {
                this.type = "n";
            }
        }
        // savesatate
        super.stateLoaded(event);
    }

    getFilteredList() {
        const areaData = this.areaData;
        if (areaData != null) {
            const list = areaData.lists[this.type];
            if (list != null) {
                const result = [];
                list.forEach(record => {
                    const id = `${record.category}/${record.id}`;
                    const loc = WorldRegistry.get(id);
                    if (!!loc && loc.visible) {
                        result.push(record);
                    }
                });
                return result;
            }
        }
        // TODO check for both if type == "n"
        /* TODO use this for type == "n" results
            if (await SettingsStorage.get("unknown_dungeon_need_both", false)) {
                if (res_v.value == AccessStateEnum.UNAVAILABLE || res_m.value == AccessStateEnum.UNAVAILABLE) {
                    header_value == "unavailable";
                } else if (res_v.value == AccessStateEnum.POSSIBLE || res_m.value == AccessStateEnum.POSSIBLE) {
                    header_value == "possible";
                } else if (res_v.value == AccessStateEnum.AVAILABLE || res_m.value == AccessStateEnum.AVAILABLE) {
                    header_value == "available";
                } else {
                    header_value == "opened";
                }
            } else {
                if (res_v.value == AccessStateEnum.AVAILABLE || res_m.value == AccessStateEnum.AVAILABLE) {
                    header_value == "available";
                } else if (res_v.value == AccessStateEnum.POSSIBLE || res_m.value == AccessStateEnum.POSSIBLE) {
                    header_value == "possible";
                } else if (res_v.value == AccessStateEnum.UNAVAILABLE || res_m.value == AccessStateEnum.UNAVAILABLE) {
                    header_value == "unavailable";
                } else {
                    header_value == "opened";
                }
            }
        */
    }

    get type() {
        return TYPE.get(this);
    }

}

AreaStates.register("dungeon", DungeonState);
AreaStates.register("boss_dungeon", DungeonState);
