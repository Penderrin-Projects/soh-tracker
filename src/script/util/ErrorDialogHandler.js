import Dialog from "/emcJS/ui/overlay/window/Dialog.js";

const TITLE = new WeakMap();
const MESSAGE = new WeakMap();
const ERRORS = new WeakMap();

export default class ErrorDialogHandler {

    constructor(title, message) {
        TITLE.set(this, title);
        MESSAGE.set(this, message);
        ERRORS.set(this, new Set());
    }

    add(error) {
        const errors = ERRORS.get(this);
        errors.add(error);
    }

    async send() {
        const errors = ERRORS.get(this);
        if (errors.size) {
            const title = TITLE.get(this);
            const message = MESSAGE.get(this);
            await Dialog.error(title, message, Array.from(errors.values()));
            errors.clear();
        }
    }

}
