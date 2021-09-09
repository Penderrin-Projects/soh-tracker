import VisibilityState from "../../abstract/VisibilityState.js";
import MarkerListHandler, {defaultAccess as defaultMarkerAccess} from "../../../util/MarkerListHandler.js";
import AccessStateEnum from "../../../enum/AccessStateEnum.js";

const LIST_HANDLER = new WeakMap();

export default class DefaultCollectionState extends VisibilityState {
    
    constructor(ref, props = {}) {
        super(ref, props);
        /* --- */
        const listHandler = this.generateList();
        LIST_HANDLER.set(this, listHandler);
    }
    
    generateList() {
        const list = this.props.list;
        const listHandler = new MarkerListHandler(list, this.ref);
        listHandler.addEventListener("access", event => {
            const ev = new Event("access");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        listHandler.addEventListener("change", event => {
            if (event.list != null) {
                const ev = new Event("list_update");
                ev.data = event.list;
                this.dispatchEvent(ev);
            }
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

    get access() {
        const listHandler = LIST_HANDLER.get(this);
        return listHandler?.access ?? defaultMarkerAccess;
    }

    get visible() {
        return true;
    }
    
    isVisible() {
        return this.visible;
    }

}
