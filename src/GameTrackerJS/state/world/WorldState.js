import SavestateHandler from "../../savestate/SavestateHandler.js";
import DataState from "../DataState.js";
import FilterHandler from "../../util/handler/FilterHandler.js";
import VisibilityHandler from "../../util/handler/VisibilityHandler.js";

const VISIBILITY_HANDLER = new WeakMap();
const FILTER_HANDLER = new WeakMap();
const VISIBLE = new WeakMap();

export default class WorldState extends DataState {

    constructor(ref, props = {}) {
        super(ref, props);
        /* --- */
        VISIBLE.set(this, false);
        /* handler */
        const visibilityHandler = new VisibilityHandler(props.visible);
        VISIBILITY_HANDLER.set(this, visibilityHandler);
        const filterHandler = new FilterHandler(props.filter);
        FILTER_HANDLER.set(this, filterHandler);
        visibilityHandler.addEventListener("change", () => {
            this.updateVisible();
        });
        filterHandler.addEventListener("change", () => {
            this.updateVisible();
        });
        /* savestate */
        SavestateHandler.addEventListener("beforeload", event => {
            this.beforeStateLoad();
        });
        SavestateHandler.addEventListener("load", event => {
            this.onStateLoad(event.state);
        });
        /* --- */
        setTimeout(() => {
            this.updateVisible();
        }, 0);
    }

    beforeStateLoad() {
        // nothing
    }

    onStateLoad(state) {
        // nothing
    }

    get visible() {
        const visibilityHandler = VISIBILITY_HANDLER.get(this);
        return visibilityHandler.visible;
    }

    get filtered() {
        const filterHandler = FILTER_HANDLER.get(this);
        return filterHandler.filtered;
    }

    isVisible() {
        return VISIBLE.get(this);
    }

    updateVisible() {
        const value = this.visible && !this.filtered;
        const old = VISIBLE.get(this);
        if (old != value) {
            VISIBLE.set(this, value);
            // external
            const ev = new Event("visiblity");
            ev.data = value;
            this.dispatchEvent(ev);
        }
    }

    checkAllFilter() {
        const filterHandler = FILTER_HANDLER.get(this);
        filterHandler.checkAllFilter();
    }

}
