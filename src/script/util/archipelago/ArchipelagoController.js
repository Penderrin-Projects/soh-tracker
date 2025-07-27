import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import WorldResource from "/GameTrackerJS/data/resource/WorldResource.js";
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
import APHintLocations from "../../resource/APHintLocations.js";

const LOCALHOST_ALIASES = ["localhost", "127.0.0.1"];
const GAME_NAME = "Ocarina of Time";
const BOUNCE_PERIOD_TIME = 120; // seconds
const BOUNCE_TIMEOUT_TIME = 1; // seconds

// TODO dont exclude gossip stones
// TODO dont exclude shops
// TODO dont exclude skulltulas
const LOCATIONS = WorldResource.get("locations");
const LOCATION_NAMES = Object.keys(LOCATIONS).reduce((res, value) => {
    res.push(value);
    return res;
}, []);

const LOCATIONS_AP = APHintLocations.get();
const LOCATION_SET_AP = Object.keys(LOCATIONS_AP).reduce((res, value) => {
    res.push(value);
    return res;
}, []);

class ArchipelagoController extends EventTarget {

    #client = new Client();

    #slotId = null;

    #teamId = null;

    #itemIndex = -1;

    #connectionTimeout = null;

    #periodTimer = null;

    #syncSettings = false;

    #hintCostPercentage = 0;

    #totalLocations = 0;

    #currentHintPoints = 0;

    #neededHintPoints = 0;

    constructor() {
        super();
        /* --- */
        const currentPoints = Savestate.getMeta("AP_CurrentHintPoints") ?? 0;
        const neededPoints = Savestate.getMeta("AP_NeededHintPoints") ?? 0;
        this.#currentHintPoints = currentPoints;
        this.#neededHintPoints = neededPoints;
        /* --- */
        SavestateHandler.addEventListener("beforeload", () => {
            if (this.isConnected()) {
                this.disconnect();
            }
        });
        SavestateHandler.addEventListener("afterload", () => {
            const currentPoints = Savestate.getMeta("AP_CurrentHintPoints") ?? 0;
            const neededPoints = Savestate.getMeta("AP_NeededHintPoints") ?? 0;

            this.#currentHintPoints = currentPoints;
            this.#neededHintPoints = neededPoints;

            const hintcostEv = new Event("hintcost");
            this.dispatchEvent(hintcostEv);
            const hintpointsEv = new Event("hintpoints");
            this.dispatchEvent(hintpointsEv);
        });
    }

    get playerId() {
        return this.#slotId;
    }

    get teamId() {
        return this.#teamId;
    }

    get currentHintPoints() {
        return this.#currentHintPoints;
    }

    get neededHintPoints() {
        return this.#neededHintPoints;
    }

