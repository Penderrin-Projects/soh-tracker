import CustomElement from "/emcJS/ui/element/CustomElement.js";
import FontawesomeMixin from "/emcJS/ui/mixin/FontawesomeMixin.js";
import {
    VALID_JSON_MESSAGE_TYPE
} from "/ArchipelagoJS/types/JSONMessagePart.js";
import {
    ITEM_FLAGS
} from "/ArchipelagoJS/consts/ItemFlags.js";
import {
    PRINT_JSON_TYPE
} from "/ArchipelagoJS/consts/PrintJSONType.js";
import ArchipelagoController from "../../../../../util/archipelago/ArchipelagoController.js";
import TPL from "./ChatListEntry.js.html" assert {type: "html"};
import STYLE from "./ChatListEntry.js.css" assert {type: "css"};

const ITEM_CLASSES = {
    [ITEM_FLAGS.PROGRESSION]: "item-progressive",
    [ITEM_FLAGS.NEVER_EXCLUDE]: "item-useful",
    [ITEM_FLAGS.FILLER]: "item-normal",
    [ITEM_FLAGS.TRAP]: "item-trap"
};

export default class ChatListEntry extends FontawesomeMixin(CustomElement) {

    #containerEl;

    constructor() {
        super();
        TPL.apply(this.shadowRoot);
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.#containerEl = this.shadowRoot.getElementById("container");
    }

    setData(data) {
        const convertedMessage = this.#consolidateMessage(data);
        this.#containerEl.innerHTML = convertedMessage;
    }

    set key(value) {
        this.setAttribute("key", value);
    }

    get key() {
        return this.getAttribute("key");
    }

    #consolidateMessage(packet) {
        if (packet.type === PRINT_JSON_TYPE.SERVER_CHAT) {
            return packet.message;
        }

        if (packet.type === PRINT_JSON_TYPE.CHAT) {
            const playerAlias = ArchipelagoController.getPlayerAlias(packet.slot);
            return `${playerAlias}: ${packet.message}`;
        }

        return packet.data.reduce((string, piece) => {
            switch (piece.type) {
                case VALID_JSON_MESSAGE_TYPE.PLAYER_ID: {
                    const playerId = parseInt(piece.text);
                    const playerAlias = ArchipelagoController.getPlayerAlias(playerId);
                    if (playerId === ArchipelagoController.playerId) {
                        return `${string}<span class="player-current">${playerAlias}</span>`;
                    } else {
                        const playerGame = ArchipelagoController.getPlayerGame(playerId);
                        return `${string}<span class="player-other">${playerAlias}<span class="showGameName"> [${playerGame}]</span></span>`;
                    }
                }

                case VALID_JSON_MESSAGE_TYPE.LOCATION_ID: {
                    const locationId = parseInt(piece.text);
                    const locationName = ArchipelagoController.getLocationName(piece.player, locationId);
                    return `${string}<span class="location">${locationName}</span>`;
                }

                case VALID_JSON_MESSAGE_TYPE.ITEM_ID: {
                    const itemClass = ITEM_CLASSES[piece.flags];
                    const itemId = parseInt(piece.text);
                    const itemName = ArchipelagoController.getItemName(piece.player, itemId);
                    return `${string}<span class="${itemClass}">${itemName}</span>`;
                }

                case VALID_JSON_MESSAGE_TYPE.COLOR: {
                    return `${string}<span style="color: ${piece.color}">${piece.text}</span>`;
                }

                case VALID_JSON_MESSAGE_TYPE.ENTRANCE_NAME: {
                    return `${string}<span class="entrance">${piece.text}</span>`;
                }

                default: {
                    return `${string}<span class="default">${piece.text}</span>`;
                }
            }
        }, "");
    }

}

customElements.define("ootrt-chatlist-entry", ChatListEntry);
