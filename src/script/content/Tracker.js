// frameworks
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";

// GameTrackerJS
import GlobalContext from "/GameTrackerJS/data/GlobalContext.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import LoadWindow from "/GameTrackerJS/ui/window/savestate/LoadWindow.js";
import ManageWindow from "/GameTrackerJS/ui/window/savestate/ManageWindow.js";
import SaveWindow from "/GameTrackerJS/ui/window/savestate/SaveWindow.js";
// Track-OOT
import PageSwitcher from "/script/util/PageSwitcher.js";

PageSwitcher.register("main", [{
    "content": "FILE",
    "submenu": [{
        "content": "NEW",
        "handler": state_New
    }, {
        "content": "LOAD",
        "handler": state_Load
    }, {
        "content": "SAVE",
        "handler": state_Save
    }, {
        "content": "SAVE AS",
        "handler": state_SaveAs
    }, {
        "content": "MANAGE",
        "handler": states_Manage
    }]
}, {
    "content": "DISCORD",
    "handler": openDiscortJoin
}, {
    "content": "PATREON",
    "handler": openPatreon
}, {
    "content": "EXTRAS",
    "submenu": [{"mixin": "fullscreen"}, {
        "content": "UPLOAD SPOILER",
        "handler": openSpoilerSettingsWindow
    }, {
        "content": "CLEAR SPECIFIC DATA",
        "handler": openClearDataWindow
    }, {
        "content": "DETACHED ITEM WINDOW",
        "handler": openDetachedItems
    }, {
        "content": "EDITORS",
        "handler": showEditors
    }]
}, {
    "content": "RANDOMIZER OPTIONS",
    "handler": openRomSettingsWindow
}, {
    "content": "TRACKER SETTINGS",
    "handler": openSettingsWindow
}]);
PageSwitcher.switch("main");

async function state_Save() {
    const activestate = await SavestateHandler.getName();
    if (activestate) {
        await SavestateHandler.save();
        Toast.success(`Saved "${activestate}" successfully.`);
    } else {
        state_SaveAs();
    }
}

async function state_SaveAs() {
    const activestate = await SavestateHandler.getName();
    const w = new SaveWindow();
    if (activestate) {
        w.show(activestate);
    } else {
        w.show();
    }
}

async function state_Load() {
    const activestate = await SavestateHandler.getName()
    const w = new LoadWindow();
    if (activestate) {
        w.show(activestate);
    } else {
        w.show();
    }
}

async function state_New() {
    if (await SavestateHandler.isDirty()) {
        if (!await Dialog.confirm("Warning, you have unsaved changes.", "Do you want to discard your changes and create a new state?")) {
            return;
        }
    }
    SavestateHandler.reset();
}

async function states_Manage() {
    const activestate = await SavestateHandler.getName()
    const w = new ManageWindow();
    if (activestate) {
        w.show(activestate);
    } else {
        w.show();
    }
}

function openDetachedItems() {
    window.open("/detached/#items", "TrackOOT", "toolbar=0,location=0,directories=0,status=0,menubar=0,scrollbars=1,resizable=0,titlebar=0");
}

function openDiscortJoin() {
    window.open("https://discord.gg/wgFVtuv", "_blank");
}

function openPatreon() {
    window.open("https://www.patreon.com/zidargs", "_blank");
}

function openSettingsWindow() {
    const trackerSettingsWindow = GlobalContext.get("TrackerSettingsWindow");
    if (trackerSettingsWindow) {
        trackerSettingsWindow.show();
    }
}

function openRomSettingsWindow() {
    const romOptionsWindow = GlobalContext.get("RomOptionsWindow");
    if (romOptionsWindow) {
        romOptionsWindow.show();
    }
}

function openSpoilerSettingsWindow() {
    const spoilerLogWindow = GlobalContext.get("SpoilerLogWindow");
    if (spoilerLogWindow) {
        spoilerLogWindow.show();
    }
}

function openClearDataWindow() {
    const clearDataWindow = GlobalContext.get("ClearDataWindow");
    if (clearDataWindow) {
        clearDataWindow.show();
    }
}

function showEditors() {
    PageSwitcher.switch("editor_choice");
}
