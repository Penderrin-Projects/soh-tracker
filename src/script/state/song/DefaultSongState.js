// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";

// GameTrackerJS
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import DataState from "/GameTrackerJS/state/DataState.js";

const STORAGES = {songNotes: Savestate.getStorage("songNotes")};

const NOTES = new WeakMap();

export default class DefaultSongState extends DataState {

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        if (props.editable) {
            const songNotesObserver = new DataStorageValueObserver(STORAGES.songNotes, ref, props.notes);
            NOTES.set(this, songNotesObserver.value);
            songNotesObserver.addEventListener("change", (event) => {
                this.notes = event.data;
            });
        } else {
            NOTES.set(this, props.notes);
        }
    }

    set notes(value) {
        if (this.props.editable) {
            const ref = this.ref;
            if (value == null) {
                value = this.props.notes;
            }
            if (typeof value == "string") {
                const old = this.notes;
                if (value != old) {
                    NOTES.set(this, value);
                    STORAGES.songNotes.set(ref, value);
                    // external
                    const event = new Event("notes");
                    event.data = value;
                    this.dispatchEvent(event);
                }
            }
        }
    }

    get notes() {
        return NOTES.get(this);
    }

}
