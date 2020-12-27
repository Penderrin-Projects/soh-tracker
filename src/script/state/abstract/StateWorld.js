import WorldRegistry from "/script/registries/WorldRegistry.js";
import StateFilter from "/script/state/abstract/StateFilter.js";

export default class StateWorld extends StateFilter {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        WorldRegistry.set(ref, this);
    }

}
