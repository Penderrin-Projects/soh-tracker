import Template from "/emcJS/util/Template.js";
import FileData from "/emcJS/data/FileData.js";
import Language from "/script/util/Language.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import UIRegistry from "/GameTrackerJS/registry/UIRegistry.js";
import "./DungeonReward.js";
import "./DungeonType.js";
import "../items/components/Item.js";
import "../items/components/ItemKey.js";
import "../items/components/InfiniteItem.js";
import "../items/components/RewardItem.js";
import "../items/components/VariableMaxItem.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
            cursor: default;
        }
        :host {
            display: flex;
            flex-direction: row;
            min-width: min-content;
            min-height: min-content;
        }
        :host([orientation="column"]) {
            flex-direction: column;
        }
        div.item-row {
            display: flex;
            flex-direction: column;
        }
        div.item-row:hover {
            background-color: var(--main-hover-color, #ffffff32);
        }
        :host([orientation="column"]) div.item-row {
            flex-direction: row;
        }
        ootrt-item {
            display: block;
            padding: 2px;
        }
        ootrt-dungeonreward,
        ootrt-dungeontype {
            display: block;
            padding: 5px;
        }
        ootrt-dungeonreward:hover,
        ootrt-dungeontype:hover {
            padding: 2px;
        }
        div.text {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 20px;
            padding: 2px;
            font-size: 1em;
            -moz-user-select: none;
            user-select: none;
        }
        :host([orientation="column"]) div.text {
            height: 40px;
        }
        div.placeholder {
            width: 40px;
            height: 40px;
        }
        [type].inactive {
            display: none;
        }
    </style>
`);

function createItemText(text) {
    const el = document.createElement('DIV');
    el.classList.add("text");
    el.innerHTML = text;
    return el;
}

function createItemPlaceholder() {
    const el = document.createElement('DIV');
    el.classList.add("placeholder");
    return el;
}

class HTMLTrackerDungeonState extends Panel {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        const dungeonData = FileData.get("dungeonstate/area");
        for (const ref in dungeonData) {
            const dData = dungeonData[ref];
            this.shadowRoot.append(createRow(`area/${ref}`, dData));
        }
        switchActive.call(this, this.active);
    }

    connectedCallback() {
        this.setAttribute("data-fontmod", "items");
    }

    get active() {
        return this.getAttribute('active');
    }

    set active(val) {
        this.setAttribute('active', val);
    }

    get orientation() {
        return this.getAttribute('orientation');
    }

    set orientation(val) {
        this.setAttribute('orientation', val);
    }

    static get observedAttributes() {
        return ['active'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'active':
                if (oldValue != newValue) {
                    switchActive.call(this, newValue);
                }
                break;
        }
    }

}

Panel.registerReference("dungeon-status", HTMLTrackerDungeonState);
customElements.define('ootrt-dungeonstate', HTMLTrackerDungeonState);

function switchActive(value) {
    if (typeof value === "string") {
        value = value.split(/,\s*/);
    } else {
        value = [];
    }
    this.shadowRoot.querySelectorAll("[type]").forEach(j => {
        j.classList.add("inactive");
    });
    value.forEach(i => {
        if (!i) return;
        this.shadowRoot.querySelectorAll(`[type~=${i}]`).forEach(j => {
            j.classList.remove("inactive");
        });
    });
}

function createRow(ref, data) {
    const el = document.createElement('DIV');
    el.classList.add("item-row");
    el.classList.add("inactive");
    const types = [];

    const items = FileData.get("items");

    //////////////////////////////////
    // title
    const title = createItemText(data.title);
    title.style.color = data.color;
    el.append(title);
    //////////////////////////////////
    // small key
    if (data.keys) {
        const itemData = items[data.keys];
        const itm = UIRegistry.get("item").create(itemData.type, data.keys);
        itm.classList.add("inactive");
        itm.setAttribute("type", "key");
        itm.title = Language.translate(data.keys);
        el.append(itm);
        /* register */
        types.push("key");
    } else {
        const itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "key");
        el.append(itm);
    }
    //////////////////////////////////
    // boss key
    if (data.bosskey) {
        const itemData = items[data.bosskey];
        const itm = UIRegistry.get("item").create(itemData.type, data.bosskey);
        itm.classList.add("inactive");
        itm.setAttribute("type", "bosskey");
        itm.title = Language.translate(data.bosskey);
        el.append(itm);
        /* register */
        types.push("bosskey");
    } else {
        const itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "bosskey");
        el.append(itm);
    }
    //////////////////////////////////
    // map
    if (data.map) {
        const itemData = items[data.map];
        const itm = UIRegistry.get("item").create(itemData.type, data.map);
        itm.classList.add("inactive");
        itm.setAttribute("type", "map");
        itm.setAttribute('ref', data.map);
        itm.title = Language.translate(data.map);
        el.append(itm);
        /* register */
        types.push("map");
    } else {
        const itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "map");
        el.append(itm);
    }
    //////////////////////////////////
    // compass
    if (data.compass) {
        const itemData = items[data.compass];
        const itm = UIRegistry.get("item").create(itemData.type, data.compass);
        itm.classList.add("inactive");
        itm.setAttribute("type", "compass");
        itm.setAttribute('ref', data.compass);
        itm.title = Language.translate(data.compass);
        el.append(itm);
        /* register */
        types.push("compass");
    } else {
        const itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "compass");
        el.append(itm);
    }
    //////////////////////////////////
    // reward
    if (data.boss_reward) {
        const itm = document.createElement('ootrt-dungeonreward');
        itm.classList.add("inactive");
        itm.setAttribute("type", "reward");
        itm.setAttribute('ref', ref);
        itm.title = Language.translate(ref) + " " + Language.translate("dun_reward");
        el.append(itm);
        /* register */
        types.push("reward");
    } else {
        const itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "reward");
        el.append(itm);
    }
    //////////////////////////////////
    // mode
    if (data.hasmq) {
        const itm = document.createElement('ootrt-dungeontype');
        itm.classList.add("inactive");
        itm.setAttribute("type", "type");
        itm.setAttribute('ref', ref);
        itm.title = Language.translate(ref) + " " + Language.translate("dun_type");
        el.append(itm);
        /* register */
        types.push("type");
    } else {
        const itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "type");
        el.append(itm);
    }

    el.setAttribute("type", types.join(' '));

    return el;
}
