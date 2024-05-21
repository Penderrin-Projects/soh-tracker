import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import Client from "/ArchipelagoJS/Client.js";
import {
    COMMON_TAGS
} from "/ArchipelagoJS/consts/CommonTags.js";
import {
    ITEMS_HANDLING_FLAGS
} from "/ArchipelagoJS/consts/ItemsHandlingFlags.js";
import {
    CONNECTION_STATUS
} from "/ArchipelagoJS/consts/ConnectionStatus.js";
import {
    SERVER_PACKET_TYPE
} from "/ArchipelagoJS/consts/CommandPacketType.js";
import {
    AP_STORAGES
} from "./storage/RegisterAPStorage.js";
import {
    translateItem,
    translateLocation
} from "./APNameTranslator.js";

const GAME_NAME = "Ocarina of Time";

const client = new Client();

let slotId = null;
let itemIndex = -1;
const statusInterval = null;

class ArchipelagoController {

    connect(apHostname, apPort, apSlotName, apPassword) {
        if (client.status === CONNECTION_STATUS.DISCONNECTED) {
            const connectionInfo = {
                hostname: apHostname,
                port: apPort,
                game: GAME_NAME,
                name: apSlotName,
                items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
                slot_data: true,
                tags: [COMMON_TAGS.TRACKER]
            };

            if (apPassword != null) {
                connectionInfo.password = apPassword;
            }

            client.addEventListener(SERVER_PACKET_TYPE.CONNECTED, this.#onConnectedEvent);
            client.addEventListener(SERVER_PACKET_TYPE.DISCONNECTED, this.#onDisonnectedEvent);
            client.addEventListener(SERVER_PACKET_TYPE.PRINT_JSON, this.#onPrintJSONEvent);
            client.addEventListener(SERVER_PACKET_TYPE.RECEIVED_ITEMS, this.#onRecievedItemsEvent);

            return client.connect(connectionInfo);
        }
        return Promise.reject("Already connected or in conencting state");
    }

    disconnect() {
        disconnectAP();
    }

    isConnected() {
        return client.status !== CONNECTION_STATUS.DISCONNECTED;
    }

    #onConnectedEvent(event) {
        const {data} = event;
        const [packet] = data;
        // console.log("Connected to server: ", packet);
        Dialog.alert("AP Connected", "You are now connected to AP");

        const {slot, checked_locations} = packet;
        slotId = slot;

        for (const location of checked_locations) {
            const apLocationName = client.locations.name(slotId, location);
            const locationName = translateLocation(apLocationName);
            // console.log("[AP] (Location) %s -> %s", apLocationName, locationName);
            AP_STORAGES.locations.set(locationName, true);
        }
    }

    #onDisonnectedEvent() {
        clearInterval(statusInterval);
        Dialog.alert("AP Disconnected", "The connection to Archipelago has been closed");
    }

    #onPrintJSONEvent(event) {
        for (const data of event.data) {
            const {type, item} = data;
            if (type == "ItemSend") {
                const {location, player} = item;
                if (player === slotId) {
                    const apLocationName = client.locations.name(slotId, location);
                    const locationName = translateLocation(apLocationName);
                    // console.log("[AP] (Location) %s -> %s", apLocationName, locationName);
                    AP_STORAGES.locations.set(locationName, true);
                }
            }
        }
    }

    #onRecievedItemsEvent(event) {
        const {data} = event;
        const [packet] = data;

        const {index, items} = packet;
        if (index > itemIndex) {
            const resultItems = {};
            for (const itemEntry of items) {
                itemIndex++;
                const {item} = itemEntry;
                const apItemName = client.items.name(slotId, item);
                const itemName = translateItem(apItemName);
                const value = index === 0 ? resultItems[itemName] ?? 0 : AP_STORAGES.items.get(itemName);
                resultItems[itemName] = value + 1;
                // console.log("[AP] (Item) %s -> %s", apItemName, itemName);
            }
            AP_STORAGES.items.setAll(resultItems);
        }
    }

}

window.addEventListener("beforeunload", disconnectAP);

function disconnectAP() {
    client.disconnect();
    AP_STORAGES.items.clear();
    AP_STORAGES.locations.clear();
    itemIndex = -1;
    slotId = null;
    clearInterval(statusInterval);
}

export default new ArchipelagoController();
