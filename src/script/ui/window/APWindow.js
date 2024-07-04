import Window from "/emcJS/ui/overlay/window/Window.js";
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import "/emcJS/ui/input/InputWrapper.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import ArchipelagoController from "../../util/archipelago/ArchipelagoController.js";
import {
    AP_STORAGES
} from "../../util/archipelago/storage/RegisterAPStorage.js";
import TPL from "./APWindow.js.html" assert {type: "html"};
import STYLE from "./APWindow.js.css" assert {type: "css"};

const APStateStorage = Savestate.getStorage("APConfig");

export default class APWindow extends Window {

    #apHostnameEl;

    #apPortEl;

    #apSlotNameEl;

    #apPasswordEl;

    #apSettingsSyncEl;

    #connectEl;

    #disconnectEl;

    #purgeEl;

    constructor() {
        super("Archipelago");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const windowEl = this.shadowRoot.getElementById("window");
        const bodyEl = this.shadowRoot.getElementById("body");
        const formEl = els.getElementById("form");
        const footerEl = els.getElementById("footer");

        bodyEl.append(formEl);
        windowEl.append(footerEl);

        this.#apHostnameEl = this.shadowRoot.getElementById("apHostname");
        this.#apPortEl = this.shadowRoot.getElementById("apPort");
        this.#apSlotNameEl = this.shadowRoot.getElementById("apSlotName");
        this.#apPasswordEl = this.shadowRoot.getElementById("apPassword");
        this.#apSettingsSyncEl = this.shadowRoot.getElementById("apSettingsSync");

        this.#connectEl = this.shadowRoot.getElementById("connect");
        this.#connectEl.addEventListener("click", () => this.connect());

        this.#disconnectEl = this.shadowRoot.getElementById("disconnect");
        this.#disconnectEl.addEventListener("click", () => this.disconnect());

        const cancelEl = this.shadowRoot.getElementById("cancel");
        cancelEl.addEventListener("click", () => this.cancel());

        this.#purgeEl = this.shadowRoot.getElementById("purge");
        this.#purgeEl.addEventListener("click", () => this.#purgeAPState());
    }

    show() {
        const {apHostname, apPort, apSlotName, apSettingsSync} = APStateStorage.getAll();

        this.#apHostnameEl.value = apHostname ?? "archipelago.gg";
        this.#apPortEl.value = apPort;
        this.#apSlotNameEl.value = apSlotName ?? "";
        this.#apPasswordEl.value = "";
        this.#apSettingsSyncEl.checked = apSettingsSync ?? true;

        if (ArchipelagoController.isConnected()) {
            this.#apHostnameEl.setAttribute("disabled", "");
            this.#apPortEl.setAttribute("disabled", "");
            this.#apSlotNameEl.setAttribute("disabled", "");
            this.#apPasswordEl.setAttribute("disabled", "");
            this.#connectEl.classList.add("hidden");
            this.#purgeEl.classList.add("hidden");
            this.#disconnectEl.classList.remove("hidden");
        }

        super.show();
    }

    async connect() {
        const apHostname = this.#apHostnameEl.value;
        const apPort = parseInt(this.#apPortEl.value) || "";
        const apSlotName = this.#apSlotNameEl.value;
        const apPassword = this.#apPasswordEl.value;
        const apSettingsSync = this.#apSettingsSyncEl.checked;

        try {
            await ArchipelagoController.connect(apHostname, apPort, apSlotName, apPassword, apSettingsSync);
            APStateStorage.setAll({apHostname, apPort, apSlotName, apSettingsSync});
            this.remove();
        } catch (error) {
            Dialog.error("Error", "An error occured", [error]);
        }
    }

    async disconnect() {
        ArchipelagoController.disconnect();
        this.remove();
    }

    cancel() {
        this.remove();
    }

    remove() {
        super.remove();

        this.#apHostnameEl.removeAttribute("disabled");
        this.#apPortEl.removeAttribute("disabled");
        this.#apSlotNameEl.removeAttribute("disabled");
        this.#apPasswordEl.removeAttribute("disabled");
        this.#connectEl.classList.remove("hidden");
        this.#purgeEl.classList.remove("hidden");
        this.#disconnectEl.classList.add("hidden");
    }

    async #purgeAPState() {
        const result = await Dialog.confirm("Delete AP Savedata", "Do you really want to delete the AP Item/Location data");
        if (result === true) {
            AP_STORAGES.items.clearAsChange();
            AP_STORAGES.locations.clearAsChange();
            SavestateHandler.forceCache();
        }
    }

}

customElements.define("tootr-window-ap", APWindow);
