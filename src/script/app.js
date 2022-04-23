/**
 * Starting point for Track-OOT
 */

// frameworks
import Logger from "/emcJS/util/Logger.js";
import HotkeyHandler from "/emcJS/util/HotkeyHandler.js";
import BusyIndicator from "/emcJS/ui/BusyIndicator.js";
import "/emcJS/ui/Page.js";
import "/emcJS/ui/Paging.js";
import "/emcJS/ui/LogScreen.js";
import "/emcJS/ui/Icon.js";
import "/emcJS/ui/layout/Layout.js";

// GameTrackerJS
import VersionData from "/GameTrackerJS/data/VersionData.js";
import GlobalContext from "/GameTrackerJS/data/GlobalContext.js";
import LoadingMessageHandler from "/GameTrackerJS/util/LoadingMessageHandler.js";
import Language from "/GameTrackerJS/util/Language.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import "/GameTrackerJS/savestate/AutosaveHandler.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import "/GameTrackerJS/util/handler/ExitBindingHandler.js";
import "/GameTrackerJS/util/logic/LogicCaller.js";
import "/GameTrackerJS/ui/TextEditor.js";
import "/GameTrackerJS/ui/ViewChoice.js";
// Track-OOT
import "/script/content/index.js";
import "/script/content/Tracker.js";
import "/script/content/EditorChoice.js";
import "/script/savestateConverter/StateConverter.js";
import "/script/util/logic/AugmentCustomLogic.js";
import "/script/util/logic/augment/AugmentDungeons.js";
import "/script/util/logic/augment/AugmentZoraLetter.js";
import "/script/util/logic/augment/ReachEpona.js";
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
    updateLoadingMessage("apply logger...");
    // add default log output
    Logger.addOutput(console);
    // add log panel
    if (VersionData.isDev) {
        const logPanel = document.createElement("div");
        logPanel.setAttribute("slot", "log");
        logPanel.dataset.title = "Logger";
        logPanel.dataset.icon = "images/icons/log.svg";
        logPanel.style.overflow = "hidden";
        const logScreen = document.createElement("emc-logscreen");
        logScreen.title = "Logger";
        logPanel.append(logScreen);
        document.getElementById("main-content").append(logPanel);
        Logger.addOutput(logScreen);
    }

    updateLoadingMessage("learn languages...");
    // load current language
    await Language.load(SettingsStorage.get("language"));

    updateLoadingMessage("initialize components...");
    // busy indicator
    BusyIndicator.setIndicator(document.getElementById("busy-animation"));
    // notepad
    const notePad = document.getElementById("notes-editor");
    notePad.value = Savestate.notes;
    Savestate.addEventListener("notes", function(event) {
        notePad.value = event.data;
    });
    notePad.addEventListener("change", function() {
        Savestate.notes = notePad.value;
    });
    // register hotkey - detached window
    HotkeyHandler.setAction("detached_window", () => {
        window.open("/detached/#items", "TrackOOT", "toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,titlebar=0", false);
    }, {
        ctrlKey: true,
        altKey: true,
        key: "i"
    });
    // register hotkey handler
    window.addEventListener("keydown", function(event) {
        if (HotkeyHandler.callHotkey(event.key, event.ctrlKey, event.altKey, event.shiftKey)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    });

    updateLoadingMessage("initialize settings...");
    // windows
    {
        GlobalContext.set("TrackerSettingsWindow", new TrackerSettingsWindow());
        GlobalContext.set("RomOptionsWindow", new RomOptionsWindow());
        GlobalContext.set("SpoilerLogWindow", new SpoilerLogWindow());
        GlobalContext.set("ClearDataWindow", new ClearDataWindow());
        const newGameWindow = new NewGameWindow();
        newGameWindow.addEventListener("close", event => {
            Savestate.setMeta("init_window_shown", true);
        });
        GlobalContext.set("NewGameWindow", newGameWindow);
    }

    updateLoadingMessage("wake up...");
    // remove splashscreen
    const spl = document.getElementById("splash");
    if (spl) {
        spl.className = "inactive";
    }

    Savestate.addEventListener("load", () => {
        if (!Savestate.getMeta("init_window_shown", false)) {
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
