import Logger from "/emcJS/util/Logger.js";
import SavestateHandler from "../../storage/SavestateHandler.js";
import AccessStateEnum from "../../enum/AccessStateEnum.js";
import WorldRegistry from "../../registry/WorldRegistry.js";

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
                const ref = `${category}/${id}`;
                const worldElementState = WorldRegistry.get(ref);
                if (worldElementState != null && worldElementState.visible) {
                    if (category == "location") {
                        if (!SavestateHandler.get("", `${category}/${id}`, 0)) {
                            res.unopened++;
                            if (worldElementState.access) {
                                res.reachable++;
                            }
                        } else {
                            res.done++;
                        }
                    } else if (category == "subarea") {
                        const subareaList = worldElementState.getFilteredList();
                        if (subareaList != null) {
                            const {done, unopened, reachable} = this.check(subareaList);
                            res.done += done;
                            res.unopened += unopened;
                            res.reachable += reachable;
                        }
                    } else if (category == "subexit") {
                        if (worldElementState.area) {
                            const subareaState = WorldRegistry.get(worldElementState.area);
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
                            if (worldElementState.access) {
                                res.entrances = true;
                            }
                        }
                    } else {
                        Logger.error((new Error(`unknown category "${category}" for entry "${id}"`)), "ListLogic");
                    }
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
