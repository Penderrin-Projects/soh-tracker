/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import DataState from "/GameTrackerJS/state/abstract/DataState.js";

const NOTES = new WeakMap();

function internalChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setNotes(change.value);
    }
}

export default class DefaultState extends DataState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        if (props.editable) {
            this.notes = SavestateHandler.get("songs", ref, props.notes);
        } else {
            NOTES.set(this, props.notes);
        }
        /* EVENTS */
        EventBus.register("state::song", internalChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
    }

    stateLoaded(event) {
        if (this.props.editable) {
            const ref = this.ref;
            if (ref) {
                // notes
                if (event.data.extra.songs != null) {
                    this.notes = event.data.extra.songs[ref] ?? this.props.notes;
                } else {
                    this.notes = this.props.notes;
                }
            }
        }
    }

    /*#*/__setNotes(value) {
        if (this.props.editable) {
            const ref = this.ref;
            if (typeof value == "string") {
                const old = this.notes;
                if (value != old) {
                    NOTES.set(this, value);
                    SavestateHandler.set("songs", ref, value);
                    // external
                    const event = new Event("notes");
                    event.data = value;
                    this.dispatchEvent(event);
                }
                return value;
            }
        }
    }
        
    set notes(value) {
        const ref = this.ref;
        const old = this.hint;
        value = this./*#*/__setNotes(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::song", {ref, value});
        }
    }

    get notes() {
        return NOTES.get(this);
    }

}
