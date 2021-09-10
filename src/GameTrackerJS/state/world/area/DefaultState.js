// frameworks
import EventBus from "/emcJS/event/EventBus.js";

import SavestateHandler from "../../../savestate/SavestateHandler.js";
import WorldState from "../WorldState.js";
import MarkerListHandler, {defaultAccess as defaultMarkerAccess} from "../../../util/handler/MarkerListHandler.js";

const LIST_HANDLER = new WeakMap();
const HINT = new WeakMap();

export default class DefaultAreaState extends WorldState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        this.hint = SavestateHandler.get("area_hint", `area/${ref}`, ""); // XXX remove "area/"
        /* handler */
        const listHandler = this.generateList();
        LIST_HANDLER.set(this, listHandler);
        /* EVENTS */
        EventBus.register("state::area_hint", (event) => {
            const ref = this.ref;
            // savesatate
            const change = event.data;
            if (change != null && change.ref == ref) {
                this./*#*/__setHint(change.value);
            }
        });
    }

    onStateLoad(state) {
        const ref = this.ref;
        // hint
        this.hint = state?.data?.["area_hint"]?.[`area/${ref}`] ?? ""; // XXX remove "area/"
    }

    /*#*/__setHint(value) {
        const ref = this.ref;
        if (typeof value != "string" || (value != "woth" && value != "barren")) {
            value = "";
        }
        const old = this.hint;
        if (value != old) {
            HINT.set(this, value);
            SavestateHandler.set("area_hint", `area/${ref}`, value); // XXX remove "area/"
            // external
            const event = new Event("hint");
            event.data = value;
            this.dispatchEvent(event);
        }
        return value;
    }

    set hint(value) {
        const ref = this.ref;
        const old = this.hint;
        value = this./*#*/__setHint(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::area_hint", { ref, value });
        }
    }

    get hint() {
        return HINT.get(this);
    }

    get listContents() {
        return this.props.listContents;
    }

    get access() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler?.access ?? defaultMarkerAccess;
    }

    get visible() {
        const listHandler = LIST_HANDLER.get(this);
        return super.visible && listHandler.visible;
    }

    /* list */
    generateList() {
        const listHandler = new MarkerListHandler(this.props.list, this.ref);
        listHandler.addEventListener("visibility", () => {
            this.updateVisible();
        });
        listHandler.addEventListener("access", event => {
            const ev = new Event("access");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        listHandler.addEventListener("change", event => {
            this.checkAllFilter();
            const ev = new Event("list_update");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        return listHandler;
    }

    getRawList() {
        const listHandler = LIST_HANDLER.get(this);
        return Array.from(listHandler.rawList);
    }

    getList() {
        const listHandler = LIST_HANDLER.get(this);
        return Array.from(listHandler.list);
    }

    getFilteredList() {
        const listHandler = LIST_HANDLER.get(this);
        return Array.from(listHandler.filteredList);
    }

    setAllEntries(value = true) {
        const listHandler = LIST_HANDLER.get(this);
        listHandler.setAllEntries(value);
    }

}
