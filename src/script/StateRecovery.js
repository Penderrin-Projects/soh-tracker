function cursorToPromise(cursor, fn) {
    return new Promise(function(resolve, reject) {
        const res = {};
        cursor.onsuccess = function(e) {
            const el = e.target.result;
            if (el) {
                if (fn(el.key, el.value)) {
                    res[el.key] = el.value;
                }
                el.continue();
            } else {
                resolve(res);
            }
        };
        cursor.onerror = function(e) {
            reject(e);
        }
    }.bind(this));
}

class StateRecoveryModule {

    #dl = null;

    constructor() {
        this.#dl = document.createElement("a");
        this.#dl.style.position = "absolute !important";
        this.#dl.style.display = "none !important";
        this.#dl.style.opacity = "0 !important";
        this.#dl.style.visibility = "hidden !important";
    }

    static #openDB(name) {
        return new Promise(function(resolve, reject) {
            const request = indexedDB.open(name);
            request.onupgradeneeded = function(event) {
                const db = request.result;
                if (!db.objectStoreNames.contains("data")) {
                    db.createObjectStore("data");
                }
            };
            request.onsuccess = function() {
                resolve(request.result);
            };
            request.onerror = function(e) {
                reject(e);
            }
        });
    }

    async #getStoreReadonly(name) {
        const iDBinst = await StateRecoveryModule.#openDB(name);
        return iDBinst.transaction("data", "readonly").objectStore("data");
    }

    async #getAll(name, filter) {
        if (typeof filter != "string") {
            filter = "";
        }
        const transaction = await this.#getStoreReadonly(name);
        const request = transaction.openCursor();
        const result = await cursorToPromise(request, (key) => key.startsWith(filter));
        return result;
    }

    #save(data, fileName) {
        const url = window.URL.createObjectURL(new Blob([data], {type: "octet/stream"}));
        this.#dl.href = url;
        this.#dl.download = fileName;
        document.body.append(this.#dl);
        this.#dl.click();
        window.URL.revokeObjectURL(url);
        this.#dl.remove();
    }

    async downloadStates(name, filter) {
        const files = await this.#getAll(name, filter);
        for (const key in files) {
            const file = files[key];
            this.#save(JSON.stringify(file), `${key}.json`);
        }
    }

}

const StateRecovery = new StateRecoveryModule();
window.StateRecovery = StateRecovery;

export default StateRecovery;
