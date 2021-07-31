// frameworks
import UIEventBusMixin from "/emcJS/event/ui/EventBusMixin.js";
import "/emcJS/ui/Icon.js";

import AccessStateEnum from "../../enum/AccessStateEnum.js";
import StateDataEventManagerMixin from "../mixin/StateDataEventManager.js";
import ContextMenuManagerMixin from "../mixin/ContextMenuManager.js";
import Badge from "../Badge.js";
import "../BadgeAccess.js";

const BaseClass = ContextMenuManagerMixin(StateDataEventManagerMixin(UIEventBusMixin(HTMLElement)));
export default class WorldElement extends BaseClass {

    constructor() {
        super();
        /* --- */
        this.registerStateHandler("visible", event => {
            const state = this.getState();
            if (state != null) {
                if (state.isVisible()) {
                    this.style.display = "";
                } else {
                    this.style.display = "none";
                }
            }
        });
        this.registerStateHandler("filter", event => {
            const state = this.getState();
            if (state != null) {
                if (state.isVisible()) {
                    this.style.display = "";
                } else {
                    this.style.display = "none";
                }
            }
        });
        /* mouse events */
        this.addEventListener("click", event => {
            this.clickHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            this.contextmenuHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    clickHandler(event) {
        // nothing
    }

    contextmenuHandler(event) {
        const mnu_ctx = this.getDefaultContextMenu();
        if (mnu_ctx != null) {
            mnu_ctx.show(event.clientX, event.clientY);
        }
    }

    applyDefaultValues(defaultIcon) {
        const badge = this.shadowRoot.getElementById("badge");
        if (badge instanceof Badge) {
            badge.typeIcon = defaultIcon;
            badge.setFilterData({});
        }
        this.style.display = "none";
    }

    applyStateValues(state, defaultIcon) {
        if (state != null) {
            const badge = this.shadowRoot.getElementById("badge");
            if (badge instanceof Badge) {
                badge.typeIcon = state.props.icon ?? defaultIcon;
                badge.setFilterData(state.props.filter);
            }
            if (state.isVisible()) {
                this.style.display = "";
            } else {
                this.style.display = "none";
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
            badgeEl.available = data.reachable;
            badgeEl.unopened = data.unopened;
        }
    }

}
