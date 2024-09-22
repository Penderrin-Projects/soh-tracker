import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import {
    VALID_JSON_MESSAGE_TYPE
} from "/ArchipelagoJS/types/JSONMessagePart.js";
import {
    ITEM_FLAGS
} from "/ArchipelagoJS/consts/ItemFlags.js";
import {
    PRINT_JSON_TYPE
} from "/ArchipelagoJS/consts/PrintJSONType.js";
import ArchipelagoController from "../../../util/archipelago/ArchipelagoController.js";
import "/emcJS/ui/dataview/datagrid/DataGrid.js";
import "/emcJS/ui/form/element/input/string/StringInput.js";
import "/emcJS/ui/form/element/select/token/TokenSelect.js";
import "./chat/ChatList.js";
import TPL from "./APTextClient.js.html" assert {type: "html"};
import STYLE from "./APTextClient.js.css" assert {type: "css"};

const ITEM_CLASSES = {
    [ITEM_FLAGS.PROGRESSION]: "progressive",
    [ITEM_FLAGS.NEVER_EXCLUDE]: "useful",
    [ITEM_FLAGS.FILLER]: "normal",
    [ITEM_FLAGS.TRAP]: "trap"
};

const DEBUG_MESSAGES = [
    {
        "type": "ServerChat",
        "message": "SERVER DEBUG MESSAGE"
    },
    {
        "type": "Chat",
        "playerAlias": "ZidArgs_OOT",
        "message": "CLIENT DEBUG MESSAGE"
    },
    {
        "type": "ItemSend",
        "isSender": true,
        "isReciever": false,
        "sender": "ZidArgs_OOT",
        "reciever": "fraggerEmerald",
        "itemClass": "normal",
        "itemName": "Glitter Mail",
        "locationName": "Kak GS House Under Construction",
        "message": [
            {
                "type": "player_id",
                "current": true,
                "playerAlias": "ZidArgs_OOT"
            },
            {
                "text": " sent "
            },
            {
                "type": "item_id",
                "itemName": "Glitter Mail",
                "itemClass": "normal"
            },
            {
                "text": " to "
            },
            {
                "type": "player_id",
                "current": false,
                "playerAlias": "fraggerEmerald",
                "playerGame": "Pokemon Emerald"
            },
            {
                "text": " ("
            },
            {
                "type": "location_id",
                "locationName": "Kak GS House Under Construction"
            },
            {
                "text": ")"
            }
        ]
    },
    {
        "type": "ItemSend",
        "isSender": true,
        "isReciever": false,
        "sender": "ZidArgs_OOT",
        "reciever": "ZidArgs_DLC",
        "itemClass": "useful",
        "itemName": "Live Freemium or Die: Coin Bundle",
        "locationName": "Kak GS Tree",
        "message": [
            {
                "type": "player_id",
                "current": true,
                "playerAlias": "ZidArgs_OOT"
            },
            {
                "text": " sent "
            },
            {
                "type": "item_id",
                "itemName": "Live Freemium or Die: Coin Bundle",
                "itemClass": "useful"
            },
            {
                "text": " to "
            },
            {
                "type": "player_id",
                "current": false,
                "playerAlias": "ZidArgs_DLC",
                "playerGame": "DLCQuest"
            },
            {
                "text": " ("
            },
            {
                "type": "location_id",
                "locationName": "Kak GS Tree"
            },
            {
                "text": ")"
            }
        ]
    },
    {
        "type": "ItemSend",
        "isSender": true,
        "isReciever": false,
        "sender": "ZidArgs_OOT",
        "reciever": "fraggerTBOI",
        "itemClass": "progressive",
        "itemName": "Shop Item",
        "locationName": "Kak GS Near Gate Guard",
        "message": [
            {
                "type": "player_id",
                "current": true,
                "playerAlias": "ZidArgs_OOT"
            },
            {
                "text": " sent "
            },
            {
                "type": "item_id",
                "itemName": "Shop Item",
                "itemClass": "progressive"
            },
            {
                "text": " to "
            },
            {
                "type": "player_id",
                "current": false,
                "playerAlias": "fraggerTBOI",
                "playerGame": "The Binding of Isaac Repentance"
            },
            {
                "text": " ("
            },
            {
                "type": "location_id",
                "locationName": "Kak GS Near Gate Guard"
            },
            {
                "text": ")"
            }
        ]
    },
    {
        "type": "ItemSend",
        "isSender": true,
        "isReciever": true,
        "sender": "ZidArgs_OOT",
        "reciever": "ZidArgs_OOT",
        "itemClass": "trap",
        "itemName": "Ice Trap",
        "locationName": "Forest Temple Center Room Right Pot 1",
        "message": [
            {
                "type": "player_id",
                "current": true,
                "playerAlias": "ZidArgs_OOT"
            },
            {
                "text": " found their "
            },
            {
                "type": "item_id",
                "itemName": "Ice Trap",
                "itemClass": "trap"
            },
            {
                "text": " ("
            },
            {
                "type": "location_id",
                "locationName": "Forest Temple Center Room Right Pot 1"
            },
            {
                "text": ")"
            }
        ]
    }
];

