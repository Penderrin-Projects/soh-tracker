/*
    starting point for application
*/

import AsyM from "/emcJS/util/import/AsyM.js";
import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import FileLoader from "/emcJS/util/FileLoader.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import HotkeyHandler from "/emcJS/util/HotkeyHandler.js";
import LoadingMessageHandler from "/GameTrackerJS/util/LoadingMessageHandler.js";

import {loadResources, registerWorker} from "/script/boot.js";

import "/script/storage/converter/StateConverter.js";

import "/emcJS/ui/Paging.js";

function setVersion(data) {
    MemoryStorage.set("version-dev", data.dev);
    if (data.dev) {
        MemoryStorage.set("version-string", `DEV [${data.commit.slice(0, 7)}]`);
    } else {
        MemoryStorage.set("version-string", data.version);
    }
    MemoryStorage.set("version-date", DateUtil.convert(new Date(data.date), "D.M.Y h:m:s"));
}

function setDevs(data) {
    MemoryStorage.set("devs-owner", data.owner);
    MemoryStorage.set("devs-team", data.team);
    MemoryStorage.set("devs-contributors", data.contributors);
}

const spl = document.getElementById("splash").querySelector(".loading");
function updateLoadingMessage(msg = "loading...") {
    spl.innerHTML = msg;
}
LoadingMessageHandler.registerCallback(updateLoadingMessage);

(async function main() {
    try {
        setVersion(await FileLoader.json("version.json"));
        setDevs(await FileLoader.json("devs.json"));
        // ---
        await loadResources(updateLoadingMessage);
        // ---
        updateLoadingMessage("poke application...");
        await init();
    } catch(err) {
        console.error(err);
        updateLoadingMessage(err.message.replace(/\n/g, "<br>"));
    }
}());

window.onbeforeunload = function() {
    return "Are you sure you want to close the tracker?\nUnsafed progress will be lost.";
}

async function init() {
    updateLoadingMessage("extract recent savestate...");
    const [SavestateHandler] = await AsyM.import("/GameTrackerJS/savestate/SavestateHandler.js");

    const [
        [AugmentExits],
        [AugmentCustomLogic]
    ] = await AsyM.import([
        "/script/util/logic/AugmentExits.js",
        "/script/util/logic/AugmentCustomLogic.js",
        "/script/util/logic/LogicCaller.js"
    ]);

    updateLoadingMessage("build logic data...");
    await AugmentExits.init();
    await AugmentCustomLogic.init();

    updateLoadingMessage("load visuals...");
    const [
        [EventBus],
        [Logger],
        [SavestateOptionsWindow],
        [TrackerSettingsWindow],
        [SpoilerLogWindow]
    ] = await AsyM.import([
        // consts
        "/emcJS/event/EventBus.js",
        "/emcJS/util/Logger.js",
        "/GameTrackerJS/ui/window/SavestateOptionsWindow.js",
        "/script/ui/window/TrackerSettingsWindow.js",
        "/script/ui/SpoilerLogWindow.js",
        // untracked
        "/emcJS/ui/input/TextEditor.js",
        "/emcJS/ui/LogScreen.js",
        "/emcJS/ui/Icon.js",
        "/emcJS/ui/layout/Layout.js",
        "/script/ui/ViewChoice.js",
        "/script/ui/items/ItemGrid.js",
        "/script/ui/dungeonstate/DungeonState.js",
        "/script/ui/world/LocationList.js",
        "/script/ui/world/Map.js",
        "/script/ui/LocationStatus.js",
        "/script/content/Tracker.js",
        "/script/content/EditorChoice.js"
    ]);
    
    await registerWorker();

    updateLoadingMessage("apply logger...");
    if (MemoryStorage.get("version-dev")) {
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
        //Logger.addOutput(console);
        EventBus.register(function(event) {
            Logger.info(JSON.stringify(event), "Event");
        });
    } else {
        // not in dev version
    }

    updateLoadingMessage("initialize components...");
    const notePad = document.getElementById("notes-editor");
    notePad.value = SavestateHandler.getNotes();
    SavestateHandler.addEventListener("notes", function(event) {
        notePad.value = event.data;
    });
    notePad.addEventListener("change", function() {
        SavestateHandler.setNotes(notePad.value);
    });

    updateLoadingMessage("initialize settings...");
    window.TrackerSettingsWindow = new TrackerSettingsWindow();
    window.SavestateOptionsWindow = new SavestateOptionsWindow();
    window.SpoilerLogWindow = new SpoilerLogWindow();

    updateLoadingMessage("add modules...");
    await AsyM.import([
        "/script/ui/shops/ShopList.js",
        "/script/ui/songs/SongList.js",
        "/script/ui/exits/ExitList.js",
        "/script/ui/multiplayer/Multiplayer.js",
        "/script/ui/LayoutContainer.js"
    ]);

    updateLoadingMessage("wake up...");
    const spl = document.getElementById("splash");
    if (spl) {
        spl.className = "inactive";
    }
    
    // hotkeys
    function openDetached() {
        window.open("/detached/#items", "TrackOOT", "toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,titlebar=0", false);
    }
    HotkeyHandler.setAction("detached_window", openDetached, {
        ctrlKey: true,
        altKey: true,
        key: "i"
    });
    window.addEventListener("keydown", function(event) {
        if (HotkeyHandler.callHotkey(event.key, event.ctrlKey, event.altKey, event.shiftKey)) {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }
    });
}
