import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import {
    recordsToDict, dictToRecords
} from "/emcJS/util/helper/storage/Records.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
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
import "./cell/itemcell/DataGridCellAPItem.js";
import "./cell/itemcell/DataGridCellAPUser.js";
import TPL from "./APTextClient.js.html" assert {type: "html"};
import STYLE from "./APTextClient.js.css" assert {type: "css"};
import {
    AP_STORAGES
} from "../../../util/archipelago/storage/RegisterAPStorage.js";

const ITEM_CLASSES = {
    [ITEM_FLAGS.PROGRESSION]: "progressive",
    [ITEM_FLAGS.NEVER_EXCLUDE]: "useful",
    [ITEM_FLAGS.FILLER]: "normal",
    [ITEM_FLAGS.TRAP]: "trap"
};

// TODO
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
        const apLogMsgTypeEl = this.shadowRoot.getElementById("ap-log-msgtype");
        const apLogItemClassEl = this.shadowRoot.getElementById("ap-log-itemclass");
        const apLogDirectionEl = this.shadowRoot.getElementById("ap-log-direction");
        const apLogListDataProvider = new SimpleDataProvider(apLogListEl, [], {
            filterIgnoreNullValues: true
        });
        ArchipelagoController.addEventListener("message", (event) => {
            const {data} = event;
            const resolvedMessage = this.#resolveMessagegParts(data);
            apLogListDataProvider.addEntry(resolvedMessage);
        });
        apLogSearchEl.addEventListener("change", () => {
            apLogListDataProvider.updateOptions({search: apLogSearchEl.value});
        });
        apLogMsgTypeEl.addEventListener("change", () => {
            const {filter} = apLogListDataProvider.getOptions();
            filter.type = apLogMsgTypeEl.value;
            apLogListDataProvider.updateOptions({filter});
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
        const apHintGridDataProvider = new SimpleDataProvider(apHintGridEl, dictToRecords(AP_STORAGES.hints.getAll()), {
            searchFields: ["finder", "item.item", "reciever", "location", "entrance"],
            filterIgnoreNullValues: true,
            sort: ["found"]
        });
        ArchipelagoController.addEventListener("hintupdate", (event) => {
            for (const hint of event.data) {
                const resolvedHint = this.#resolveHint(hint);
                apHintGridDataProvider.addEntry(resolvedHint);
            }
            AP_STORAGES.hints.setAll(recordsToDict(apHintGridDataProvider.getSource()));
        });
        apHintsSearchEl.addEventListener("change", () => {
            apHintGridDataProvider.updateOptions({search: apHintsSearchEl.value});
        });
        apHintsItemClassEl.addEventListener("change", () => {
            const {filter} = apHintGridDataProvider.getOptions();
            filter["item.itemClass"] = apHintsItemClassEl.value;
            apHintGridDataProvider.updateOptions({filter});
        });
        apHintsDirectionEl.addEventListener("change", () => {
            const {filter} = apHintGridDataProvider.getOptions();
            const value = apHintsDirectionEl.value;
            if (value.includes("finder")) {
                if (value.includes("reciever")) {
                    filter["finder.current"] = null;
                    filter["reciever.current"] = null;
                } else {
                    filter["finder.current"] = true;
                    filter["reciever.current"] = null;
                }
            } else if (value.includes("reciever")) {
                filter["finder.current"] = null;
                filter["reciever.current"] = true;
            } else {
                filter["finder.current"] = false;
                filter["reciever.current"] = false;
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
                filter.found = [];
            }
            apHintGridDataProvider.updateOptions({filter});
        });
        /* --- */
        Savestate.addEventListener("load", () => {
            apLogListDataProvider.setSource([]);
            apHintGridDataProvider.setSource(dictToRecords(AP_STORAGES.hints.getAll()));
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
            finder: {
                alias: finderAlias,
                current: finding_player === apPlayerId
            },
            reciever: {
                alias: recieverAlias,
                current: receiving_player === apPlayerId
            },
            location: locationName,
            item: {
                item: itemName,
                itemClass: itemClass
            },
            entrance,
            found
        };
    }

}

Panel.registerReference("ap-text-client", APTextClient);
customElements.define("ootrt-aptextclient", APTextClient);
