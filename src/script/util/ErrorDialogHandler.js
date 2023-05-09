import Dialog from "/emcJS/ui/overlay/window/Dialog.js";

export default class ErrorDialogHandler {

    #title;

    #message;

    #errors = new Map();

    constructor(title, message) {
        this.#title = title;
        this.#message = message;
    }

    addError(error, category = "") {
        const errors = this.#getErrorCategory(category);
        errors.add(error);
    }

    clearErrors() {
        this.#errors.clear();
    }

    #getErrorCategory(category) {
        if (this.#errors.has(category)) {
            return this.#errors.get(category);
        }
        const errors = new Set();
        this.#errors.set(category, errors);
        return errors;
    }

    #collectErrors() {
        const res = [];
        if (this.#errors.has("")) {
            const errorSet = this.#errors.get("");
            const errors = Array.from(errorSet);
            res.push(...errors.sort(), "");
        }
        for (const [category, errorSet] of this.#errors) {
            if (category === "") {
                continue;
            }
            const errors = Array.from(errorSet);
            res.push(`[${category}]`, ...errors.sort(), "");
        }
        return res;
    }

    async send() {
        const errors = this.#collectErrors();
        if (errors.size) {
            const title = this.#title;
            const message = this.#message;
            await Dialog.error(title, message, errors);
            errors.clear();
        }
    }

}
