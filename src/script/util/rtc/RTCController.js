/* asym-import: off */
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import EventTargetManager from "/emcJS/event/EventTargetManager.js";
import RTCClient from "/rtc/RTCClient.js";
/* asym-import: on */

// Track-OOT
import RTCPeerHost from "/script/util/rtc/RTCPeerHost.js";
import RTCPeerClient from "/script/util/rtc/RTCPeerClient.js";

// TODO create listentry editor for using custom stun/turn server config

const CONFIG = {
    iceTransportPolicy: "all", // all | relay
    iceServers: [{
        urls: "stun:stun.zidargs.net:18001"
    }, {
        urls: "stun:stun.l.google.com:19302"
    }, {
        urls: "turn:turn.zidargs.net:18001",
        credential: "fHNsIeqdgVcUAypvaxDVE6tywaMlP1fA",
        username: "iamgroot"
    }]
};

async function promtName(name) {
    name = await Dialog.prompt("Please select a username", "Please enter a name (at least 3 characters).", name);
    if (typeof name != "string") {
        return false;
    }
    if (name.length < 3) {
        await Dialog.alert("Invalid username", "Username can not be less then 3 characters.");
        return await promtName();
    }
    return name;
}

async function promptPeerName(name) {
    name = await promtName(name);
    if (!name) {
        return false;
    }
    rtcClient.send("data", {
        type: "name",
        data: name
    });
    return true;
}

const rtcClient = new RTCClient(window.location.hostname == "localhost" ? 8001 : "", CONFIG, ["data"]);
const rtcClientEventManager = new EventTargetManager(rtcClient);
const rtcPeerEventManager = new EventTargetManager();
let rtcPeer = null;

class RTCController extends EventTarget {

    constructor() {
        super();
        rtcPeerEventManager.set("roomupdate", event => {
            const ev = new Event("roomupdate");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
    }

    setLogger(value) {
        RTCClient.setLogger(value);
    }
    
    async getInstances(supressError) {
        const res = await rtcClient.getInstances();
        if (res == null || !res.success) {
            if (!supressError) {
                await Dialog.alert("Connection error", "There seems to be an connection issue trying to refresh the instance list.\nPlease try again later.");
            }
            if (res.error != null) {
                console.error(res.error);
            }
            return [];
        }
        return res.data;
    }

    getPeer() {
        return rtcPeer;
    }

    async host(name, pass, desc, version, data) {
        if (name) {
            const res = await rtcClient.register(name, pass, desc, version, data);
            if (res.success === true) {
                const username = await promtName(name);
                if (!username) {
                    await Dialog.alert("Aborted Lobby creation", "Lobby will be closed now.");
                    await this.close();
                } else {
                    rtcPeer = new RTCPeerHost(rtcClient, username, version);
                    rtcPeerEventManager.switchTarget(rtcPeer);
                    /* roomupdate */
                    const ev = new Event("roomupdate");
                    ev.data = rtcPeer.getUserList();
                    this.dispatchEvent(ev);
                    return true;
                }
            } else {
                await Dialog.alert("Error registering to Lobby", "An error occured while registering your room to the lobby.\nCheck if the room already exists and try again!");
                return false;
            }
        } else {
            await Dialog.alert("Error registering to Lobby", "Can not register a room without a name.");
            return false;
        }
    }

    join(name, pass, version) {
        return new Promise(function(resolve) {
            rtcClientEventManager.set(["closed", "failed"], async () => {
                await Dialog.alert("Connection failed", "Something went wrong connecting to the host.\nPlease try again later!");
                rtcClientEventManager.clear();
                resolve(false);
            });
            rtcClient.connect(name, pass, version).then(async res => {
                if (res.success === true) {
                    rtcClient.setMessageHandler("data", async function(key, msg) {
                        if (msg.type == "name") {
                            if (msg.data.success) {
                                rtcClientEventManager.clear();
                                rtcPeer = new RTCPeerClient(rtcClient, msg.data.name);
                                rtcPeerEventManager.switchTarget(rtcPeer);
                                resolve(true);
                            } else {
                                await Dialog.alert("Username taken", `The username "${msg.data.name}" is already taken.\nPlease choose another one!`);
                                if (!await promptPeerName(msg.data.name)) {
                                    rtcClientEventManager.clear();
                                    resolve(false);
                                }
                            }
                        }
                    });
                    rtcClientEventManager.set("connected", async (key) => {
                        if (!await promptPeerName("")) {
                            rtcClientEventManager.clear();
                            resolve(false);
                        }
                    });
                } else {
                    await Dialog.alert("Connection refused", res.error);
                    rtcClientEventManager.clear();
                    resolve(false);
                }
            });
        });
    }

}

export default new RTCController;
