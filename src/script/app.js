/**
 * Starting point for Track-OOT
 */

// frameworks
import GlobalContext from "/emcJS/data/storage/global/GlobalContext.js";
import Logger from "/emcJS/util/log/Logger.js";
import BusyIndicator from "/emcJS/ui/BusyIndicator.js";
import "/emcJS/ui/Page.js";
import "/emcJS/ui/Paging.js";
import "/emcJS/ui/LogScreen.js";
import "/emcJS/ui/Icon.js";
import "/emcJS/ui/layout/Layout.js";

// GameTrackerJS
import VersionData from "/GameTrackerJS/data/VersionData.js";
import LoadingMessageHandler from "/GameTrackerJS/util/LoadingMessageHandler.js";
import Language from "/GameTrackerJS/util/Language.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import "/GameTrackerJS/savestate/AutosaveHandler.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import "/GameTrackerJS/util/sync/StorageSyncMaster.js";
import "/GameTrackerJS/util/handler/ExitBindingHandler.js";
import "/GameTrackerJS/util/logic/LogicCaller.js";
import "/GameTrackerJS/ui/TextEditor.js";
import "/GameTrackerJS/ui/layout/ViewChoice.js";
// Track-OOT
import "/script/content/index.js";
import "/script/content/Tracker.js";
import "/script/content/EditorChoice.js";
import "/script/savestateConverter/StateConverter.js";
import "/script/util/logic/AugmentCustomLogic.js";
import "/script/util/logic/augment/AugmentOptions.js";
import "/script/util/logic/augment/AugmentDungeons.js";
import "/script/util/logic/augment/AugmentZoraLetter.js";
import "/script/util/logic/augment/AugmentReachEpona.js";
import "/script/util/logic/augment/AugmentStartingHearts.js";
import "/script/util/A11y.js";
import TrackerSettingsWindow from "/script/ui/window/TrackerSettingsWindow.js";
import RomOptionsWindow from "/script/ui/window/RomOptionsWindow.js";
import NewGameWindow from "/script/ui/window/NewGameWindow.js";
import SpoilerLogWindow from "/script/ui/window/SpoilerLogWindow.js";
import ClearDataWindow from "/script/ui/window/ClearDataWindow.js";
import "/script/ui/LayoutContainer.js";
import "/script/ui/LocationStatus.js";

import "/script/ui/multiplayer/Multiplayer.js";

const spl = document.getElementById("loading-info");

function updateLoadingMessage(msg = "loading...") {
    spl.innerHTML = msg;
}

LoadingMessageHandler.registerCallback(updateLoadingMessage);

window.onbeforeunload = function() {
    return "Are you sure you want to close the tracker?\nUnsafed progress will be lost.";
}

try {
    window.onerror = null;
    updateLoadingMessage("apply logger...");
    // add log panel
    if (VersionData.isDev || location.hostname === "localhost") {
        const logPanel = document.createElement("gt-viewchoice-panel");
        logPanel.slot = "log";
        logPanel.label = "Logger";
        logPanel.icon = "images/icons/log.svg";
        logPanel.style.overflow = "hidden";
        const logScreen = document.createElement("emc-logscreen");
        logScreen.title = "Logger";
        logPanel.append(logScreen);
        document.getElementById("main-content").append(logPanel);
        Logger.addOutput(logScreen);
    }

    updateLoadingMessage("learn languages...");
    // load current language
    await Language.load(SettingsStorage.get("language"), "en_us");

    updateLoadingMessage("initialize components...");
    // busy indicator
    BusyIndicator.setIndicator(document.getElementById("busy-animation"));
    // notepad
    const notePad = document.getElementById("notes-editor");
    notePad.value = Savestate.notes;
    Savestate.addEventListener("notes", function(event) {
        notePad.value = event.value;
    });
    notePad.addEventListener("change", function() {
        Savestate.notes = notePad.value;
    });

    updateLoadingMessage("initialize settings...");
    // windows
    {
        GlobalContext.set("TrackerSettingsWindow", new TrackerSettingsWindow());
        GlobalContext.set("RomOptionsWindow", new RomOptionsWindow());
        GlobalContext.set("SpoilerLogWindow", new SpoilerLogWindow());
        GlobalContext.set("ClearDataWindow", new ClearDataWindow());
        const newGameWindow = new NewGameWindow();
        GlobalContext.set("NewGameWindow", newGameWindow);
    }

    updateLoadingMessage("wake up...");
    // remove splashscreen
    const spl = document.getElementById("splash");
    if (spl) {
        spl.className = "inactive";
    }

    SavestateHandler.addEventListener("load", () => {
        if (!Savestate.getMeta("init_window_shown", false)) {
            Savestate.setMeta("init_window_shown", true);
            const showInitWindow = SettingsStorage.get("show_state_init_window");
            if (showInitWindow) {
                const newGameWindow = GlobalContext.get("NewGameWindow");
                if (newGameWindow) {
                    newGameWindow.show();
                }
            }
        }
    });
} catch (err) {
    console.error(err);
    updateLoadingMessage(err.message.replace(/\n/g, "<br>"));
}
