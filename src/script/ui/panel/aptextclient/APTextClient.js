import SimpleDataProvider from "/emcJS/util/dataprovider/SimpleDataProvider.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import ArchipelagoController from "../../../util/archipelago/ArchipelagoController.js";
import "/emcJS/ui/form/element/input/string/StringInput.js";
import "./chat/ChatList.js";
import TPL from "./APTextClient.js.html" assert {type: "html"};
import STYLE from "./APTextClient.js.css" assert {type: "css"};

const DEBUG_MESSAGES = [
    {
        "cmd": "PrintJSON",
        "data": [
            {
                "text": "66",
                "type": "player_id"
            },
            {
                "text": " sent "
            },
            {
                "text": "3860123",
                "player": 17,
                "flags": 0,
                "type": "item_id"
            },
            {
                "text": " to "
            },
            {
                "text": "17",
                "type": "player_id"
            },
            {
                "text": " ("
            },
            {
                "text": "67137",
                "player": 66,
                "type": "location_id"
            },
            {
                "text": ")"
            }
        ],
        "type": "ItemSend",
        "receiving": 17,
        "item": {
            "item": 3860123,
            "location": 67137,
            "player": 66,
            "flags": 0,
            "class": "NetworkItem"
        }
    },
    {
        "cmd": "PrintJSON",
        "data": [
            {
                "text": "66",
                "type": "player_id"
            },
            {
                "text": " sent "
            },
            {
                "text": "120043",
                "player": 62,
                "flags": 2,
                "type": "item_id"
            },
            {
                "text": " to "
            },
            {
                "text": "62",
                "type": "player_id"
            },
            {
                "text": " ("
            },
            {
                "text": "67133",
                "player": 66,
                "type": "location_id"
            },
            {
                "text": ")"
            }
        ],
        "type": "ItemSend",
        "receiving": 62,
        "item": {
            "item": 120043,
            "location": 67133,
            "player": 66,
            "flags": 2,
            "class": "NetworkItem"
        }
    },
    {
        "cmd": "PrintJSON",
        "data": [
            {
                "text": "66",
                "type": "player_id"
            },
            {
                "text": " sent "
            },
            {
                "text": "7880001",
                "player": 25,
                "flags": 1,
                "type": "item_id"
            },
            {
                "text": " to "
            },
            {
                "text": "25",
                "type": "player_id"
            },
            {
                "text": " ("
            },
            {
                "text": "67134",
                "player": 66,
                "type": "location_id"
            },
            {
                "text": ")"
            }
        ],
        "type": "ItemSend",
        "receiving": 25,
        "item": {
            "item": 7880001,
            "location": 67134,
            "player": 66,
            "flags": 1,
            "class": "NetworkItem"
        }
    },
    {
        "cmd": "PrintJSON",
        "data": [
            {
                "text": "66",
                "type": "player_id"
            },
            {
                "text": " found their "
            },
            {
                "text": "66124",
                "player": 66,
                "flags": 4,
                "type": "item_id"
            },
            {
                "text": " ("
            },
            {
                "text": "68235",
                "player": 66,
                "type": "location_id"
            },
            {
                "text": ")"
            }
        ],
        "type": "ItemSend",
        "receiving": 66,
        "item": {
            "item": 66124,
            "location": 68235,
            "player": 66,
            "flags": 4,
            "class": "NetworkItem"
        }
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
            apLogListDataProvider.addEntry(data);
        });
        this.#chatInputEl.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                const text = this.#chatInputEl.value;
                ArchipelagoController.sendChatMessage(text);
                event.stopPropagation();
                return false;
            }
        });
    }

    switchToApLog() {
        this.#apTabsEl.active = "ap-log";
    }

    switchToHints() {
        this.#apTabsEl.active = "hints";
    }

}

Panel.registerReference("ap-text-client", APTextClient);
customElements.define("ootrt-aptextclient", APTextClient);
