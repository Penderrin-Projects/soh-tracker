import CustomElement from "/emcJS/ui/element/CustomElement.js";
import {
    VALID_JSON_MESSAGE_TYPE
} from "/ArchipelagoJS/types/JSONMessagePart.js";
import {
    PRINT_JSON_TYPE
} from "/ArchipelagoJS/consts/PrintJSONType.js";
import {
    HINT_STATUS
} from "/ArchipelagoJS/consts/HintStatus.js";
import TPL from "./ChatListEntry.js.html" assert {type: "html"};
import STYLE from "./ChatListEntry.js.css" assert {type: "css"};

const hintTypes = Object.entries(HINT_STATUS).reduce((prev, [key, value]) => {
    prev[value] = key.toLowerCase().replace(/_/g, "-");
    return prev;
}, {});

export default class ChatListEntry extends CustomElement {

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
            return packet.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        }

        if (packet.type === PRINT_JSON_TYPE.CHAT) {
            const escapedText = packet.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            return `${packet.playerAlias}: ${escapedText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}`;
        }

        /**
         * TODO
         * add dictionary to combine message resolving and rendering into one entry.
         * the idea is to make it easily extendible.
         */
        return packet.message.reduce((string, piece) => {
            switch (piece.type) {
                case VALID_JSON_MESSAGE_TYPE.PLAYER_ID: {
                    if (piece.current) {
                        const escapedPlayerAlias = piece.playerAlias.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        return `${string}<span class="player-current">${escapedPlayerAlias}</span>`;
                    } else {
                        const escapedPlayerAlias = piece.playerAlias.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        const escapedPlayerGame = piece.playerGame.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        return `${string}<span class="player-other">${escapedPlayerAlias}<span class="showGameName"> [${escapedPlayerGame}]</span></span>`;
                    }
                }

                case VALID_JSON_MESSAGE_TYPE.LOCATION_ID: {
                    const escapedLocationName = piece.locationName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    return `${string}<span class="location">${escapedLocationName}</span>`;
                }

                case VALID_JSON_MESSAGE_TYPE.ITEM_ID: {
                    const escapedItemName = piece.itemName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    return `${string}<span class="item-${piece.itemClass}">${escapedItemName}</span>`;
                }

                case VALID_JSON_MESSAGE_TYPE.ENTRANCE_NAME: {
                    const escapedEntranceName = piece.entranceName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    return `${string}<span class="entrance">${escapedEntranceName}</span>`;
                }

                case VALID_JSON_MESSAGE_TYPE.HINT_STATUS: {
                    const escapedHintText = piece.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    return `${string}<span class="${hintTypes[piece.hintStatus]}">${escapedHintText}</span>`;
                }

                case VALID_JSON_MESSAGE_TYPE.COLOR: {
                    const escapedText = piece.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    return `${string}<span style="color: ${piece.color}">${escapedText}</span>`;
                }

                default: {
                    const escapedText = piece.text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    return `${string}<span class="default">${escapedText}</span>`;
                }
            }
        }, "");
    }

}

customElements.define("ootrt-ap-chatlist-entry", ChatListEntry);
