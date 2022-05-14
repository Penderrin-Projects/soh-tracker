// frameworks
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";

import LogicExecutor from "../logic/LogicExecutor.js";
import FilterStorage from "../../savestate/storage/FilterStorage.js";

const SPECIAL_FILTERS = [
    "access",
    "!access",
    "done",
    "!done"
];

function mapToObj(map) {
    const res = {};
    map.forEach((v, k) => {
        res[k] = v;
    });
    return res;
}

export default class FilterHandler extends EventTarget {

    #logics = new Map();

    #values = new Map();

    constructor(config = {}) {
        super();
        /* FILTER */
        for (const filter in config) {
            const filterValue = FilterStorage.get(filter);
            for (const value in config[filter]) {
                const logic = config[filter][value];
                this.#compileLogic(filter, value, filterValue, logic)
            }
        }
        /* EVENTS */
        FilterStorage.addEventListener("change", () => {
            this.update();
        });
        const logicEventManager = new EventTargetManager(LogicExecutor);
        logicEventManager.set(["reset", "change"], () => {
            this.update();
        });
        /* --- */
        // setTimeout(() => {
        //     this.update();
        // }, 0);
    }

    #compileLogic(filter, value, filterValue, logic) {
        const logicKey = `${filter}[${value}]`;
        this.#values.set(filter, true);
        if (typeof logic == "object") {
            /* LOGIC */
            const logicFn = LogicCompiler.compile(logic);
            this.#logics.set(logicKey, logicFn);
            /* VALUE */
            if (value == filterValue) {
                const logicValue = LogicExecutor.execute(logicFn);
                this.#values.set(filter, logicValue);
            }
        } else if (SPECIAL_FILTERS.includes(logic)) {
            /* LOGIC */
            this.#logics.set(logicKey, logic);
            /* VALUE */
            if (value == filterValue) {
                const logicValue = this.#executeSpecialFilter(logic);
                this.#values.set(filter, logicValue);
            }
        } else if (logic != null) {
            /* LOGIC */
            this.#logics.set(logicKey, logic);
            /* VALUE */
            if (value == filterValue) {
                const logicValue = !!logic;
                this.#values.set(filter, logicValue);
            }
        }
    }

    update = debounce(() => {
        if (this.#values != null) {
            const changes = {};
            for (const [filter, oldValue] of this.#values) {
                const value = FilterStorage.get(filter);
                const logicKey = `${filter}[${value}]`;

                const logicValue = this.#executeFilter(logicKey);
                if (oldValue != logicValue) {
                    this.#values.set(filter, logicValue);
                    changes[filter] = logicValue;
                }
            }
            if (Object.keys(changes).length) {
                const event = new Event("change");
                event.value = changes;
                this.dispatchEvent(event);
            }
        }
    });

    #executeFilter(name) {
        const logicFn = this.#logics.get(name);
        if (typeof logicFn == "function") {
            return LogicExecutor.execute(logicFn);
        } else if (typeof logicFn == "string") {
            return this.#executeSpecialFilter(logicFn);
        } else if (logicFn != null) {
            return !!logicFn;
        }
        return true;
    }

    #executeSpecialFilter(name) {
        // const access = this.access;
        // switch (name) {
        //     case "access": return access.value != AccessStateEnum.UNAVAILABLE;
        //     case "!access": return access.value == AccessStateEnum.UNAVAILABLE;
        //     case "done": return access.value == AccessStateEnum.OPENED;
        //     case "!done": return access.value != AccessStateEnum.OPENED;
        // }
    }

    get filter() {
        return mapToObj(this.#values);
    }

    get value() {
        const activeFilter = FilterStorage.getAll();
        for (const filter in activeFilter) {
            if (this.#values.has(filter) && !this.#values.get(filter)) {
                return true;
            }
        }
        return false;
    }

}