const DEBUG_HINTS = [
    {
        "key": "19_16777238",
        "isSender": false,
        "isReciever": true,
        "finder": "fraggerHK",
        "reciever": "ZidArgs_OOT",
        "location": "Sly_(Key)_7",
        "item": "Piece of Heart",
        "itemClass": "useful",
        "entrance": "",
        "found": true
    },
    {
        "key": "3_16777945",
        "isSender": false,
        "isReciever": true,
        "finder": "CylerHK",
        "reciever": "ZidArgs_OOT",
        "location": "Lore_Tablet-Fungal_Core",
        "item": "Piece of Heart",
        "itemClass": "useful",
        "entrance": "",
        "found": false
    },
    {
        "key": "39_2000301010",
        "isSender": false,
        "isReciever": true,
        "finder": "Klappi hat r",
        "reciever": "ZidArgs_OOT",
        "location": "Badge Seller - Item 8",
        "item": "Gold Skulltula Token",
        "itemClass": "progressive",
        "entrance": "",
        "found": true
    },
    {
        "key": "65_67801",
        "isSender": false,
        "isReciever": true,
        "finder": "ZidArgs_OOT_TH2",
        "reciever": "ZidArgs_OOT",
        "location": "HF Southeast Grotto Beehive 1",
        "item": "Progressive Strength Upgrade",
        "itemClass": "progressive",
        "entrance": "Graveyard -> Graveyard Shield Grave",
        "found": false
    },
    {
        "key": "66_67801",
        "isSender": true,
        "isReciever": true,
        "finder": "ZidArgs_OOT",
        "reciever": "ZidArgs_OOT",
        "location": "HF Southeast Grotto Beehive 1",
        "item": "Test",
        "itemClass": "trap",
        "entrance": "",
        "found": false
    }
];

// TODO
// text client with filter options (command list cache)
// show hints as sortable filterable grid
// add hint item function through clicking the desired icons (generate text user needs to send)
// add hint location function through clicking the desired locations (generate text user needs to send)

class APTextClient extends Panel {

    #apTabsEl;

