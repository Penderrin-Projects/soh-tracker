/* asym-import: off */
import LogicGraph from "/emcJS/util/graph/LogicGraph.js";
/* asym-import: on */
import SettingsSpy from "../spy/SettingsSpy.js";

const logicDebugSpy = new SettingsSpy("debug_logic");

const LOGIC_PROCESSOR = new LogicGraph(logicDebugSpy.value != "off" && logicDebugSpy.value);
const CALL_TIMERS = new Map();

logicDebugSpy.addEventListener("change", event => {
    LOGIC_PROCESSOR.debug = event.data != "off" && event.data;
});

class TrackerLogic extends EventTarget {

    setLogic(logic, root) {
        if (logic) {
            LOGIC_PROCESSOR.clearGraph();
            LOGIC_PROCESSOR.load(logic);
            if (root != null) {
                if (!CALL_TIMERS.has(root)) {
                    CALL_TIMERS.set(root, setTimeout(() => {
                        const data = LOGIC_PROCESSOR.traverse(root);
                        if (Object.keys(data).length > 0) {
                            const ev = new Event("change");
                            ev.data = data;
                            this.dispatchEvent(ev);
                        }
                        CALL_TIMERS.delete(root);
                    }, 0));
                }
            }
        }
    }

    clearTranslations(root) {
        LOGIC_PROCESSOR.clearTranslations();
        if (root != null) {
            if (!CALL_TIMERS.has(root)) {
                CALL_TIMERS.set(root, setTimeout(() => {
                    const data = LOGIC_PROCESSOR.traverse(root);
                    if (Object.keys(data).length > 0) {
                        const ev = new Event("change");
                        ev.data = data;
                        this.dispatchEvent(ev);
                    }
                    CALL_TIMERS.delete(root);
                }, 0));
            }
        }
    }

    setTranslation(translations, root) {
        if (Array.isArray(translations)) {
            for (const t of translations) {
                LOGIC_PROCESSOR.setTranslation(t.source, t.target, t.reroute);
            }
        }
        if (root != null) {
            if (!CALL_TIMERS.has(root)) {
                CALL_TIMERS.set(root, setTimeout(() => {
                    const data = LOGIC_PROCESSOR.traverse(root);
                    if (Object.keys(data).length > 0) {
                        const ev = new Event("change");
                        ev.data = data;
                        this.dispatchEvent(ev);
                    }
                    CALL_TIMERS.delete(root);
                }, 0));
            }
        }
    }

    execute(data, root) {
        if (data) {
            LOGIC_PROCESSOR.setAll(data);
            if (root != null) {
                if (!CALL_TIMERS.has(root)) {
                    CALL_TIMERS.set(root, setTimeout(() => {
                        const data = LOGIC_PROCESSOR.traverse(root);
                        if (Object.keys(data).length > 0) {
                            const ev = new Event("change");
                            ev.data = data;
                            this.dispatchEvent(ev);
                        }
                        CALL_TIMERS.delete(root);
                    }, 0));
                }
            }
        }
    }

    reset() {
        LOGIC_PROCESSOR.reset();
    }

    getValue(ref) {
        return LOGIC_PROCESSOR.get(ref);
    }

    getAll() {
        return LOGIC_PROCESSOR.getAll();
    }

}

export default new TrackerLogic();
