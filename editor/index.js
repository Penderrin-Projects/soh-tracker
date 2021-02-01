
import "/editors/EditorWindow.js";

import createLogicEditor from "./content/editors/LogicEditor.js";
import createWorldEditor from "./content/editors/WorldEditor.js";

let windowElement = document.getElementById("window");

function registerWindow({name, panel, navigation, refreshFn}) {
    windowElement.register(name, panel, navigation, refreshFn);
}

// add editors
registerWindow(await createLogicEditor(false));
registerWindow(await createLogicEditor(true));
registerWindow(await createWorldEditor());