/**
 * Starting point for Track-OOT
 */

// frameworks
import GlobalContext from "/emcJS/data/storage/global/GlobalContext.js";
import Logger from "/emcJS/util/log/Logger.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import "/emcJS/ui/Page.js";
import "/emcJS/ui/Paging.js";
import "/emcJS/ui/LogScreen.js";
import "/emcJS/ui/icon/Icon.js";
import "/emcJS/ui/layout/Layout.js";

// GameTrackerJS
import VersionData from "/GameTrackerJS/data/VersionData.js";
import LoadingMessageHandler from "/GameTrackerJS/util/LoadingMessageHandler.js";
import Language from "/GameTrackerJS/util/Language.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import EntranceBindingHandler from "/GameTrackerJS/util/handler/EntranceBindingHandler.js";
import MetaObserver from "/GameTrackerJS/util/observer/MetaObserver.js";
import "/GameTrackerJS/savestate/AutosaveHandler.js";
import "/GameTrackerJS/util/sync/StorageSyncMaster.js";
import "/GameTrackerJS/util/handler/ExitBindingHandler.js";
import "/GameTrackerJS/util/logic/LogicCaller.js";
import "/GameTrackerJS/ui/TextEditor.js";
import "/GameTrackerJS/ui/layout/ViewChoice.js";
import "/GameTrackerJS/ui/LocationState.js";
// Track-OOT
import "/script/content/index.js";
import "/script/content/Tracker.js";
import "/script/content/EditorContainer.js";
import "/script/savestateConverter/StateConverter.js";
import ArchipelagoController from "/script/util/archipelago/ArchipelagoController.js";
import CustomLogicUpdater from "./util/logic/CustomLogicUpdater.js";
import "/script/util/logic/AugmentationLoader.js";
import "/script/util/A11y.js";
import TrackerSettingsWindow from "/script/ui/window/TrackerSettingsWindow.js";
import RomOptionsWindow from "/script/ui/window/RomOptionsWindow.js";
import NewGameWindow from "/script/ui/window/NewGameWindow.js";
import SpoilerLogWindow from "/script/ui/window/SpoilerLogWindow.js";
import ClearDataWindow from "/script/ui/window/ClearDataWindow.js";
import "/script/ui/LayoutContainer.js";
import "/script/ui/multiplayer/Multiplayer.js";
import APWindow from "./ui/window/APWindow.js";
import Logic from "/GameTrackerJS/util/logic/Logic.js";
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
// SoH integration - auto-tracks from Ship of Harkinian save file
import SohBridge from "/script/soh-bridge/SohBridge.js";
import SpoilerLookupWindow from "/script/soh-bridge/SpoilerLookupWindow.js";
import CustomColorWindow from "/script/soh-bridge/CustomColorWindow.js";

Logic.suspended = true;

const spl = document.getElementById("loading-info");

function updateLoadingMessage(msg = "loading...") {
    spl.innerHTML = msg;
}

LoadingMessageHandler.registerCallback(updateLoadingMessage);

// NOTE: Track-OOT originally had a window.onbeforeunload handler here that
// prompted "Are you sure you want to close the tracker?". In Electron this
// silently vetos close attempts, making the X button appear broken.
// Removed because save state is managed by SoH (not Track-OOT) in this fork.

// mixed entrances
{
    const detachedEntrancesObserver = new OptionsObserver("detached_entrances");

    const INNER_GATEWAYS = ["boss_inner", "dungeon_inner", "interior_inner", "grotto_inner"];
    const OUTER_GATEWAYS = ["boss_outer", "dungeon_outer", "interior_outer", "grotto_outer"];
    EntranceBindingHandler.setMixedEntranceRule((exit, entrance) => {
        if (!detachedEntrancesObserver.value) {
            if (INNER_GATEWAYS.includes(exit.props.type)) {
                return !INNER_GATEWAYS.includes(entrance.props.type);
            }
            if (OUTER_GATEWAYS.includes(exit.props.type)) {
                return !OUTER_GATEWAYS.includes(entrance.props.type);
            }
        }
        return true;
    });
}

try {
    window.onerror = null;
    updateLoadingMessage("apply logger...");
    // add log panel
    if (VersionData.isDev || location.hostname === "localhost") {
        const logPanel = document.createElement("gt-viewchoice-panel");
        logPanel.slot = "log";
        logPanel.label = "Logger";
        logPanel.icon = "/images/icons/log.svg";
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
    BusyIndicatorManager.setIndicator(document.getElementById("busy-animation"));
    // notepad
    const notePad = document.getElementById("notes-editor");
    notePad.value = Savestate.notes;
    Savestate.addEventListener("notes", function(event) {
        notePad.value = event.value;
    });
    notePad.addEventListener("change", function() {
        Savestate.notes = notePad.value;
    });
    // main-content viewchoice
    const viewchoiceEl = document.getElementById("main-content");
    viewchoiceEl.setTab("tracker", "Item & Map Tracker", "/images/icons/tracker.svg");
    viewchoiceEl.setTab("locationlist", "Locationlist", "/images/icons/locationlist.svg");
    viewchoiceEl.setTab("maps", "Maps", "/images/icons/area.svg");
    viewchoiceEl.setTab("shops", "Shops", "/images/icons/shops.svg");
    viewchoiceEl.setTab("dungeonstate", "Dungeonstate", "/images/icons/dungeonstate.svg");
    viewchoiceEl.setTab("exits", "Exits", "/images/icons/entrance.svg");
    viewchoiceEl.setTab("songs", "Songs", "/images/icons/songs.svg");
    viewchoiceEl.setTab("multi", "Multiplayer", "/images/icons/multi.svg");
    viewchoiceEl.setTab("notes", "Notes", "/images/icons/notes.svg");
    viewchoiceEl.setTab("ap", "Archipelago", "/images/icons/ap.svg");

    // AP state tab handling
    const archipelagoActiveObserver = new MetaObserver("archipelago");

    if (!archipelagoActiveObserver.value) {
        viewchoiceEl.setTabButtonVisibility("ap", false);
    }
    archipelagoActiveObserver.onChange((event) => {
        const {value} = event;
        viewchoiceEl.setTabButtonVisibility("ap", !!value);
    });

    // XXX
    window.ArchipelagoController = ArchipelagoController;

    updateLoadingMessage("initialize settings...");
    // windows
    {
        GlobalContext.set("TrackerSettingsWindow", new TrackerSettingsWindow());
        GlobalContext.set("RomOptionsWindow", new RomOptionsWindow());
        GlobalContext.set("SpoilerLogWindow", new SpoilerLogWindow());
        GlobalContext.set("ArchipelagoWindow", new APWindow());
        GlobalContext.set("ClearDataWindow", new ClearDataWindow());
        GlobalContext.set("SpoilerLookupWindow", new SpoilerLookupWindow());
        GlobalContext.set("CustomColorWindow", new CustomColorWindow());
        const newGameWindow = new NewGameWindow();
        GlobalContext.set("NewGameWindow", newGameWindow);
    }

    updateLoadingMessage("update logic...");
    new CustomLogicUpdater();
    Logic.suspended = false;

    updateLoadingMessage("wake up...");
    // remove splashscreen
    const spl = document.getElementById("splash");
    if (spl) {
        spl.className = "inactive";
    }

    // SoH integration: start watching save file for auto-tracking.
    // Failures here are non-fatal - manual tracking still works.
    try {
        await SohBridge.init();
    } catch (e) {
        console.error("SohBridge failed to initialize:", e);
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
