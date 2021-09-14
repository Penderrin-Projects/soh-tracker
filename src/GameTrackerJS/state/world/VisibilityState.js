import DataState from "../DataState.js";
import FilterHandler from "../../util/handler/FilterHandler.js";
import VisibilityHandler from "../../util/handler/VisibilityHandler.js";

const VISIBILITY_HANDLER = new WeakMap();
const FILTER_HANDLER = new WeakMap();
const VISIBLE = new WeakMap();

export default class VisibilityState extends DataState {

    constructor(ref, props = {}) {
        super(ref, props);

        /* VISIBILITY */
        VISIBLE.set(this, false);
        
        const visibilityHandler = new VisibilityHandler(props.visible);
        VISIBILITY_HANDLER.set(this, visibilityHandler);
        visibilityHandler.addEventListener("change", () => {
            this.updateVisible();
        });

        const filterHandler = new FilterHandler(props.filter);
        FILTER_HANDLER.set(this, filterHandler);
        filterHandler.addEventListener("change", () => {
            this.updateVisible();
        });

        /* --- */
        setTimeout(() => {
            this.updateVisible();
        }, 0);
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
