import EventBus from "/emcJS/event/EventBus.js";
import EventBusModuleGeneric from "/emcJS/event/module/EventBusModuleGeneric.js";

const EVENT_MODULE = new WeakMap();
const RTC = new WeakMap();
const USERNAME = new WeakMap();
const SILENT = new WeakMap();

export default class RTCPeer extends EventTarget {

    constructor(rtcClient, username) {
        super();
        RTC.set(this, rtcClient);
        USERNAME.set(this, username);
        SILENT.set(this, false);

        /* RTC */
        rtcClient.setMessageHandler("data", (key, msg) => {
            this.rtcMessageHandler(key, msg)
        });

        /* EVENTS */
        const eventModule = new EventBusModuleGeneric();
        EventBus.addModule(eventModule, {
            blacklist: [
                "extra::shop_name"
            ],
            whitelist: [
                /^state::[a-zA-Z0-9_]+$/,
                "randomizer_options"
            ]
        });
        eventModule.register(event => {
            if (!this.silent) {
                rtcClient.send("data", {
                    type: "event",
                    data: event
                });
            }
        });
        EVENT_MODULE.set(this, eventModule);
    }

    get username() {
        return USERNAME.get(this);
    }

    set silent(value) {
        SILENT.set(this, !!value);
    }

    get silent() {
        return SILENT.get(this);
    }

    async disconnect() {
        const rtcClient = RTC.get(this);
        await rtcClient.disconnect();
        /* EVENTS */
        const eventModule = EVENT_MODULE.get(this);
        eventModule.clear();
        EventBus.removeModule(eventModule);
    }

    rtcMessageHandler(key, msg) {
        if (msg.type == "event") {
            const eventModule = EVENT_MODULE.get(this);
            if (EventBus.checkLists(eventModule, msg.data.name)) {
                this.silent = true;
                eventModule.trigger(msg.data.name, msg.data.data);
                this.silent = false;
                return true;
            }
            return false;
        }
    }

}
