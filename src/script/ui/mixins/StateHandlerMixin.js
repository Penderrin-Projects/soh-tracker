import StateData from "/script/state/abstract/StateData.js";

const STATE = new WeakMap();
const SUBS = new WeakMap();

export default (CLAZZ) => class extends CLAZZ {

    constructor(...args) {
        super(...args);
        SUBS.set(this, new Map());
        STATE.set(this, null);
    }

    switchState(newState) {
        const oldState = STATE.get(this);
        const subs = SUBS.get(this);
        if (oldState != null) {
            subs.forEach(function(fn, name) {
                oldState.removeEventListener(name, fn);
            });
        }
        if (newState instanceof StateData) {
            STATE.set(this, newState);
            if (this.isConnected) {
                subs.forEach(function(fn, name) {
                    newState.addEventListener(name, fn);
                });
            }
        } else {
            STATE.set(this, null);
        }
    }

    getState() {
        return STATE.get(this);
    }

    registerStateHandler(name, fn) {
        if (Array.isArray(name)) {
            name.forEach(n => this.registerStateHandler(n, fn));
        } else {
            const subs = SUBS.get(this);
            subs.set(name, fn);
            if (this.isConnected) {
                const state = STATE.get(this);
                if (state != null) {
                    state.addEventListener(name, fn);
                }
            }
        }
    }

    unregisterStateHandler(name, fn) {
        if (Array.isArray(name)) {
            name.forEach(n => this.unregisterStateHandler(n, fn));
        } else {
            const subs = SUBS.get(this);
            if (subs.has(name)) {
                const state = STATE.get(this);
                subs.delete(name);
                if (state != null) {
                    state.removeEventListener(name, fn);
                }
            }
        }
    }

    connectedCallback() {
        if (super.connectedCallback) {
            super.connectedCallback();
        }
        const state = STATE.get(this);
        if (state != null) {
            const subs = SUBS.get(this);
            subs.forEach(function(fn, name) {
                state.addEventListener(name, fn);
            });
        }
    }

    disconnectedCallback() {
        if (super.disconnectedCallback) {
            super.disconnectedCallback();
        }
        const state = STATE.get(this);
        if (state != null) {
            const subs = SUBS.get(this);
            subs.forEach(function(fn, name) {
                state.removeEventListener(name, fn);
            });
        }
    }

}
