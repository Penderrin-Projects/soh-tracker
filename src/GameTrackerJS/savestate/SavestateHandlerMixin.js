// frameworks
import {createMixin} from "/emcJS/util/Mixin.js";
import Savestate from "./Savestate.js";
import SavestateHandler from "./SavestateHandler.js";

export default createMixin((superclass) => class SavestateHandlerMixin extends superclass {

    constructor(...args) {
        super(...args);
        /* --- */
        SavestateHandler.addEventListener("beforeload", () => {
            this.savestateBeforeloadCallback();
        });
        SavestateHandler.addEventListener("reset", () => {
            this.savestateResetCallback();
        });
        SavestateHandler.addEventListener("load", (event) => {
            this.savestateLoadCallback(event.state);
        });
        SavestateHandler.addEventListener("afterload", () => {
            this.savestateAfterloadCallback();
        });
        Savestate.addEventListener("change", (event) => {
            const category = event.category;
            this.savestateChangedCallback(category, event.data);
            const observed = this.constructor.observedSavestateValues();
            const observedValues = observed?.[category];
            if (observedValues != null) {
                for (const name of observedValues) {
                    const changed = event.changed[name];
                    if (changed != null) {
                        const {oldValue, newValue} = changed;
                        this.savestateValueChangedCallback(category, name, oldValue, newValue);
                    }
                }
            }
        });
    }

    savestateBeforeloadCallback() {
        // empty
    }

    savestateResetCallback() {
        // empty
    }

    savestateLoadCallback(state) {
        // empty
    }

    savestateAfterloadCallback() {
        // empty
    }

    savestateChangedCallback(category, data) {
        // empty
    }

    static get observedSavestateValues() {
        return {};
    }

    savestateValueChangedCallback(category, name, oldValue, newValue) {
        // empty
    }

});
