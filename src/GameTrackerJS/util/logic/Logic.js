// frameworks
import LogicGraph from "/emcJS/util/graph/LogicGraph.js";

import SettingsSpy from "../spy/SettingsSpy.js";

const logicDebugSpy = new SettingsSpy("debug_logic");

const LOGIC_PROCESSOR = new LogicGraph(logicDebugSpy.getValue() != "off" && logicDebugSpy.getValue());
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

    clearRedirects(root) {
        LOGIC_PROCESSOR.clearRedirects();
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

    setRedirect(redirects, root) {
        if (Array.isArray(redirects)) {
            LOGIC_PROCESSOR.setAllRedirects(redirects);
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

    addReachable(target) {
        LOGIC_PROCESSOR.addReachable(target);
    }

    deleteReachable(target) {
        LOGIC_PROCESSOR.deleteReachable(target);
    }

    clearReachables() {
        LOGIC_PROCESSOR.clearReachables();
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
