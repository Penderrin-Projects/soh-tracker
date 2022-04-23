// frameworks
import EventBus from "/emcJS/event/EventBus.js";
import EventBusModuleGeneric from "/emcJS/event/module/EventBusModuleGeneric.js";

const EVENT_MODULE = new WeakMap();
const RTC = new WeakMap();
const USERNAME = new WeakMap();
const MUTED = new WeakMap();

export default class RTCPeer extends EventTarget {

    constructor(rtcClient, username) {
        super();
        RTC.set(this, rtcClient);
        USERNAME.set(this, username);
        MUTED.set(this, 0);

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
                "options"
            ]
        });
        eventModule.register(event => {
            if (!this.isMuted()) {
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

    mute() {
        const muted = MUTED.get(this);
        if (muted > 0) {
            MUTED.set(this, muted + 1);
        } else {
            MUTED.set(this, 1);
        }
    }

    unmute() {
        const muted = MUTED.get(this);
        if (muted > 1) {
            MUTED.set(this, muted - 1);
        } else {
            MUTED.set(this, 0);
        }
    }

    isMuted() {
        return !!MUTED.get(this);
    }

    async disconnect() {
        const rtcClient = RTC.get(this);
        await rtcClient.disconnect();
        /* EVENTS */
        const eventModule = EVENT_MODULE.get(this);
        eventModule.clear();
        EventBus.removeModule(eventModule);
    }

    async rtcMessageHandler(key, msg) {
        if (msg.type == "event") {
            const eventModule = EVENT_MODULE.get(this);
            if (EventBus.checkLists(eventModule, msg.data.name)) {
                this.mute();
                eventModule.trigger(msg.data.name, msg.data.data);
                this.unmute();
                return true;
            }
            return false;
        }
    }

}
