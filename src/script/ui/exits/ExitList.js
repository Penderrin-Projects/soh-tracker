import FileData from "/emcJS/data/FileData.js";
import TabPanel from "/emcJS/ui/layout/panel/TabPanel.js";
import Language from "/script/util/Language.js";
import "/GameTrackerJS/ui/ExitChoice.js";

export default class HTMLTrackerExitList extends TabPanel {
    
    constructor() {
        super();
        /* --- */
        const exits = FileData.get("world/exit");
        for (const exit in exits) {
            const category = exits[exit].type;
            this.addEntrance(category, exit);
        }
    }

    addTab(category) {
        return super.addTab(category, Language.translate(category));
    }

    addEntrance(category, ref) {
        const el = document.createElement('gt-exitchoice');
        el.ref = ref;
        const panel = this.getTab(category);
        if (panel != null) {
            panel.append(el);
        } else {
            this.addTab(category).append(el);
        }
    }

}

customElements.define('ootrt-exitlist', HTMLTrackerExitList);
