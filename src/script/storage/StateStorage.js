/**
 * @deprecated
 */

// frameworks
import EventBus from "/emcJS/event/EventBus.js";

// GameTrackerJS
import GlobalContext from "/GameTrackerJS/data/GlobalContext.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";

class StateStorage {

    constructor() {
        SavestateHandler.addEventListener("load", event => {
            const {data: {"": state = {}, ...extra}, options, notes} = event.state;
            for (const [key, value] of Object.entries(options)) {
                state[key] = value;
            }
            EventBus.trigger("state", {
                notes,
                state,
                extra
            });
            if (extra.meta == null || !extra.meta["init_window_shown"]) {
                const showInitWindow = SettingsStorage.get("show_state_init_window");
                if (showInitWindow) {
                    const newGameWindow = GlobalContext.get("NewGameWindow");
                    if (newGameWindow) {
                        newGameWindow.show();
                    }
                }
            }
        });
    }

}

export default new StateStorage();
