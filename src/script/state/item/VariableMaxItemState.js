/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import OptionsResource from "/GameTrackerJS/resource/OptionsResource.js";
import StateManager from "/GameTrackerJS/state/item/StateManager.js";
import DefaultState from "/GameTrackerJS/state/item/DefaultState.js";

function getMaxValue(props) {
    let res = 0;
    for (const key in props.max.values) {
        res = Math.max(res, props.max.values[key]);
    }
    return res;
}

export default class VariableMaxItemState extends DefaultState {

    constructor(ref, props) {
        super(ref, props, 0, getMaxValue(props));
        /* --- */
        if (props.max.option != null) {
            const optionProps = OptionsResource.get(props.max.option);
            const option = SavestateHandler.get("", props.max.option, optionProps.default);
            this./*#*/__applyMaxValue(option);
        }
        /* EVENTS */
        EventBus.register("options", event => {
            if (event.data[props.max.option] != null) {
                this./*#*/__applyMaxValue(event.data[props.max.option]);
            }
        });
    }

    /*#*/__applyMaxValue(newValue) {
        const props = this.props;
        if (props.max.values[newValue] != null) {
            super.max = props.max.values[newValue];
        }
    }

    stateLoaded(event) {
        const props = this.props;
        // savesatate
        super.stateLoaded(event);
        // settings
        if (event.data.state[props.max.values] != null) {
            this./*#*/__applyMaxValue(event.data.state[props.max.values]);
        }
    }

    get min() {
        return super.min;
    }

    get max() {
        return super.max;
    }

}

StateManager.register("varmax", VariableMaxItemState);
