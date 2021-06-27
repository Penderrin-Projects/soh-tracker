/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */
import WorldStateManagers from "../StateManagers.js";
import ExitState from "../abstract/ExitState.js";

export default class DefaultState extends ExitState {

    constructor(ref, props, exitData) {
        super(ref, props, exitData);
        /* --- */
        EventBus.register("state::exit_binding", event => {
            this./*#*/__internalChange(event);
        });
    }

    set value(value) {
        const oldValue = this.value;
        super.value = value;
        const newValue = this.value;
        if (newValue != null && newValue != oldValue) {
            // internal
            EventBus.trigger("state::exit_binding", { ref: this.props.access, value: newValue });
        }
    }

    get value() {
        return super.value;
    }

    /*#*/__internalChange(event) {
        const access = this.props.access;
        // savesatate
        const change = event.data;
        if (change != null) {
            if (change.ref == access) {
                // if this exit got bound
                super.value = change.value;
            } else if (change.value == access) {
                // if this entrance got bound
                const otherExit = WorldStateManagers.getEntrance(change.ref);
                if (otherExit != null && otherExit.props.isBiDir) {
                    super.value = change.ref;
                }
            } else if (change.value != "" && change.value == this.value) {
                // if another exit got bound to this ones entrance
                if (!this.exitData.ignoreBound) {
                    const otherExit = WorldStateManagers.getEntrance(change.ref);
                    if (otherExit != null && !otherExit.props.ignoreBound) {
                        super.value = "";
                    }
                }
            } else if (change.ref == this.value) {
                // if another entrance got bound to this ones exit
                // if the exit does no longer bind to this
                if (!this.exitData.ignoreBound) {
                    const otherExit = WorldStateManagers.getEntrance(change.ref);
                    if (otherExit == null || !otherExit.props.ignoreBound) {
                        super.value = "";
                    }
                }
            }
        }
    }

}
