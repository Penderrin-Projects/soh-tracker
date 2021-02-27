// GameTrackerJS
import WorldResource from "/GameTrackerJS/resource/WorldResource.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import WorldStateManager from "/GameTrackerJS/state/world/WorldStateManager.js";
import "/GameTrackerJS/state/world/area/StateManager.js";
import "/GameTrackerJS/state/world/exit/StateManager.js";
import "/GameTrackerJS/state/world/location/StateManager.js";
import "/GameTrackerJS/state/world/subarea/StateManager.js";
import "/GameTrackerJS/state/world/subexit/StateManager.js";
import Logic from "/GameTrackerJS/util/logic/Logic.js";
// Track-OOT
import "/script/state/world/CustomWorldStates.js";

SavestateHandler.addEventListener("reset", event => {
    Logic.clearTranslations();
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
        Logic.setTranslation(changes, "region.root");
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

}

const exits = WorldResource.get("marker/exit");
for (const name in exits) {
    const exit = WorldStateManager.get("exit", name);
    new ExitAugmentor(exit);
}
const subexits = WorldResource.get("marker/subexit");
for (const name in subexits) {
    const subexit = WorldStateManager.get("subexit", name);
    new ExitAugmentor(subexit);
}
