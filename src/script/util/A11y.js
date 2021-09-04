// frameworks
import StyleVariables from "/emcJS/util/html/StyleVariables.js";

// GameTrackerJS
import SettingsObserver from "/GameTrackerJS/util/observer/SettingsObserver.js";

const initialValues = {};

function addStyleVariableObserver(ref, name) {
    const observer = new SettingsObserver(ref);
    observer.addEventListener("change", event => {
        StyleVariables.set(name, event.data);
    });
    initialValues[name] = observer.value;
}

// register a11y colors
addStyleVariableObserver("location_status_opened_color", "location-status-opened-color");
addStyleVariableObserver("location_status_available_color", "location-status-available-color");
addStyleVariableObserver("location_status_unavailable_color", "location-status-unavailable-color");
addStyleVariableObserver("location_status_possible_color", "location-status-possible-color");

// write initial values
StyleVariables.steAll(initialValues);
