import EventBus from "/emcJS/event/EventBus.js";
import SubAreaStates from "/script/state/SubAreaStates.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateFilter from "/script/state/abstract/StateFilter.js";
import WorldRegistry from "/script/registries/WorldRegistry.js";
import ExitRegistry from "/script/registries/ExitRegistry.js";
import Logic from "/script/util/logic/Logic.js";
import StateDataEventManager from "/script/util/StateDataEventManager.js";

// TODO

const EXIT_DATA = new WeakMap();
const ACCESS = new WeakMap();
const AREA = new WeakMap();

function getEntranceArea(value) {
    const entrance = ExitRegistry.get(value);
    return WorldRegistry.get(entrance.exitData.area);
}

function getLogicAccess(access) {
    return (!!Logic.getValue(`${access}[child]`) || !!Logic.getValue(`${access}[adult]`));
}

function getAccess(data, access) {
    return (!!data[`${access}[child]`] || !!data[`${access}[adult]`]);
}

function internalAreaChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.area = change.newValue;
    }
}

export default class DefaultState extends StateFilter {

    constructor(ref, props, exitData) {
        super(ref, props);
        /* --- */
        const logicAccess = props.access.split(" -> ")[0];
        EXIT_DATA.set(this, exitData);
        ACCESS.set(this, getLogicAccess(logicAccess));
        this.area = StateStorage.read(ref, false);
        /* EVENTS */
        // TODO get access on logic change
        EventBus.register("state::subexit_area", internalAreaChange.bind(this));
        EventBus.register("net::state::subexit_area", internalAreaChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        // TODO on area access change throw event
        /* register */
        WorldRegistry.set(ref, this);
    }

    stateLoaded(event) {
        // TODO
    }

    set area(value) {
        const old = this.value;
        if (value != old) {
            AREA.set(this, value);
            StateStorage.writeExtra("exits", this.ref, value);
            // external
            const event = new Event("area");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state::subexit_area", {
                ref: this.ref,
                oldValue: old,
                newValue: this.value
            });
        }
    }

    get area() {
        return AREA.get(this);
    }

    get access() {
        const area = AREA.get(this);
        if (SubAreaStates.has(area)) {
            return SubAreaStates.get(area).access;
        }
        return ACCESS.get(this);
    }

}
