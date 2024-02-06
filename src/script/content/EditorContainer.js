import EditorContainer from "/JSEditors/EditorContainer.js";
import PageSwitcher from "/script/util/PageSwitcher.js";
import createLogicEditor from "./editors/LogicEditor.js";
import createLogicGlitchedEditor from "./editors/LogicGlitchedEditor.js";

const editorChoice = document.getElementById("editor-choice");
const nav = document.getElementById("navbar");

const MAIN_NAV = [{
    "content": "EXIT",
    "handler": () => {
        PageSwitcher.switch("main");
    }
}, {"mixin": "fullscreen"}];

const DEFAULT_NAV = [{
    "content": "EXIT",
    "handler": () => {
        editorChoice.closeCurrent();
    }
}, {"mixin": "fullscreen"}];

PageSwitcher.register("editor_choice", MAIN_NAV);

export default class TrackerEditorContainer extends EditorContainer {

    #navConfig = new Map();

    constructor() {
        super();
        /* --- */
        this.loadEditors();
        /* --- */
        this.addEventListener("change", (event) => {
            const appName = event.data;
            if (appName === "") {
                nav.loadNavigation(MAIN_NAV);
            } else {
                const navConfig = this.#navConfig.get(appName);
                if (navConfig != null) {
                    nav.loadNavigation(navConfig.concat({"mixin": "fullscreen"}));
                } else {
                    nav.loadNavigation(DEFAULT_NAV);
                }
            }
        });
    }

    register({name, panelEl, navConfig, refreshFn}) {
        if (typeof name !== "string" || name == "") {
            throw Error("Panel name must be a non empty string");
        }
        if (this.#navConfig.has(name)) {
            throw Error(`Panel with name "${name}" already registered`);
        }
        this.#navConfig.set(name, navConfig);
        super.register({name, panelEl, refreshFn});
    }

    async loadEditors() {
        this.register(await createLogicEditor());
        this.register(await createLogicGlitchedEditor());
    }

}

customElements.define("ootrt-editor-container", TrackerEditorContainer);
