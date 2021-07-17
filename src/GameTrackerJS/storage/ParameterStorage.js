// frameworks
import EventBus from "/emcJS/event/EventBus.js";
import IDBProxyStorage from "/emcJS/storage/IDBProxyStorage.js";

class ParameterStorage extends IDBProxyStorage {

    constructor() {
        super("parameter");
        this.addEventListener("change", event => {
            setTimeout(() => {
                EventBus.trigger("parameter", event.data);
            }, 0);
        });
        EventBus.register("parameter", event => {
            this.setAll(event.data);
        });
    }

}

const storage = new ParameterStorage();
export default await storage.awaitLoaded();
