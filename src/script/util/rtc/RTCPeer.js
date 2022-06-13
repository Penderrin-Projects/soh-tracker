// GameTrackerJS
import Counter from "/GameTrackerJS/util/Counter.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import OptionsStorage from "/GameTrackerJS/savestate/storage/OptionsStorage.js";
import "../registerStorages.js";

const STORAGES = {
    // GameTrackerJS
    items: Savestate.getStorage("items"),
    locations: Savestate.getStorage("locations"),
    exitBindings: Savestate.getStorage("exitBindings"),
    areaHints: Savestate.getStorage("areaHints"),
    locationItems: Savestate.getStorage("locationItems"),
    startItems: Savestate.getStorage("startItems"),
    options: Savestate.getStorage("options"),
    // Track-OOT
    dungeonRewards: Savestate.getStorage("dungeonRewards"),
    dungeonTypes: Savestate.getStorage("dungeonTypes"),
    shopItems: Savestate.getStorage("shopItems"),
    shopItemsPrice: Savestate.getStorage("shopItemsPrice"),
    shopItemsBought: Savestate.getStorage("shopItemsBought"),
    songNotes: Savestate.getStorage("songNotes"),
    gossipstoneLocations: Savestate.getStorage("gossipstoneLocations"),
    gossipstoneItems: Savestate.getStorage("gossipstoneItems")
};

const EVENT_MODULE = new WeakMap();
const RTC = new WeakMap();
const USERNAME = new WeakMap();
const MUTED = new WeakMap();

export default class RTCPeer extends EventTarget {

    constructor(rtcClient, username) {
        super();
        RTC.set(this, rtcClient);
        USERNAME.set(this, username);
        MUTED.set(this, new Counter());

        /* RTC */
        rtcClient.setMessageHandler("data", (key, msg) => {
            this.rtcMessageHandler(key, msg)
        });

        /* STORAGES */
        for (const [name, storage] of Object.entries(STORAGES)) {
            storage.addEventListener("change", (event) => {
                if (!this.isMuted()) {
                    rtcClient.send("data", {type: "event", category: name, data: event.data});
                }
            });
        }
    }

    getNetworkSafeState() {
        const data = Savestate.getAll(Object.keys(STORAGES));
        const options = OptionsStorage.getAll();
        return {data, options};
    }

    get username() {
        return USERNAME.get(this);
    }

    mute() {
        const muted = MUTED.get(this);
        muted.add();
    }

    unmute() {
        const muted = MUTED.get(this);
        muted.sub();
    }

    isMuted() {
        const muted = MUTED.get(this);
        return !!muted.value;
    }

    async disconnect() {
        const rtcClient = RTC.get(this);
        await rtcClient.disconnect();
        /* EVENTS */
        const eventModule = EVENT_MODULE.get(this);
        eventModule.clear();
    }

    async rtcMessageHandler(key, msg) {
        if (msg.type == "event") {
            this.mute();
            STORAGES[msg.category]?.setAll(msg.data);
            this.unmute();
        }
    }

}