    connect(apHostname, apPort, apSlotName, apPassword, syncSettings = false) {
        if (this.#client.status === CONNECTION_STATUS.DISCONNECTED) {
            const isLocalhost = LOCALHOST_ALIASES.includes(apHostname);
            const connectionInfo = {
                protocol: isLocalhost ? "ws" : "wss",
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

            this.#client.addEventListener(SERVER_PACKET_TYPE.ROOM_INFO, (event) => {
                this.#onRoomInfoEvent(event);
            });
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
            this.#client.addEventListener(SERVER_PACKET_TYPE.SET_REPLY, (event) => {
                this.#onSetReply(event);
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

    #onRoomInfoEvent(event) {
        const {data} = event;
        const [packet] = data;
        const {hint_cost} = packet;

        if (hint_cost != null) {
            this.#hintCostPercentage = hint_cost;
            this.#neededHintPoints = this.#totalLocations / 100 * this.#hintCostPercentage;

            Savestate.setMeta("AP_NeededHintPoints", this.#neededHintPoints);
        }
    }

    #onConnectedEvent(event) {
        const {data} = event;
        const [packet] = data;
        const {slot, team, checked_locations, slot_data, hint_points, missing_locations} = packet;

        this.#slotId = slot;
        this.#teamId = team;
        Toast.success("You are now connected to Archipelago");
        this.#resetTimeout();

        const translatedCheckedLocations = this.#translateLocations(checked_locations);
        // const translatedMissingLocations = this.#translateLocations(missing_locations);

        if (this.#syncSettings) {
            if (slot_data != null) {
                const [savestate_data, errors] = translateAPSettings(slot_data);

                const excludedLocations = new Set(LOCATION_NAMES);

                // for (const name of Object.keys(translatedCheckedLocations)) {
                //     savestate_data.options[`excluded_location[${name}]`] = false;
                //     excludedLocations.delete(name);
                // }
                // for (const name of Object.keys(translatedMissingLocations)) {
                //     savestate_data.options[`excluded_location[${name}]`] = false;
                //     excludedLocations.delete(name);
                // }

                for (const name of LOCATION_SET_AP) {
                    savestate_data.options[`excluded_location[${name}]`] = false;
                    excludedLocations.delete(name);
                }

                for (const name of excludedLocations) {
                    savestate_data.options[`excluded_location[${name}]`] = true;
                }

                Savestate.overwrite(savestate_data);
                if (errors.length > 0) {
                    console.warn("errors converting data:", errors);
                }
            } else {
                Dialog.alert("No slot data found!", "Your game has not send any slot data.");
            }
        }

        Savestate.setMeta("archipelago", true);
        AP_STORAGES.locations.deserializeAsChange(translatedCheckedLocations);
        SavestateHandler.forceCache();

        this.#currentHintPoints = hint_points;
        this.#totalLocations = checked_locations.length + missing_locations.length;
        this.#neededHintPoints = Math.floor(this.#totalLocations / 100 * this.#hintCostPercentage);

        Savestate.setMeta("AP_CurrentHintPoints", this.#currentHintPoints);
        Savestate.setMeta("AP_NeededHintPoints", this.#neededHintPoints);

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
            const translatedItems = this.#translateItems(items);
            this.#itemIndex = translatedItems.length;

            AP_STORAGES.items.deserializeAsChange(translatedItems);
            SavestateHandler.forceCache();
        } else if (index > this.#itemIndex) {
            const translatedItems = this.#translateItems(items, AP_STORAGES.items.getAll());
            this.#itemIndex += translatedItems.length;

            AP_STORAGES.items.setAll(translatedItems);
        }
    }

    #onRoomUpdate(dataPacket) {
        const {data} = dataPacket;
        const [packet] = data;
        const {checked_locations, hint_points, hint_cost} = packet;

        if (checked_locations != null) {
            const translatedCheckedLocations = this.#translateLocations(checked_locations);

            AP_STORAGES.locations.setAll(translatedCheckedLocations);
            SavestateHandler.forceCache();
        }

        if (hint_points != null) {
            this.#currentHintPoints = hint_points;
            const ev = new Event("hintpoints");
            this.dispatchEvent(ev);

            Savestate.setMeta("AP_CurrentHintPoints", this.#currentHintPoints);
        }

        if (hint_cost != null) {
            this.#hintCostPercentage = hint_cost;
            this.#neededHintPoints = Math.floor(this.#totalLocations / 100 * this.#hintCostPercentage);
            const ev = new Event("hintcost");
            this.dispatchEvent(ev);

            Savestate.setMeta("AP_NeededHintPoints", this.#neededHintPoints);
        }
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

    #onSetReply(dataPacket) {
        const {data} = dataPacket;
        const [packet] = data;
        const hintKey = `_read_hints_${this.#teamId}_${this.#slotId}`;
        if (packet.key === hintKey) {
            const ev = new Event("hintupdate");
            ev.data = packet.value;
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

    #translateLocations(locationList = []) {
        const unknownLocations = [];
        const resLocations = {};
        for (const location of locationList) {
            const apLocationName = this.getLocationName(this.#slotId, location);
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

    #translateItems(itemList = [], initialItems = {}) {
        const unknownItems = [];
        const resultItems = {};
        for (const itemEntry of itemList) {
            const {item} = itemEntry;
            const apItemName = this.getItemName(this.#slotId, item);
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
