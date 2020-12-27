import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import "/emcJS/ui/Icon.js";
import StateDataEventManagerMixin from "../mixin/StateDataEventManager.js";
import ContextMenuManagerMixin from "../mixin/ContextMenuManager.js";
import Badge from "../Badge.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";

const BaseClass = ContextMenuManagerMixin(StateDataEventManagerMixin(UIEventBusMixin(HTMLElement)));
export default class WorldElement extends BaseClass {

    constructor() {
        super();
        /* fck iOS */
        iOSTouchHandler.register(this);
    }

    applyDefaultValues(defaultIcon) {
        const badge = this.shadowRoot.getElementById("badge");
        if (badge instanceof Badge) {
            badge.typeIcon = defaultIcon;
            badge.setFilterData({});
        }
    }

    applyStateValues(state, defaultIcon) {
        if (state != null) {
            const badge = this.shadowRoot.getElementById("badge");
            if (badge instanceof Badge) {
                badge.typeIcon = state.props.icon ?? defaultIcon;
                badge.setFilterData(state.filter);
            }
        }
    }

}
