// GameTrackerJS
import WorldResource from "/GameTrackerJS/resource/WorldResource.js";
import WorldStateManagers from "/GameTrackerJS/state/world/StateManagers.js";
import "/GameTrackerJS/state/world/area/StateManager.js";
import "/GameTrackerJS/state/world/exit/StateManager.js";
import "/GameTrackerJS/state/world/subarea/StateManager.js";
import "/GameTrackerJS/state/world/subexit/StateManager.js";
import Logic from "/GameTrackerJS/util/logic/Logic.js";
// Track-OOT
import "/script/state/world/area/AreaState.js";
import "/script/state/world/area/DungeonState.js";

function changeBinding(values) {
    const changes = [];
    if (Array.isArray(values)) {
        for (const {from, to} of values) {
            const [source, target] = from.split(" -> ");
            if (!to) {
                changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: to});
                changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: to});
            } else {
                const [reroute] = to.split(" -> ");
                changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${reroute}[child]`});
                changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${reroute}[adult]`});
            }
        }
    } else {
        const {from, to} = values;
        const [source, target] = from.split(" -> ");
        if (!to) {
            changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: to});
            changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: to});
        } else {
            const [reroute] = to.split(" -> ");
            changes.push({source: `${source}[child]`, target: `${target}[child]`, reroute: `${reroute}[child]`});
            changes.push({source: `${source}[adult]`, target: `${target}[adult]`, reroute: `${reroute}[adult]`});
        }
    }
    if (changes.length) {
        Logic.setTranslation(changes, "region.root");
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
    const exit = WorldStateManagers.get("exit", name);
    new ExitAugmentor(exit);
}
