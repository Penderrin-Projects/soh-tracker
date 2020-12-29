import EventBus from "/emcJS/event/EventBus.js";
import StateData from "/GameTrackerJS/state/abstract/StateData.js";
import StateStorage from "/script/storage/StateStorage.js";

const NOTES = new WeakMap();

function internalChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.notes = change.value;
    }
}

export default class DefaultState extends StateData {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        this.notes = StateStorage.readExtra("songs", ref, props.notes);
        /* EVENTS */
        EventBus.register("state::song", internalChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
    }

    stateLoaded(event) {
        const ref = this.ref;
        if (ref) {
            // notes
            if (event.data.extra.songs != null) {
                const value = event.data.extra.songs[ref];
                if (value != null) {
                    this.notes = value;
                } else {
                    this.notes = this.props.notes;
                }
            } else {
                this.notes = this.props.notes;
            }
        }
    }

    set notes(value) {
        const ref = this.ref;
        if (typeof value == "string") {
            if (this.props.editable) {
                const old = this.notes;
                if (value != old) {
                    NOTES.set(this, value);
                    StateStorage.writeExtra("songs", ref, value);
                    // external
                    const event = new Event("notes");
                    event.data = value;
                    this.dispatchEvent(event);
                    // internal
                    EventBus.trigger("state::song", {ref, value});
                }
            }
        }
    }

    get notes() {
        return NOTES.get(this);
    }

}
