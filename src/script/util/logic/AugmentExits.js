import EventBus from "/emcJS/event/EventBus.js";
import ExitRegistry from "/GameTrackerJS/registry/ExitRegistry.js";
import Logic from "/script/util/logic/Logic.js";

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
        const res = Logic.setTranslation(changes, "region.root");
        if (Object.keys(res).length > 0) {
            EventBus.trigger("logic", res);
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
        if (exit.active) {
            changeBinding([{
                from: access,
                to: exit.value
            }, {
                from: exit.value,
                to: access
            }]);
        } else {
            changeBinding([{
                from: access,
                to: null
            }, {
                from: exit.value,
                to: null
            }]);
        }
    }

    changeValue() {
        const exit = EXIT.get(this);
        const access = exit.props.access;
        if (exit.active) {
            changeBinding([{
                from: access,
                to: exit.value
            }, {
                from: exit.value,
                to: access
            }]);
        }
    }

}

class AugmentExits {

    init() {
        const exits = ExitRegistry.getAll();
        for (const exit of Object.values(exits)) {
            new ExitAugmentor(exit);
        }
    }

}

export default new AugmentExits();
