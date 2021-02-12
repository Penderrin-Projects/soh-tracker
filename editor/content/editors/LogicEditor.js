/* asym-import: off */
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import FileSystem from "/emcJS/util/FileSystem.js";
import "/editors/modules/logic/Editor.js";
/* asym-import: on */

import LogicResource from "/script/resource/LogicResource.js";
import LogicGlitchedResource from "/script/resource/LogicGlitchedResource.js";
import LogicViewer from "../logic/LogicViewer.js";
import LogicListsCreator from "../logic/LogicListsCreator.js";
import "../logic/LiteralCustom.js";
import "../logic/LiteralMixin.js";
import "../logic/LiteralFunction.js";

function getLogicData(glitched = false) {
    if (glitched) {
        return LogicGlitchedResource.get() ?? {edges:{},logic:{}};
    } else {
        return LogicResource.get() ?? {edges:{},logic:{}};
    }
}

export default async function(glitched = false) {
    let postfix = "";
    if (!!glitched) {
        postfix = "_glitched";
    }
    const LogicsStorage = new IDBStorage(`logics${postfix}`);
    const logicEditor = document.createElement("jse-logic-editor");
    // refresh
    async function refreshLogicEditor() {
        LogicViewer.glitched = glitched;
        const lists = await LogicListsCreator.createLists(glitched);
        logicEditor.loadOperators(lists.operators);
        logicEditor.loadList(lists.logics);
        const logic = getLogicData(glitched);
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
        const patch = await LogicsStorage.getAll();
        logicEditor.setPatch(patch);
    }
    await refreshLogicEditor();
    // events
    logicEditor.addEventListener("save", async event => {
        await LogicsStorage.set(event.key, event.logic);
    });
    logicEditor.addEventListener("clear", async event => {
        await LogicsStorage.delete(event.key);
    });
    // navigation
    const NAV = [{
        "content": "FILE",
        "submenu": [{
            "content": "SAVE LOGIC",
            "handler": async () => {
                const logic = getLogicData(glitched);
                const patch = await LogicsStorage.getAll();
                for (const i in patch) {
                    if (i.indexOf(" -> ") >= 0) {
                        const [key, target] = i.split(" -> ");
                        if (logic.edges[key] == null) {
                            logic.edges[key] = {};
                        }
                        logic.edges[key][target] = patch[i];
                    } else {
                        logic.logic[i] = patch[i];
                    }
                }
                FileSystem.save(JSON.stringify(logic, " ", 4), `logic${postfix}.json`);
            }
        },{
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
                    await LogicsStorage.setAll(intLogic);
                    // refresh
                    await refreshLogicEditor();
                    //logicEditor.reset();
                }
            }
        },{
            "content": "SAVE PATCH",
            "handler": async () => {
                const logic = {edges:{},logic:{}};
                const patch = await LogicsStorage.getAll();
                for (const i in patch) {
                    if (i.indexOf(" -> ") >= 0) {
                        const [key, target] = i.split(" -> ");
                        if (logic.edges[key] == null) {
                            logic.edges[key] = {};
                        }
                        logic.edges[key][target] = patch[i];
                    } else {
                        logic.logic[i] = patch[i];
                    }
                }
                FileSystem.save(JSON.stringify(logic, " ", 4), `logic${postfix}.${(new Date).valueOf()}.json`);
            }
        },{
            "content": "REMOVE PATCH",
            "handler": async () => {
                await LogicsStorage.clear();
                await refreshLogicEditor();
                //logicEditor.reset();
            }
        },{
            "content": "EXIT EDITOR",
            "handler": () => {
                logicEditor.reset();
                const event = new Event('close');
                logicEditor.dispatchEvent(event);
            }
        }]
    },{
        "content": "CREATE MIXIN",
        "handler": async () => {
            const name = await Dialog.prompt("Create Mixin", "please enter a name");
            if (typeof name == "string") {
                const el = {
                    "ref": `mixin.${name}`,
                    "category": "mixin",
                    "content": `mixin.${name}`
                };
                for (const i of lists.logics) {
                    if (i.type == "group" && i.caption == "mixin") {
                        i.children.push(el);
                        break;
                    }
                }
                logicEditor.loadList(lists.logics);
            }
        }
    }];

    return {
        name: `Logic${!!glitched?" Glitched":""}`,
        panel: logicEditor,
        navigation: NAV,
        refreshFn: refreshLogicEditor
    }
};
