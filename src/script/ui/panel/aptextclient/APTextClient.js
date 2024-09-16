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
import "/emcJS/ui/form/element/input/string/StringInput.js";
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
        const apLogListDataProvider = new SimpleDataProvider(apLogListEl, DEBUG_MESSAGES);
        ArchipelagoController.addEventListener("message", (event) => {
            const {data} = event;
            const resolvedMessage = this.#resolveMessagegParts(data);
            apLogListDataProvider.addEntry(resolvedMessage);
        });
        this.#chatInputEl.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                const text = this.#chatInputEl.value;
                ArchipelagoController.sendChatMessage(text);
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

}

Panel.registerReference("ap-text-client", APTextClient);
customElements.define("ootrt-aptextclient", APTextClient);
