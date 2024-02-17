// import createLogicEditor from "/script/content/editors/LogicEditor.js";
// import createLogicGlitchedEditor from "/script/content/editors/LogicGlitchedEditor.js";
import createWorldEditor from "/modules/world/WorldEditor.js";
import "/JSEditors/EditorWindow.js";

const windowElement = document.getElementById("window");

// add editors
// registerWindow(await createLogicEditor());
// registerWindow(await createLogicGlitchedEditor());
windowElement.register(await createWorldEditor());

