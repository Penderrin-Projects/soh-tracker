import FileData from "/emcJS/data/FileData.js";
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import "/emcJS/ui/Icon.js";

const TPL = new Template(`
<emc-icon id="access"></emc-icon>
<emc-icon id="type"></emc-icon>
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px;
    flex-shrink: 0;
    margin-left: 5px;
    border: 1px solid var(--navigation-background-color, #ffffff);
    border-radius: 2px;
}
emc-icon {
    width: 24px;
    height: 24px;
    margin: 1px;
}
emc-icon:not([src]),
emc-icon[src=""], {
    display: none;
}
`);

const ACCESS_VALUES = [
    "opened",
    "available",
    "unavailable",
    "possible"
];

function getLoneFilterIndex(name, filter, data) {
    const def = filter.values.indexOf(filter.default);
    let current = def;
    for (let i = 0; i < filter.values.length; ++i) {
        const value = filter.values[i];
        if (data[`${name}/${value}`]) {
            if (current != def) {
                return def;
            } else {
                current = i;
            }
        }
    }
    return current;
}

export default class Badge extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const filter = FileData.get("filter");
        for (const name in filter) {
            const value = filter[name];
            if (value.badge) {
                const el = document.createElement("emc-icon");
                el.id = `badge-${name}`;
                this.shadowRoot.append(el);
            }
        }
    }

    get typeIcon() {
        return this.getAttribute('type-icon');
    }

    set typeIcon(val) {
        this.setAttribute('type-icon', val);
    }

    get access() {
        return this.getAttribute('access');
    }

    set access(val) {
        this.setAttribute('access', val);
    }

    static get observedAttributes() {
        return ['type-icon', 'access'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'type-icon':
                    {
                        const typeEl = this.shadowRoot.getElementById("type");
                        if (typeEl != null) {
                            typeEl.src = newValue;
                        }
                    }
                    break;
                case 'access':
                    {
                        const accessEl = this.shadowRoot.getElementById("access");
                        if (accessEl != null) {
                            if (ACCESS_VALUES.indexOf(newValue) >= 0) {
                                accessEl.src = `images/icons/access_${newValue}.svg`;
                            } else {
                                accessEl.src = "";
                            }
                        }
                    }
                    break;
            }
        }
    }

    setFilterData(data) {
        if (data != null) {
            const filter = FileData.get("filter");
            for (const name in filter) {
                const value = filter[name];
                if (value.badge) {
                    const el = this.shadowRoot.getElementById(`badge-${name}`);
                    const act = getLoneFilterIndex(name, value, data);
                    el.src = value.images[act];
                }
            }
        }
    }

}

customElements.define('ootrt-badge', Badge);
