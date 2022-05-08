
import OptionsObserver from "../../util/observer/OptionsObserver.js";
import ExitStateManager from "../../statemanager/world/exit/ExitStateManager.js";
import Logic from "../logic/Logic.js";

const detachedEntrancesObserver = new OptionsObserver("option.detached_entrances");

const INSTANCES = new Map();
const EXIT = new WeakMap();

function checkForBindingCorrections(exit, newValue, oldValue) {
    if (!detachedEntrancesObserver.value) {
        const oldInstance = INSTANCES.get(oldValue);
        if (oldInstance != null) {
            const oldExit = oldInstance.exit;
            if (exit.ref == oldExit.ref) {
                // leave it as is
            } else if (exit.props.isBiDir) {
                if (oldExit.value == exit.ref) {
                    oldExit.value = "";
                }
            }
        }
        const newInstance = INSTANCES.get(newValue);
        if (newInstance != null) {
            const newEntrance = newInstance.exit;
            if (exit.ref == newEntrance.ref) {
                exit.value = "";
            } else if (exit.props.isBiDir) {
                if (newEntrance.value != "") {
                    const otherEntrance = INSTANCES.get(newEntrance.value);
                    if (otherEntrance != null) {
                        otherEntrance.value = "";
                    }
                }
                newEntrance.value = exit.ref;
            }
        }
    }
}

export default class LogicExitAugmentor {

    constructor(ref) {
        INSTANCES.set(ref, this);

        /* EXIT */
        const exit = ExitStateManager.get(ref);
        EXIT.set(this, exit);
        exit.addEventListener("active", () => {
            this.changeBinding();
        });
        exit.addEventListener("value", (event) => {
            checkForBindingCorrections(exit, event.newValue, event.oldValue);
            this.changeBinding();
        });
        this.changeBinding();
    }

    changeBinding() {
        const exit = EXIT.get(this);
        const changes = [];
        if (exit.active) {
            LogicExitAugmentor.applyBinding(changes, exit.ref, exit.value);
        } else {
            LogicExitAugmentor.applyBinding(changes, exit.ref, null);
        }
        if (changes.length) {
            Logic.setRedirect(changes, "region.root");
        }
    }

    get exit() {
        return EXIT.get(this);
    }

    static applyBinding(changes, from, to) {
        const [source, target] = from.split(" -> ");
        if (source && target) {
            if (!to) {
                changes.push({source: `${source}{child}`, target: `${target}{child}`, reroute: to});
                changes.push({source: `${source}{adult}`, target: `${target}{adult}`, reroute: to});
            } else {
                const [reroute] = to.split(" -> ");
                if (reroute) {
                    changes.push({source: `${source}{child}`, target: `${target}{child}`, reroute: `${reroute}{child}`});
                    changes.push({source: `${source}{adult}`, target: `${target}{adult}`, reroute: `${reroute}{adult}`});
                }
            }
        }
    }

}
