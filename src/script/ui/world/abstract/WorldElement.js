import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import "/emcJS/ui/Icon.js";
import StateDataEventManagerMixin from "/script/ui/mixin/StateDataEventManager.js";
import ContextMenuManagerMixin from "/script/ui/mixin/ContextMenuManager.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";
import Badge from "/script/ui/Badge.js";

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
