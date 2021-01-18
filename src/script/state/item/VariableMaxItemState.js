import FileData from "/emcJS/data/FileData.js";
import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
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
            const optionProps = FileData.get(`randomizer_options/options/${props.max.option}`);
            const option = StateStorage.read(props.max.option, optionProps.default);
            this./*#*/__applyMaxValue(option);
        }
        /* EVENTS */
        EventBus.register("randomizer_options", event => {
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
