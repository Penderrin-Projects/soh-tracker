/* asym-import: off */
import Logger from "/emcJS/util/Logger.js";
/* asym-import: on */
import SavestateHandler from "../../savestate/SavestateHandler.js";
import WorldStateManager from "../../state/world/WorldStateManager.js";
import "../../state/world/area/StateManager.js";
import "../../state/world/exit/StateManager.js";
import "../../state/world/location/StateManager.js";
import "../../state/world/subarea/StateManager.js";
import "../../state/world/subexit/StateManager.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";

class ListLogic {

    get DEFAULT() {
        return {
            done: 0,
            unopened: 0,
            reachable: 0,
            entrances: false,
            value: AccessStateEnum.UNAVAILABLE
        };
    }
    
    check(list) {
        const res = {
            done: 0,
            unopened: 0,
            reachable: 0,
            entrances: false,
            value: AccessStateEnum.OPENED
        };
        if (!!list && Array.isArray(list)) {
            for (const entry of list) {
                const category = entry.category;
                const id = entry.id;
                if (category == "location") {
                    const state = WorldStateManager.get("location", id);
                    if (state != null && state.visible) {
                        const ref = `${category}/${id}`;
                        if (!SavestateHandler.get("", ref, 0)) {
                            res.unopened++;
                            if (state.access) {
                                res.reachable++;
                            }
                        } else {
                            res.done++;
                        }
                    }
                } else if (category == "subarea") {
                    const state = WorldStateManager.get("subarea", id);
                    if (state != null && state.visible) {
                        const subareaList = state.getFilteredList();
                        if (subareaList != null) {
                            const {done, unopened, reachable} = this.check(subareaList);
                            res.done += done;
                            res.unopened += unopened;
                            res.reachable += reachable;
                        }
                    }
                } else if (category == "subexit") {
                    const state = WorldStateManager.get("subexit", id);
                    if (state != null && state.visible) {
                        if (state.area) {
                            const subareaState = WorldStateManager.getByRef(state.area.ref);
                            if (subareaState != null) {
                                const subareaList = subareaState.getFilteredList();
                                if (subareaList != null) {
                                    const {done, unopened, reachable} = this.check(subareaList);
                                    res.done += done;
                                    res.unopened += unopened;
                                    res.reachable += reachable;
                                }
                            }
                        } else {
                            if (state.access) {
                                res.entrances = true;
                            }
                        }
                    }
                } else if (category == "area") {
                    // ignore
                } else if (category == "exit") {
                    // ignore
                } else {
                    Logger.error((new Error(`unknown category "${category}" for entry "${id}"`)), "ListLogic");
                }
            }
        }
        if (res.unopened > 0) {
            if (res.reachable > 0) {
                if (res.unopened == res.reachable) {
                    res.value = AccessStateEnum.AVAILABLE;
                } else {
                    res.value = AccessStateEnum.POSSIBLE;
                }
            } else {
                res.value = AccessStateEnum.UNAVAILABLE;
            }
        }
        return res;
    }

}

export default new ListLogic();
