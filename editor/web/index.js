import createLogicEditor from "/script/content/editors/LogicEditor.js";
import createWorldEditor from "/script/content/editors/WorldEditor.js";
import "/editors/EditorWindow.js";

const windowElement = document.getElementById("window");

function registerWindow({name, panel, navigation, refreshFn}) {
    windowElement.register(name, panel, navigation, refreshFn);
}

// add editors
registerWindow(await createLogicEditor(false));
registerWindow(await createLogicEditor(true));
registerWindow(await createWorldEditor());

