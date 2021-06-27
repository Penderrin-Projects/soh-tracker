// GameTrackerJS
import WorldResource from "/GameTrackerJS/resource/WorldResource.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import WorldStateManager from "/GameTrackerJS/state/world/WorldStateManager.js";
import GhostExitState from "/GameTrackerJS/state/world/abstract/GhostExitState.js";
import "/GameTrackerJS/state/world/area/StateManager.js";
import "/GameTrackerJS/state/world/exit/StateManager.js";
import "/GameTrackerJS/state/world/location/StateManager.js";
import "/GameTrackerJS/state/world/subarea/StateManager.js";
import "/GameTrackerJS/state/world/subexit/StateManager.js";
import Logic from "/GameTrackerJS/util/logic/Logic.js";
// Track-OOT
import "/script/state/world/CustomWorldStates.js";

const AUGMENTORS = new Set();

function initRedirects() {
    Logic.clearRedirects();
    const initTransalation = [];
    for (const entry of AUGMENTORS) {
        if (entry.exit.active) {
            applyBinding(initTransalation, entry.exit.props.access, entry.exit.value);
        }
    }
    if (initTransalation.length) {
        Logic.setRedirect(initTransalation, "region.root");
    }
}

SavestateHandler.addEventListener("afterload", event => {
    initRedirects();
});

function changeBinding(values) {
    const changes = [];
    if (Array.isArray(values)) {
        for (const {from, to} of values) {
            applyBinding(changes, from, to);
        }
    } else {
        const {from, to} = values;
        applyBinding(changes, from, to);
    }
    if (changes.length) {
        Logic.setRedirect(changes, "region.root");
    }
}

function applyBinding(changes, from, to) {
    const [source, target] = from.split(" -> ");
    if (source && target) {
        if (!to) {
            changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: to});
            changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: to});
        } else {
            const [reroute] = to.split(" -> ");
            if (reroute) {
                changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${reroute}[child]`});
                changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${reroute}[adult]`});
            }
        }
    }
}

const EXIT = new WeakMap();

class ExitAugmentor {

    constructor(exit) {
        EXIT.set(this, exit);
        // change active
        exit.addEventListener("active", () => {
            this.changeActive();
        });
        // change value
        exit.addEventListener("value", () => {
            this.changeValue();
        });
        // init
        this.changeActive();
    }

    changeActive() {
        const exit = EXIT.get(this);
        const access = exit.props.access;
        const bindingChange = [];
        if (exit.active) {
            bindingChange.push({
                from: access,
                to: exit.value
            });
            if (exit.exitData.isBiDir) {
                bindingChange.push({
                    from: exit.value,
                    to: access
                });
            }
        } else {
            bindingChange.push({
                from: access,
                to: null
            });
            if (exit.exitData.isBiDir) {
                bindingChange.push({
                    from: exit.value,
                    to: null
                });
            }
        }
        changeBinding(bindingChange);
    }

    changeValue() {
        const exit = EXIT.get(this);
        const access = exit.props.access;
        if (exit.active) {
            const bindingChange = [{
                from: access,
                to: exit.value
            }];
            if (exit.exitData.isBiDir) {
                bindingChange.push({
                    from: exit.value,
                    to: access
                });
            }
            changeBinding(bindingChange);
        }
    }

    get exit() {
        return EXIT.get(this);
    }

}

// scoped init
{
    const NEEDED_REVERSE = new Map();

    const exits = WorldResource.get("marker/exit");
    for (const name in exits) {
        const exit = WorldStateManager.get("exit", name);
        AUGMENTORS.add(new ExitAugmentor(exit));
        // reverse exits
        if (NEEDED_REVERSE.has(exit.props.access)) {
            NEEDED_REVERSE.delete(exit.props.access);
        } else {
            NEEDED_REVERSE.set(exit.props.access.split(" -> ").reverse().join(" -> "), exit);
        }
    }
    const subexits = WorldResource.get("marker/subexit");
    for (const name in subexits) {
        const subexit = WorldStateManager.get("subexit", name);
        AUGMENTORS.add(new ExitAugmentor(subexit));
        // reverse subexits
        if (NEEDED_REVERSE.has(subexit.props.access)) {
            NEEDED_REVERSE.delete(subexit.props.access);
        } else {
            NEEDED_REVERSE.set(subexit.props.access.split(" -> ").reverse().join(" -> "), subexit);
        }
    }

    for (const [access, exit] of NEEDED_REVERSE) {
        const ghost_exit = new GhostExitState(`${exit.ref}_reverse`, {...exit.props, access}, exit.exitData);
        AUGMENTORS.add(new ExitAugmentor(ghost_exit));
    }

    initRedirects();
}
