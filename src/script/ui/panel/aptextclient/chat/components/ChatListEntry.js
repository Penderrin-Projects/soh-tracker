import CustomElement from "/emcJS/ui/element/CustomElement.js";
import FontawesomeMixin from "/emcJS/ui/mixin/FontawesomeMixin.js";
import {
    VALID_JSON_MESSAGE_TYPE
} from "/ArchipelagoJS/types/JSONMessagePart.js";
import {
    PRINT_JSON_TYPE
} from "/ArchipelagoJS/consts/PrintJSONType.js";
import TPL from "./ChatListEntry.js.html" assert {type: "html"};
import STYLE from "./ChatListEntry.js.css" assert {type: "css"};

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
            return `${packet.playerAlias}: ${packet.message}`;
        }

        return packet.message.reduce((string, piece) => {
            switch (piece.type) {
                case VALID_JSON_MESSAGE_TYPE.PLAYER_ID: {
                    if (piece.current) {
                        return `${string}<span class="player-current">${piece.playerAlias}</span>`;
                    } else {
                        return `${string}<span class="player-other">${piece.playerAlias}<span class="showGameName"> [${piece.playerGame}]</span></span>`;
                    }
                }

                case VALID_JSON_MESSAGE_TYPE.LOCATION_ID: {
                    return `${string}<span class="location">${piece.locationName}</span>`;
                }

                case VALID_JSON_MESSAGE_TYPE.ITEM_ID: {
                    return `${string}<span class="item-${piece.itemClass}">${piece.itemName}</span>`;
                }

                case VALID_JSON_MESSAGE_TYPE.ENTRANCE_NAME: {
                    return `${string}<span class="entrance">${piece.entranceName}</span>`;
                }

                case VALID_JSON_MESSAGE_TYPE.COLOR: {
                    return `${string}<span style="color: ${piece.color}">${piece.text}</span>`;
                }

                default: {
                    return `${string}<span class="default">${piece.text}</span>`;
                }
            }
        }, "");
    }

}

customElements.define("ootrt-chatlist-entry", ChatListEntry);
