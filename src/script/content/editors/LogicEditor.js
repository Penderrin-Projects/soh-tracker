// frameworks
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import FileSystem from "/emcJS/util/file/FileSystem.js";
import "/JSEditors/modules/logic/Editor.js";

import LogicResource from "/script/resource/LogicResource.js";
import LogicListsCreator from "../logic/LogicListsCreator.js";
import "../logic/LiteralCustom.js";
import "../logic/LiteralMixin.js";
import "../logic/LiteralFunction.js";
import LogicStorage from "../logic/storages/LogicStorage.js";

function getLogicData() {
    return LogicResource.get() ?? {edges:{}, logic:{}};
}

export default async function() {
    const logicEditor = document.createElement("jse-logic-editor");

    // refresh
    async function refreshLogicEditor() {
        const lists = await LogicListsCreator.createLists(false);
        logicEditor.loadOperators(lists.operators);
        logicEditor.loadList(lists.logics);
        const logic = getLogicData();
        const intLogic = {};
        for (const i in logic.edges) {
            for (const j in logic.edges[i]) {
                intLogic[`${i} -> ${j}`] = logic.edges[i][j];
            }
        }
        for (const i in logic.logic) {
            intLogic[i] = logic.logic[i];
        }
        logicEditor.setLogic(intLogic);
        const patch = LogicStorage.getAll();
        logicEditor.setPatch(patch);
    }

    // events
    logicEditor.addEventListener("save", async (event) => {
        LogicStorage.set(event.key, event.logic);
    });
    logicEditor.addEventListener("clear", async (event) => {
        LogicStorage.delete(event.key);
    });
    // navigation
    const NAV = [{
        "content": "FILE",
        "submenu": [{
            "content": "SAVE LOGIC",
            "handler": async () => {
                const logic = getLogicData();
                const patch = LogicStorage.getAll();
                for (const i in patch) {
                    if (i.indexOf(" -> ") >= 0) {
                        const [key, target] = i.split(" -> ");
                        logic.edges[key] = logic.edges[key] ?? {};
                        logic.edges[key][target] = patch[i];
                    } else {
                        logic.logic[i] = patch[i];
                    }
                }
                FileSystem.save(JSON.stringify(logic, " ", 4), "logic.json");
            }
        }, {
            "content": "LOAD PATCH",
            "handler": async () => {
                const res = await FileSystem.load(".json");
                if (!!res && !!res.data) {
                    const logic = res.data;
                    const intLogic = {};
                    for (const i in logic.edges) {
                        for (const j in logic.edges[i]) {
                            intLogic[`${i} -> ${j}`] = logic.edges[i][j];
                        }
                    }
                    for (const i in logic.logic) {
                        intLogic[i] = logic.logic[i];
                    }
                    // load logic
                    LogicStorage.setAll(intLogic);
                    // refresh
                    await refreshLogicEditor();
                    //logicEditor.reset();
                }
            }
        }, {
            "content": "SAVE PATCH",
            "handler": async () => {
                const logic = {edges:{}, logic:{}};
                const patch = LogicStorage.getAll();
                for (const i in patch) {
                    if (i.indexOf(" -> ") >= 0) {
                        const [key, target] = i.split(" -> ");
                        logic.edges[key] = logic.edges[key] ?? {};
                        logic.edges[key][target] = patch[i];
                    } else {
                        logic.logic[i] = patch[i];
                    }
                }
                FileSystem.save(JSON.stringify(logic, " ", 4), `logic.${(new Date).valueOf()}.json`);
            }
        }, {
            "content": "REMOVE PATCH",
            "handler": async () => {
                LogicStorage.clear();
                await refreshLogicEditor();
                //logicEditor.reset();
            }
        }, {
            "content": "EXIT EDITOR",
            "handler": () => {
                logicEditor.reset();
                const event = new Event("close");
                logicEditor.dispatchEvent(event);
            }
        }]
    }, {
        "content": "CREATE MIXIN",
        "handler": async () => {
            const name = await Dialog.prompt("Create Mixin", "please enter a name");
            if (typeof name == "string") {
                const logic = LogicStorage.getAll();
                logic.logic[name] = {};
                LogicStorage.setAll(logic);
                await refreshLogicEditor();
                //logicEditor.reset();
            }
        }
    }];

    return {
        name: "Logic",
        panelEl: logicEditor,
        navConfig: NAV,
        refreshFn: refreshLogicEditor
    };
}
