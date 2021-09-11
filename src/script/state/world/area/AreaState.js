// GameTrackerJS
import AreaStateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import DefaultAreaState from "/GameTrackerJS/state/world/area/DefaultState.js";


export default class AreaState extends DefaultAreaState {
    
    set type(value) {
        // ignore
    }

    get type() {
        return "v";
    }

}

AreaStateManager.register("*", AreaState);
