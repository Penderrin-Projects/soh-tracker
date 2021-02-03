/**
 * Starting point for Track-OOT
 */

/* asym-import: off */
import Import from "/emcJS/util/import/Import.js";
import Logger from "/emcJS/util/Logger.js";
import HotkeyHandler from "/emcJS/util/HotkeyHandler.js";
import EventBus from "/emcJS/event/EventBus.js";
import "/emcJS/ui/Paging.js";
import "/emcJS/ui/input/TextEditor.js";
import "/emcJS/ui/LogScreen.js";
import "/emcJS/ui/Icon.js";
import "/emcJS/ui/layout/Layout.js";
/* asym-import: on */

// GameTrackerJS
import LoadingMessageHandler from "/GameTrackerJS/util/LoadingMessageHandler.js";
import Language from "/GameTrackerJS/util/Language.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import BusyIndicator from "/GameTrackerJS/ui/BusyIndicator.js";
// Track-OOT
import VersionData from "/script/data/VersionData.js";
import "/script/storage/converter/StateConverter.js";
import "/script/util/logic/AugmentExits.js";
import "/script/util/logic/AugmentCustomLogic.js";
import "/script/util/logic/LogicCaller.js";
import "/script/content/Tracker.js";
import "/script/content/EditorChoice.js"
import TrackerSettingsWindow from "/script/ui/window/TrackerSettingsWindow.js";
import RomOptionsWindow from "/script/ui/window/RomOptionsWindow.js";
import SpoilerLogWindow from "/script/ui/SpoilerLogWindow.js";
import "/script/ui/ViewChoice.js";
import "/script/ui/items/ItemGrid.js";
import "/script/ui/dungeonstate/DungeonState.js";
import "/script/ui/world/LocationList.js";
import "/script/ui/world/Map.js";
import "/script/ui/LocationStatus.js";
import "/script/ui/shops/ShopList.js";
import "/script/ui/songs/SongList.js";
import "/script/ui/exits/ExitList.js";
import "/script/ui/multiplayer/Multiplayer.js";
import "/script/ui/LayoutContainer.js";

const spl = document.getElementById("splash").querySelector(".loading");
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
        EventBus.register(function(event) {
            Logger.info(JSON.stringify(event), "Event");
        });
    }

    updateLoadingMessage("learn languages...");
    // load current language
    await Language.load(SettingsStorage.get("language"));

    updateLoadingMessage("initialize components...");
    // busy indicator
    BusyIndicator.setIndicator(document.getElementById("busy-animation"));
    // notepad
    const notePad = document.getElementById("notes-editor");
    notePad.value = SavestateHandler.getNotes();
    SavestateHandler.addEventListener("notes", function(event) {
        notePad.value = event.data;
    });
    notePad.addEventListener("change", function() {
        SavestateHandler.setNotes(notePad.value);
    });
    // shared worker
    if ("SharedWorker" in window) {
        const [EventBusModuleShare] = await Import.module("/emcJS/event/module/EventBusModuleShare.js");
        EventBus.addModule(EventBusModuleShare, {blacklist:["logic"]});
    }
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
    window.TrackerSettingsWindow = new TrackerSettingsWindow();
    window.RomOptionsWindow = new RomOptionsWindow();
    window.SpoilerLogWindow = new SpoilerLogWindow();

    updateLoadingMessage("wake up...");
    // remove splashscreen
    const spl = document.getElementById("splash");
    if (spl) {
        spl.className = "inactive";
    }
} catch(err) {
    console.error(err);
    updateLoadingMessage(err.message.replace(/\n/g, "<br>"));
}
