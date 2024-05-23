import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
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
    CLIENT_PACKET_TYPE,
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
const BOUNCE_PERIOD_TIME = 120; // seconds
const BOUNCE_TIMEOUT_TIME = 1; // seconds

class ArchipelagoController {

    #client = new Client();

    #slotId = null;

    #itemIndex = -1;

    #connectionTimeout = null;

    #periodTimer = null;

    connect(apHostname, apPort, apSlotName, apPassword) {
        if (this.#client.status === CONNECTION_STATUS.DISCONNECTED) {
            const connectionInfo = {
                hostname: apHostname,
                port: apPort,
                game: GAME_NAME,
                name: apSlotName,
                password: apPassword,
                items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
                slot_data: true,
                tags: [COMMON_TAGS.TRACKER]
            };

            this.#client.addEventListener(SERVER_PACKET_TYPE.CONNECTED, (event) => {
                this.#onConnectedEvent(event);
            });
            this.#client.addEventListener(SERVER_PACKET_TYPE.PRINT_JSON, (event) => {
                this.#onPrintJSONEvent(event);
            });
            this.#client.addEventListener(SERVER_PACKET_TYPE.RECEIVED_ITEMS, (event) => {
                this.#onRecievedItemsEvent(event);
            });
            this.#client.addEventListener("SocketDisconnected", () => {
                this.#onDisonnectedEvent();
            });
            this.#client.addEventListener("SocketClosed", () => {
                this.#onClosedEvent();
            });
            this.#client.addEventListener("PacketReceived", () => {
                this.#resetTimeout();
            });

            return this.#client.connect(connectionInfo);
        }
        return Promise.reject("Already connected or in conencting state");
    }

    disconnect() {
        this.#client.disconnect();
        this.#itemIndex = -1;
        this.#slotId = null;
    }

    isConnected() {
        return this.#client.status !== CONNECTION_STATUS.DISCONNECTED;
    }

    #onConnectedEvent(event) {
        const {data} = event;
        const [packet] = data;
        // console.log("Connected to server: ", packet);
        Toast.success("You are now connected to Archipelago");
        this.#resetTimeout();

        const {slot, checked_locations} = packet;
        this.#slotId = slot;

        const unknownLocations = [];
        const resLocations = {};
        for (const location of checked_locations) {
            const apLocationName = this.#client.locations.name(this.#slotId, location);
            const locationTranslation = translateLocation(apLocationName);
            // console.log("[AP] (Location) %s -> %s", apLocationName, locationTranslation);
            if (locationTranslation != null) {
                if (locationTranslation !== false) {
                    if (typeof locationTranslation === "string") {
                        resLocations[locationTranslation] = true;
                    } else {
                        for (const locationName of locationTranslation) {
                            if (typeof locationName === "string") {
                                resLocations[locationName] = true;
                            }
                        }
                    }
                }
            } else {
                unknownLocations.push(location);
            }
        }
        AP_STORAGES.locations.deserialize(resLocations);
        SavestateHandler.forceCache();
        if (unknownLocations.length) {
            Dialog.error("Unknown AP Locations", "Some locations could not be translated", unknownLocations);
        }
    }

    #onDisonnectedEvent() {
        clearTimeout(this.#connectionTimeout);
        clearTimeout(this.#periodTimer);
        Dialog.alert("AP Connection Lost", "The connection to Archipelago has been lost");
    }

    #onClosedEvent() {
        clearTimeout(this.#connectionTimeout);
        clearTimeout(this.#periodTimer);
        Toast.warn("You are no longer connected to Archipelago");
    }

    #onPrintJSONEvent(event) {
        for (const data of event.data) {
            const {type, item} = data;
            if (type == "ItemSend") {
                const {location, player} = item;
                if (player === this.#slotId) {
                    const apLocationName = this.#client.locations.name(this.#slotId, location);
                    const locationTranslation = translateLocation(apLocationName);
                    // console.log("[AP] (Location) %s -> %s", apLocationName, locationTranlation);
                    if (locationTranslation != null) {
                        if (locationTranslation !== false) {
                            if (typeof locationTranslation === "string") {
                                AP_STORAGES.locations.set(locationTranslation, true);
                            } else {
                                for (const locationName of locationTranslation) {
                                    if (typeof locationName === "string") {
                                        AP_STORAGES.locations.set(locationName, true);
                                    }
                                }
                            }
                        }
                    } else {
                        Dialog.error("Unknown AP Locations", "Some locations could not be translated", [location]);
                    }
                }
            }
        }
    }

    #onRecievedItemsEvent(event) {
        const {data} = event;
        const [packet] = data;

        const {index, items} = packet;
        if (index > this.#itemIndex) {
            const unknownItems = [];
            const resultItems = {};
            for (const itemEntry of items) {
                this.#itemIndex++;
                const {item} = itemEntry;
                const apItemName = this.#client.items.name(this.#slotId, item);
                const itemTranslation = translateItem(apItemName);
                // console.log("[AP] (Item) %s -> %s", apItemName, itemTranslation);
                if (itemTranslation != null) {
                    if (itemTranslation !== false) {
                        if (typeof itemTranslation === "string") {
                            const value = index === 0 ? resultItems[itemTranslation] ?? 0 : AP_STORAGES.items.get(itemTranslation);
                            resultItems[itemTranslation] = value + 1;
                        } else {
                            const {ref, amount} = itemTranslation;
                            if (typeof ref === "string") {
                                const value = index === 0 ? resultItems[ref] ?? 0 : AP_STORAGES.items.get(ref);
                                resultItems[ref] = value + amount;
                            }
                        }
                    }
                } else {
                    unknownItems.push(apItemName);
                }
            }
            if (index === 0) {
                AP_STORAGES.items.deserialize(resultItems);
                SavestateHandler.forceCache();
            } else {
                AP_STORAGES.items.setAll(resultItems);
            }
            if (unknownItems.length) {
                Dialog.error("Unknown AP Items", "Some items could not be translated", unknownItems);
            }
        }
    }

    #resetTimeout() {
        clearTimeout(this.#connectionTimeout);
        clearTimeout(this.#periodTimer);
        this.#periodTimer = setTimeout(() => {
            this.#client.send({cmd: CLIENT_PACKET_TYPE.BOUNCE, slots: [this.#slotId]});
            this.#connectionTimeout = setTimeout(() => {
                this.#client.purgeConnection();
                this.#itemIndex = -1;
                this.#slotId = null;
            }, BOUNCE_TIMEOUT_TIME * 1000);
        }, BOUNCE_PERIOD_TIME * 1000);
    }

}

export default new ArchipelagoController();
