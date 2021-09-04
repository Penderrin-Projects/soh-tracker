// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import EventTargetMixin from "/emcJS/event/ui/EventTargetMixin.js";
import "/emcJS/ui/Icon.js";

import FilterResource from "../resource/FilterResource.js";
import SettingsObserver from "../util/observer/SettingsObserver.js";

const colorBlindObserver = new SettingsObserver("color_blind_badge_icons");
const showFiltersObserver = new SettingsObserver("show_filter_badges");

const TPL = new Template(`
<emc-icon id="access"></emc-icon>
<emc-icon id="type"></emc-icon>
<div id="filters"></div>
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
    flex-shrink: 0;
    padding: 2px;
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
emc-icon[src=""] {
    display: none;
}
#filters {
    display: contents;
}
`);

const ACCESS_VALUES = [
    "opened",
    "available",
    "unavailable",
    "possible"
];

function getFilterImage(name, filter, data) {
    if (filter.badge) {
        if (Array.isArray(filter.badge)) {
            const current = data[name];
            for (const entry of filter.badge) {
                if (entry.values == null || Object.entries(entry.values).every(([key, value]) => current[key] == value)) {
                    return entry.image ?? "";
                }
            }
            return filter.images[filter.values.indexOf(filter.default)];
        } else {
            return filter.images[getLoneFilterIndex(name, filter, data)];
        }
    }
}

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

export default class Badge extends EventTargetMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const filter = FilterResource.get();
        const filtersEl = this.shadowRoot.getElementById("filters");
        for (const name in filter) {
            const value = filter[name];
            if (value.badge) {
                const el = document.createElement("emc-icon");
                el.id = `badge-${name}`;
                filtersEl.append(el);
            }
        }
        if (filtersEl != null) {
            filtersEl.style.display = showFiltersObserver.value ? "" : "none";
        }
        this.switchTarget("showFilters", showFiltersObserver);
        this.setTargetEventListener("showFilters", "change", event => {
            if (filtersEl != null) {
                filtersEl.style.display = !!event.data ? "" : "none";
            }
        });
        /* --- */
        const colorBlindEl = this.shadowRoot.getElementById("access");
        if (colorBlindEl != null) {
            colorBlindEl.style.display = colorBlindObserver.value ? "" : "none";
        }
        this.switchTarget("colorBlind", colorBlindObserver);
        this.setTargetEventListener("colorBlind", "change", event => {
            if (colorBlindEl != null) {
                colorBlindEl.style.display = !!event.data ? "" : "none";
            }
        });
    }

    get typeIcon() {
        return this.getAttribute("type-icon");
    }

    set typeIcon(val) {
        this.setAttribute("type-icon", val);
    }

    get access() {
        return this.getAttribute("access");
    }

    set access(val) {
        this.setAttribute("access", val);
    }

    static get observedAttributes() {
        return ["type-icon", "access"];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case "type-icon": {
                    const typeEl = this.shadowRoot.getElementById("type");
                    if (typeEl != null) {
                        typeEl.src = newValue;
                    }
                } break;
                case "access": {
                    const colorBlindEl = this.shadowRoot.getElementById("access");
                    if (colorBlindEl != null) {
                        if (ACCESS_VALUES.indexOf(newValue) >= 0) {
                            colorBlindEl.src = `images/icons/access_${newValue}.svg`;
                        } else {
                            colorBlindEl.src = "";
                        }
                    }
                } break;
            }
        }
    }

    setFilterData(data) {
        if (data != null) {
            const filter = FilterResource.get();
            for (const name in filter) {
                const value = filter[name];
                if (value.badge) {
                    const el = this.shadowRoot.getElementById(`badge-${name}`);
                    el.src = getFilterImage(name, value, data);
                }
            }
        }
    }

}

customElements.define("gt-badge", Badge);
