import Dialog from "/emcJS/ui/overlay/Dialog.js";
import Toast from "/emcJS/ui/overlay/Toast.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import RTCPeer from "/script/util/rtc/RTCPeer.js";

export default class RTCPeerClient extends RTCPeer {

    rtcMessageHandler(key, msg) {
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
            this.silent = true;
            SavestateHandler.reset(msg.data.data, msg.data.options);
            this.silent = false;
        } else {
            super.rtcMessageHandler(key, msg);
        }
    }

}
