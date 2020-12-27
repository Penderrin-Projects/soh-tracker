import WorldRegistry from "../../registry/WorldRegistry.js";
import StateFilter from "./StateFilter.js";

export default class StateWorld extends StateFilter {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        WorldRegistry.set(ref, this);
    }

}
