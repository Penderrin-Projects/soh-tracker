/* asym-import: off */
import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import "/emcJS/ui/Icon.js";
/* asym-import: on */
import AccessStateEnum from "../../enum/AccessStateEnum.js";
import StateDataEventManagerMixin from "../mixin/StateDataEventManager.js";
import ContextMenuManagerMixin from "../mixin/ContextMenuManager.js";
import Badge from "../Badge.js";
import iOSTouchHandler from "../../util/iOSTouchHandler.js";

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
    
    applyAccess(data) {
        const value = AccessStateEnum.getName(data.value).toLowerCase();
        /* access */
        const textEl = this.shadowRoot.getElementById("text");
        if (textEl != null) {
            textEl.dataset.state = value;
        }
        /* badge */
        const badgeEl = this.shadowRoot.getElementById("badge");
        if (badgeEl != null) {
            badgeEl.access = value;
        }
    }

}
