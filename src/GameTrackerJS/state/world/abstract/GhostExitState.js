// frameworks
import EventBus from "/emcJS/event/EventBus.js";

import EntranceStateManager from "../entrance/StateManager.js";
import AbstractExitState from "./ExitState.js";

export default class GhostExitState extends AbstractExitState {

    constructor(ref, props = {}, exitData = {}) {
        super(ref, props, exitData);
        /* --- */
        EventBus.register("state::exit_binding", event => {
            this./*#*/__internalChange(event);
        });
    }

    onStateLoad(state) {
        // nothing
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
                const otherExit = EntranceStateManager.get(change.ref);
                if (otherExit != null && otherExit.props.isBiDir) {
                    super.value = change.ref;
                }
            } else if (change.value != "" && change.value == this.value) {
                // if another exit got bound to this ones entrance
                if (!this.exitData.ignoreBound) {
                    const otherExit = EntranceStateManager.get(change.ref);
                    if (otherExit != null && !otherExit.props.ignoreBound) {
                        super.value = "";
                    }
                }
            } else if (change.ref == this.value) {
                // if another entrance got bound to this ones exit
                // if the exit does no longer bind to this
                if (!this.exitData.ignoreBound) {
                    const otherExit = EntranceStateManager.get(change.ref);
                    if (otherExit == null || !otherExit.props.ignoreBound) {
                        super.value = "";
                    }
                }
            }
        }
    }

}
