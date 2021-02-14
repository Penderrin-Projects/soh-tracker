/* asym-import: off */
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import Toast from "/emcJS/ui/overlay/Toast.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
/* asym-import: on */

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
// Track-OOT
import RTCPeer from "/script/util/rtc/RTCPeer.js";

const EVENT_TARGET_MANAGER = new WeakMap();

export default class RTCPeerClient extends RTCPeer {

    constructor(rtcClient, username, version) {
        super(rtcClient, username, version);
        
        /* RTC */
        const eventTargetManager = new EventTargetManager(rtcClient);
        EVENT_TARGET_MANAGER.set(this, eventTargetManager);
        eventTargetManager.set(["closed", "failed"], async (key) => {
            await Dialog.alert("Disconnected from host", "The connection to the host closed unexpectedly.");
        });
    }

    async disconnect() {
        await super.disconnect();
        /* EVENTS */
        const eventTargetManager = EVENT_TARGET_MANAGER.get(this);
        eventTargetManager.clear();
    }

    async rtcMessageHandler(key, msg) {
        if (msg.type == "join") {
            Toast.show(`Multiplayer: "${msg.data}" joined`);
        } else if (msg.type == "leave") {
            Toast.show(`Multiplayer: "${msg.data}" left`);
        } else if (msg.type == "kick") {
            Dialog.alert("You have been kicked", `You have been kicked by the host: ${msg.data ? msg.data : "no reason provided"}.`);
        } else if (msg.type == "room") {
            /* roomupdate event */
            const ev = new Event("roomupdate");
            ev.data = msg.data;
            this.dispatchEvent(ev);
        } else if (msg.type == "state") {
            this.mute();
            await SavestateHandler.reset(msg.data.data, msg.data.options);
            this.unmute();
        } else {
            await super.rtcMessageHandler(key, msg);
        }
    }

}
