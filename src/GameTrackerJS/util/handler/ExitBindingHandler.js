import SavestateHandler from "../../savestate/SavestateHandler.js";
import ExitStateManager from "../../statemanager/world/exit/ExitStateManager.js";
import Logic from "../logic/Logic.js";
import LogicExitAugmentor from "../logic/LogicExitAugmentor.js";

// TODO add reverse exit bind handling
// include detached exit support

const AUGMENTORS = new Set();

function initRedirects() {
    Logic.clearRedirects();
    const initTransalation = [];
    for (const entry of AUGMENTORS) {
        if (entry.exit.active) {
            LogicExitAugmentor.applyBinding(initTransalation, entry.exit.ref, entry.exit.value);
        }
    }
    if (initTransalation.length) {
        Logic.setRedirect(initTransalation, "region.root");
    }
}

SavestateHandler.addEventListener("afterload", () => {
    initRedirects();
});

/*
function checkForBindingCorrections(event) {
    // savesatate
    const change = event.data;
    if (change != null) {
        if (change.ref == this.ref) {
            // if this exit got bound
            super.value = change.value;
        } else if (change.value == this.ref) {
            // if this entrance got bound
            const otherExit = EntranceStateManager.get(change.ref);
            if (otherExit != null && otherExit.props.isBiDir) {
                super.value = change.ref;
            }
        } else if (change.value != "" && change.value == this.value) {
            // if another exit got bound to this ones entrance
            if (change.value != "\u0000" && !this.props.ignoreBound) {
                const otherExit = EntranceStateManager.get(change.ref);
                if (otherExit != null && !otherExit.props.ignoreBound) {
                    super.value = "";
                }
            }
        } else if (change.ref == this.value) {
            // if another entrance got bound to this ones exit
            // if the exit does no longer bind to this
            if (change.value != "\u0000" && !this.props.ignoreBound) {
                const otherExit = EntranceStateManager.get(change.ref);
                if (otherExit == null || !otherExit.props.ignoreBound) {
                    super.value = "";
                }
            }
        }
    }
}
*/

// scoped init
{
    const MISSING_ENTRANCES = new Set();
    for (const [ref, exit] of ExitStateManager) {
        AUGMENTORS.add(new LogicExitAugmentor(ref));
        // reverse exits
        if (MISSING_ENTRANCES.has(ref)) {
            MISSING_ENTRANCES.delete(ref);
        } else {
            MISSING_ENTRANCES.add(exit.props.target);
        }
    }

    for (const ref of MISSING_ENTRANCES) {
        console.warn("entrance missing: ", ref);
    }

    initRedirects();
}
