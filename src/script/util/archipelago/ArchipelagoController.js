import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
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
import {
    translateAPSettings
} from "./APSettingsTranslator.js";

const GAME_NAME = "Ocarina of Time";
const BOUNCE_PERIOD_TIME = 120; // seconds
const BOUNCE_TIMEOUT_TIME = 1; // seconds

class ArchipelagoController extends EventTarget {

    #client = new Client();

    #slotId = null;

    #teamId = null;

    #itemIndex = -1;

    #connectionTimeout = null;

    #periodTimer = null;

    #syncSettings = false;

    constructor() {
        super();
        SavestateHandler.addEventListener("beforeload", () => {
            if (this.isConnected()) {
                this.disconnect();
            }
        });
    }

    get playerId() {
        return this.#slotId;
    }

    get teamId() {
        return this.#teamId;
    }

    connect(apHostname, apPort, apSlotName, apPassword, syncSettings = false) {
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

            this.#syncSettings = syncSettings;

            this.#client.addEventListener(SERVER_PACKET_TYPE.CONNECTED, (event) => {
                this.#onConnectedEvent(event);
            });
            this.#client.addEventListener(SERVER_PACKET_TYPE.PRINT_JSON, (event) => {
                this.#onChatMessage(event);
            });
            this.#client.addEventListener(SERVER_PACKET_TYPE.RECEIVED_ITEMS, (event) => {
                this.#onRecievedItemsEvent(event);
            });
            this.#client.addEventListener(SERVER_PACKET_TYPE.ROOM_UPDATE, (event) => {
                this.#onRoomUpdate(event);
            });
            this.#client.addEventListener(SERVER_PACKET_TYPE.RETRIEVED, (event) => {
                this.#onRetrieved(event);
            });
            this.#client.addEventListener("SocketDisconnected", () => {
                this.#onDisonnectedEvent();
            });
            this.#client.addEventListener("SocketClosed", () => {
                this.#onClosedEvent();
            });
            this.#client.addEventListener("PacketReceived", (event) => {
                console.log("[AP] (PacketReceived)", event);
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
        const {slot, team, checked_locations, slot_data} = packet;

        if (this.#syncSettings) {
            if (slot_data != null) {
                const [options, errors] = translateAPSettings(slot_data);
                Savestate.overwrite(options);
                if (errors.length > 0) {
                    console.warn("errors converting data:", errors);
                }
            } else {
                Dialog.alert("No slot data found!", "Your game has not send any slot data.");
            }
        }

        this.#slotId = slot;
        this.#teamId = team;
        Toast.success("You are now connected to Archipelago");
        this.#resetTimeout();

        const translatedLocations = this.#collectLocations(checked_locations);

        AP_STORAGES.locations.deserializeAsChange(translatedLocations);
        SavestateHandler.forceCache();

        const ev = new Event("connected");
        this.dispatchEvent(ev);
    }

    #onDisonnectedEvent() {
        clearTimeout(this.#connectionTimeout);
        clearTimeout(this.#periodTimer);
        Dialog.alert("AP Connection Lost", "The connection to Archipelago has been lost");

        const ev = new Event("disconnected");
        this.dispatchEvent(ev);
    }

    #onClosedEvent() {
        clearTimeout(this.#connectionTimeout);
        clearTimeout(this.#periodTimer);
        Toast.warn("You are no longer connected to Archipelago");

        const ev = new Event("disconnected");
        this.dispatchEvent(ev);
    }

    #onRecievedItemsEvent(dataPacket) {
        const {data} = dataPacket;
        const [packet] = data;
        const {index, items} = packet;

        if (index === 0) {
            const collectedItems = this.#collectItems(items);
            this.#itemIndex = collectedItems.length;

            AP_STORAGES.items.deserializeAsChange(collectedItems);
            SavestateHandler.forceCache();
        } else if (index > this.#itemIndex) {
            const collectedItems = this.#collectItems(items, AP_STORAGES.items.getAll());
            this.#itemIndex += collectedItems.length;

            AP_STORAGES.items.setAll(collectedItems);
        }
    }

    #onRoomUpdate(dataPacket) {
        const {data} = dataPacket;
        const [packet] = data;
        const {checked_locations} = packet;

        const collectedLocations = this.#collectLocations(checked_locations);

        AP_STORAGES.locations.setAll(collectedLocations);
        SavestateHandler.forceCache();
    }

    #onRetrieved(dataPacket) {
        const {data} = dataPacket;
        const [packet] = data;
        const hintKey = `_read_hints_${this.#teamId}_${this.#slotId}`;
        if (hintKey in packet.keys) {
            const ev = new Event("hintupdate");
            ev.data = packet.keys[hintKey];
            this.dispatchEvent(ev);
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

    #collectLocations(locationList = []) {
        const unknownLocations = [];
        const resLocations = {};
        for (const location of locationList) {
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
        if (unknownLocations.length) {
            Dialog.error("Unknown AP Locations", "Some locations could not be translated", unknownLocations);
        }
        return resLocations;
    }

    #collectItems(itemList = [], initialItems = {}) {
        const unknownItems = [];
        const resultItems = {};
        for (const itemEntry of itemList) {
            const {item} = itemEntry;
            const apItemName = this.#client.items.name(this.#slotId, item);
            const itemTranslation = translateItem(apItemName);
            // console.log("[AP] (Item) %s -> %s", apItemName, itemTranslation);
            if (itemTranslation != null) {
                if (itemTranslation !== false) {
                    if (typeof itemTranslation === "string") {
                        const value = initialItems[itemTranslation] ?? resultItems[itemTranslation] ?? 0;
                        resultItems[itemTranslation] = value + 1;
                    } else {
                        const {ref, amount} = itemTranslation;
                        if (typeof ref === "string") {
                            const value = initialItems[ref] ?? resultItems[ref] ?? 0;
                            resultItems[ref] = value + amount;
                        }
                    }
                }
            } else {
                unknownItems.push(apItemName);
            }
        }
        if (unknownItems.length) {
            Dialog.error("Unknown AP Items", "Some items could not be translated", unknownItems);
        }
        return resultItems;
    }

    #onChatMessage(event) {
        const {data} = event;
        const [packet, message] = data;
        const ev = new Event("message");
        ev.message = message;
        ev.data = {
            ...packet
        };
        this.dispatchEvent(ev);
    }

    sendChatMessage(message) {
        this.#client.say(message);
    }

    getPlayerAlias(playerId) {
        return this.#client.players.alias(playerId);
    }

    getPlayerGame(playerId) {
        return this.#client.players.game(playerId);
    }

    getLocationName(playerId, locationId) {
        return this.#client.locations.name(playerId, locationId);
    }

    getItemName(playerId, itemId) {
        return this.#client.items.name(playerId, itemId);
    }

}

export default new ArchipelagoController();
