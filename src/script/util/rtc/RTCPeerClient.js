import Dialog from "/emcJS/ui/overlay/Dialog.js";
import Toast from "/emcJS/ui/overlay/Toast.js";
import StateStorage from "/script/storage/StateStorage.js";
import RTCPeer from "/script/util/rtc/RTCPeer.js";

function setState(data) {
    const buffer = {};
    for (const i in data.extra) {
        if (!i.endsWith("Names")) {
            buffer[i] =  data.extra[i];
        }
    }
    StateStorage.reset(data.state, buffer);
}

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
            setState(msg.data);
            this.silent = false;
        } else {
            super.rtcMessageHandler(key, msg);
        }
    }

}
