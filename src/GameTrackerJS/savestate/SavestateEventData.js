const STATE = new WeakMap();

export default class SavestateEventData {

    constructor(state) {
        STATE.set(this, state);
    }

    getData(category, key, value) {
        const state = STATE.get(this);
        if (state != null && state.data != null && state.data[category] != null) {
            return state.data[category][key] ?? value;
        }
        return value;
    }

    getNotes() {
        const state = STATE.get(this);
        if (state != null) {
            return state.notes ?? "";
        }
    }

    getState() {
        return STATE.get(this);
    }

}
