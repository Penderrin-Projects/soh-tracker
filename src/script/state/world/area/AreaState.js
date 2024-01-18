import AreaStateManager from "/GameTrackerJS/statemanager/world/area/AreaStateManager.js";
import DefaultAreaState from "/GameTrackerJS/state/world/area/DefaultAreaState.js";
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";

const mixedEntrancePoolObserver = new OptionsObserver("mixed_entrance_pool");

export default class AreaState extends DefaultAreaState {

    constructor(ref, props) {
        super(ref, props);
        mixedEntrancePoolObserver.addEventListener("change", () => {
            this.onListEntriesChange();
        });
    }

    get listContents() {
        return !mixedEntrancePoolObserver.value && super.listContents;
    }

}

AreaStateManager.setDefaultState(AreaState);