    #chatInputEl;

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#apTabsEl = this.shadowRoot.getElementById("ap-tabs");
        this.#chatInputEl = this.shadowRoot.getElementById("chat-input");
        /* --- */
        const apLogListEl = this.shadowRoot.getElementById("ap-log");
        const apLogSearchEl = this.shadowRoot.getElementById("ap-log-search");
        const apLogItemClassEl = this.shadowRoot.getElementById("ap-log-itemclass");
        const apLogDirectionEl = this.shadowRoot.getElementById("ap-log-direction");
        const apLogListDataProvider = new SimpleDataProvider(apLogListEl, DEBUG_MESSAGES);
        ArchipelagoController.addEventListener("message", (event) => {
            const {data} = event;
            const resolvedMessage = this.#resolveMessagegParts(data);
            apLogListDataProvider.addEntry(resolvedMessage);
        });
        apLogSearchEl.addEventListener("change", () => {
            apLogListDataProvider.updateOptions({search: apLogSearchEl.value});
        });
        apLogItemClassEl.addEventListener("change", () => {
            const {filter} = apLogListDataProvider.getOptions();
            filter.itemClass = apLogItemClassEl.value;
            apLogListDataProvider.updateOptions({filter});
        });
        apLogDirectionEl.addEventListener("change", () => {
            const {filter} = apLogListDataProvider.getOptions();
            const value = apLogDirectionEl.value;
            if (value.includes("sender")) {
                if (value.includes("reciever")) {
                    filter.isSender = null;
                    filter.isReciever = null;
                } else {
                    filter.isSender = true;
                    filter.isReciever = null;
                }
            } else if (value.includes("reciever")) {
                filter.isSender = null;
                filter.isReciever = true;
            } else {
                filter.isSender = false;
                filter.isReciever = false;
            }
            apLogListDataProvider.updateOptions({filter});
        });
        /* --- */
        const apHintGridEl = this.shadowRoot.getElementById("ap-hints");
        const apHintsSearchEl = this.shadowRoot.getElementById("ap-hints-search");
        const apHintsItemClassEl = this.shadowRoot.getElementById("ap-hints-itemclass");
        const apHintsDirectionEl = this.shadowRoot.getElementById("ap-hints-direction");
        const apHintsStatusEl = this.shadowRoot.getElementById("ap-hints-status");
        const apHintGridDataProvider = new SimpleDataProvider(apHintGridEl, DEBUG_HINTS);
        apHintGridDataProvider.setOptions({searchFields: ["finder", "item", "reciever", "location", "entrance"]});
        ArchipelagoController.addEventListener("hintupdate", (event) => {
            for (const hint of event.data) {
                const resolvedHint = this.#resolveHint(hint);
                apHintGridDataProvider.addEntry(resolvedHint);
            }
        });
        apHintsSearchEl.addEventListener("change", () => {
            apHintGridDataProvider.updateOptions({search: apHintsSearchEl.value});
        });
        apHintsItemClassEl.addEventListener("change", () => {
            const {filter} = apHintGridDataProvider.getOptions();
            filter.itemClass = apHintsItemClassEl.value;
            apHintGridDataProvider.updateOptions({filter});
        });
        apHintsDirectionEl.addEventListener("change", () => {
            const {filter} = apHintGridDataProvider.getOptions();
            const value = apHintsDirectionEl.value;
            if (value.includes("sender")) {
                if (value.includes("reciever")) {
                    filter.isSender = null;
                    filter.isReciever = null;
                } else {
                    filter.isSender = true;
                    filter.isReciever = null;
                }
            } else if (value.includes("reciever")) {
                filter.isSender = null;
                filter.isReciever = true;
            } else {
                filter.isSender = false;
                filter.isReciever = false;
            }
            apHintGridDataProvider.updateOptions({filter});
        });
        apHintsStatusEl.addEventListener("change", () => {
            const {filter} = apHintGridDataProvider.getOptions();
            const value = apHintsStatusEl.value;
            if (value.includes("found")) {
                if (value.includes("missing")) {
                    filter.found = null;
                } else {
                    filter.found = true;
                }
            } else if (value.includes("missing")) {
                filter.found = false;
            } else {
                filter.found = "nope";
            }
            apHintGridDataProvider.updateOptions({filter});
        });
        /* --- */
        this.#chatInputEl.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                const text = this.#chatInputEl.value;
                ArchipelagoController.sendChatMessage(text);
                this.#chatInputEl.value = "";
                event.stopPropagation();
                return false;
            }
        });
        apLogListEl.addEventListener("scrollend", (event) => {
            event.stopPropagation();
            apLogListEl.autoscroll = apLogListEl.getVerticalScrollFactor() === 1;
        }, true);
    }

    switchToApLog() {
        this.#apTabsEl.active = "ap-log";
    }

    switchToHints() {
        this.#apTabsEl.active = "hints";
    }

    #resolveMessagegParts(packet) {
        if (packet.type === PRINT_JSON_TYPE.SERVER_CHAT) {
            return {
                type: packet.type,
                message: packet.message
            };
        }

        if (packet.type === PRINT_JSON_TYPE.CHAT) {
            const playerAlias = ArchipelagoController.getPlayerAlias(packet.slot);
            return {
                type: packet.type,
                message: packet.message,
                playerAlias
            };
        }

        const apPlayerId = ArchipelagoController.playerId;
        const resolvedMessageData = packet.data.map((piece) => {
            switch (piece.type) {
                case VALID_JSON_MESSAGE_TYPE.PLAYER_ID: {
                    const playerId = parseInt(piece.text);
                    const playerAlias = ArchipelagoController.getPlayerAlias(playerId);
                    if (playerId === apPlayerId) {
                        return {
                            type: piece.type,
                            current: true,
                            playerAlias
                        };
                    } else {
                        const playerGame = ArchipelagoController.getPlayerGame(playerId);
                        return {
                            type: piece.type,
                            current: false,
                            playerAlias,
                            playerGame
                        };
                    }
                }

                case VALID_JSON_MESSAGE_TYPE.LOCATION_ID: {
                    const locationId = parseInt(piece.text);
                    const locationName = ArchipelagoController.getLocationName(piece.player, locationId);
                    return {
                        type: piece.type,
                        locationName
                    };
                }

                case VALID_JSON_MESSAGE_TYPE.ITEM_ID: {
                    const itemClass = ITEM_CLASSES[piece.flags];
                    const itemId = parseInt(piece.text);
                    const itemName = ArchipelagoController.getItemName(piece.player, itemId);
                    return {
                        type: piece.type,
                        itemName,
                        itemClass
                    };
                }

                case VALID_JSON_MESSAGE_TYPE.ENTRANCE_NAME: {
                    return {
                        type: piece.type,
                        entranceName: piece.text
                    };
                }

                case VALID_JSON_MESSAGE_TYPE.COLOR: {
                    return {
                        type: piece.type,
                        color: piece.color,
                        text: piece.text
                    };
                }

                default: {
                    return {
                        type: piece.type,
                        text: piece.text
                    };
                }
            }
        });

        if (packet.type === PRINT_JSON_TYPE.ITEM_SEND) {
            const senderAlias = ArchipelagoController.getPlayerAlias(packet.item.player);
            const recieverAlias = ArchipelagoController.getPlayerAlias(packet.receiving);
            const itemClass = ITEM_CLASSES[packet.item.flags];
            const itemName = ArchipelagoController.getItemName(packet.receiving, packet.item.item);
            const locationName = ArchipelagoController.getLocationName(packet.item.player, packet.item.location);

            return {
                type: packet.type,
                isSender: packet.item.player === apPlayerId,
                isReciever: packet.receiving === apPlayerId,
                sender: senderAlias,
                reciever: recieverAlias,
                itemClass,
                itemName,
                locationName,
                message: resolvedMessageData
            };
        }

        return {
            type: packet.type,
            message: resolvedMessageData
        };
    }

    #resolveHint(data) {
        const {
            receiving_player,
            finding_player,
            location,
            item,
            found,
            entrance,
            item_flags
        } = data;

        const apPlayerId = ArchipelagoController.playerId;

        const finderAlias = ArchipelagoController.getPlayerAlias(finding_player);
        const recieverAlias = ArchipelagoController.getPlayerAlias(receiving_player);
        const locationName = ArchipelagoController.getLocationName(finding_player, location);
        const itemName = ArchipelagoController.getItemName(receiving_player, item);
        const itemClass = ITEM_CLASSES[item_flags];

        return {
            key: `${finding_player}_${location}`,
            isSender: finding_player === apPlayerId,
            isReciever: receiving_player === apPlayerId,
            finder: finderAlias,
            reciever: recieverAlias,
            location: locationName,
            item: itemName,
            itemClass: itemClass,
            entrance,
            found
        };
    }

}

Panel.registerReference("ap-text-client", APTextClient);
customElements.define("ootrt-aptextclient", APTextClient);
