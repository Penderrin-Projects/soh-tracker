import ExitBindingMenu from "/GameTrackerJS/ui/ctxmenu/ExitBindingMenu.js";
import OptionsSpy from "/GameTrackerJS/util/spy/OptionsSpy.js";

const mixedEntrancePoolSpy = new OptionsSpy("option.mixed_entrance_pool");

export default class TrackerExitBindingMenu extends ExitBindingMenu {

    checkBindable(value, exit, bound) {
        const ignoreBindsTo = mixedEntrancePoolSpy.getValue();
        const isActive = value.active || exit.props.includeInactiveEntrances;
        const isActiveAndBinds = isActive && (ignoreBindsTo || exit.props.bindsTo.indexOf(value.props.type) >= 0);
        return isActiveAndBinds && (!bound.has(value.props.target) || exit.props.ignoreBound);
    }

}

customElements.define("ootrt-ctxmenu-exitbinding", TrackerExitBindingMenu);
