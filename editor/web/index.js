import $__Path__$ from "/asym/Path.js";
import $__AsyM__$ from "/asym/AsyM.js";
import "/editors/EditorWindow.js";

import createLogicEditor from "/script/content/editors/LogicEditor.js";
import createWorldEditor from "/script/content/editors/WorldEditor.js";
const path = new $__Path__$(import.meta.url);
export default new $__AsyM__$([
	"/script/content/editors/LogicEditor.js",
	"/script/content/editors/WorldEditor.js",
	"/editors/EditorWindow.js"
], async ([
	[createLogicEditor],
	[createWorldEditor]
]) => {
    const $__exports__$ = {};
    {
/* ASYM: START SCRIPT ---------------------------------------------------- */
let windowElement = document.getElementById("window");
function registerWindow({name, panel, navigation, refreshFn}) {
    windowElement.register(name, panel, navigation, refreshFn);
}
// add editors
registerWindow(await createLogicEditor(false));
registerWindow(await createLogicEditor(true));
registerWindow(await createWorldEditor());
/* ASYM: END SCRIPT ------------------------------------------------------ */
    }
    return $__exports__$;
});

