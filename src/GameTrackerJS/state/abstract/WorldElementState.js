import WorldRegistry from "../../registry/WorldRegistry.js";
import FilteredState from "./FilteredState.js";

export default class WorldElementState extends FilteredState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        WorldRegistry.set(ref, this);
    }

}
