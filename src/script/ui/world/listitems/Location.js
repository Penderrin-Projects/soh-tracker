import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import AbstractLocation from "/script/ui/world/abstract/Location.js";

const TPL = new Template(`
<div class="textarea">
    <div id="text"></div>
    <div id="item"></div>
    <div id="badge">
        <emc-icon id="badge-type" src="images/icons/location.svg"></emc-icon>
        <emc-icon id="badge-time" src="images/icons/time_always.svg"></emc-icon>
        <emc-icon id="badge-era" src="images/icons/era_none.svg"></emc-icon>
    </div>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
:host {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    cursor: pointer;
    padding: 5px;
}
:host(:hover) {
    background-color: var(--main-hover-color, #ffffff32);
}
.textarea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    min-height: 35px;
    word-break: break-word;
}
.textarea:empty {
    display: none;
}
.textarea + .textarea {
    margin-top: 5px;
}
#text {
    display: flex;
    flex: 1;
    align-items: center;
    color: #ffffff;
}
#text[data-state="available"] {
    color: var(--location-status-available-color, #000000);
}
#text[data-state="unavailable"] {
    color: var(--location-status-unavailable-color, #000000);
}
#text[data-checked="true"] {
    color: var(--location-status-opened-color, #000000);
}
#item {
    margin-left: 5px;
}
#badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    flex-shrink: 0;
    margin-left: 5px;
    border: 1px solid var(--navigation-background-color, #ffffff);
    border-radius: 2px;
}
#badge emc-icon {
    width: 25px;
    height: 25px;
}
.menu-tip {
    font-size: 0.7em;
    color: #777777;
    margin-left: 15px;
    float: right;
}
`);

const REG = new Map();
const TYPE = new WeakMap();

export default class ListLocation extends AbstractLocation {

    constructor(type) {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        if (type) {
            const el_type = this.shadowRoot.getElementById("badge-type");
            el_type.src = `images/icons/${type}.svg`;
            type = `location_${type}`;
        } else {
            type = "location";
        }
        TYPE.set(this, type);
    }

    static registerType(ref, clazz) {
        if (REG.has(ref)) {
            throw new Error(`location type ${ref} already exists`);
        }
        REG.set(ref, clazz);
    }

    static createType(ref) {
        if (REG.has(ref)) {
            const ListType = REG.get(ref);
            return new ListType();
        }
        return new ListLocation(ref);
    }

}

ListLocation.registerType('location', ListLocation);
customElements.define('ootrt-list-location', ListLocation);
