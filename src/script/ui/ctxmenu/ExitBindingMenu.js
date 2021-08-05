import ExitBindingMenu from "/GameTrackerJS/ui/ctxmenu/ExitBindingMenu.js";
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";

const mixedEntrancePoolObserver = new OptionsObserver("option.mixed_entrance_pool");

export default class TrackerExitBindingMenu extends ExitBindingMenu {

    checkBindable(value, exit, bound) {
        const ignoreBindsTo = mixedEntrancePoolObserver.value;
        const isActive = value.active || exit.props.includeInactiveEntrances;
        const isActiveAndBinds = isActive && (ignoreBindsTo || exit.props.bindsTo.indexOf(value.props.type) >= 0);
        return isActiveAndBinds && (!bound.has(value.props.target) || exit.props.ignoreBound);
    }

}

customElements.define("ootrt-ctxmenu-exitbinding", TrackerExitBindingMenu);
