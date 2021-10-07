// frameworks
import "/editors/EditorChoice.js";

// Track-OOT
import PageSwitcher from "/script/util/PageSwitcher.js";
import createLogicEditor from "./editors/LogicEditor.js";
//import createWorldEditor from "./editors/WorldEditor.js";

const editorChoice = document.getElementById("editor-choice");
const nav = document.getElementById("navbar");

const MAIN_NAV = [{
    "content": "EXIT",
    "handler": () => {
        PageSwitcher.switch("main");
    }
}, {
    "mixin": "fullscreen"
}];

const DEFAULT_NAV = [{
    "content": "EXIT",
    "handler": () => {
        editorChoice.closeCurrent();
    }
}, {
    "mixin": "fullscreen"
}];

PageSwitcher.register("editor_choice", MAIN_NAV);

const PANELS = new Map();

editorChoice.addEventListener("choice", function(event) {
    if (event.app == "") {
        nav.loadNavigation(MAIN_NAV);
    } else {
        const data = PANELS.get(event.app);
        if (typeof data.refreshFn == "function") {
            data.refreshFn();
        }
        if (data.navigation != null) {
            nav.loadNavigation(data.navigation.concat({
                "mixin": "fullscreen"
            }));
        } else {
            nav.loadNavigation(DEFAULT_NAV);
        }
    }
});

function registerWindow({name, panel, navigation, refreshFn}) {
    if (PANELS.has(name)) {
        throw Error(`Panel with name "${name}" already registered`);
    }
    PANELS.set(name, {
        navigation: navigation,
        refreshFn: refreshFn
    });
    panel.addEventListener("close", () => editorChoice.closeCurrent());
    editorChoice.register(panel, name);
}

// add editors
!async function() {
    registerWindow(await createLogicEditor(false));
    registerWindow(await createLogicEditor(true));
    //registerWindow(await createWorldEditor());
}();
