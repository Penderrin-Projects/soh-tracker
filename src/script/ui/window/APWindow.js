import WindowLayer from "/emcJS/ui/overlay/window/WindowLayer.js";
import Window from "/emcJS/ui/overlay/window/Window.js";
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import "/emcJS/ui/i18n/I18nLabel.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import ArchipelagoController from "../../util/archipelago/ArchipelagoController.js";
import TPL from "./APWindow.js.html" assert {type: "html"};
import STYLE from "./APWindow.js.css" assert {type: "css"};

const APStateStorage = Savestate.getStorage("APState");

export default class APWindow extends Window {

    #apHostnameEl;

    #apPortEl;

    #apSlotNameEl;

    #apPasswordEl;

    #connectEl;

    #disconnectEl;

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

        this.#connectEl = this.shadowRoot.getElementById("connect");
        this.#connectEl.addEventListener("click", () => this.connect());

        this.#disconnectEl = this.shadowRoot.getElementById("disconnect");
        this.#disconnectEl.addEventListener("click", () => this.disconnect());

        const cancelEl = this.shadowRoot.getElementById("cancel");
        cancelEl.addEventListener("click", () => this.cancel());
    }

    show() {
        WindowLayer.append(this, "dialogs");

        const {apHostname, apPort, apSlotName, apPassword} = APStateStorage.getAll();

        this.#apHostnameEl.value = apHostname ?? "archipelago.gg";
        this.#apPortEl.value = apPort;
        this.#apSlotNameEl.value = apSlotName ?? "";
        this.#apPasswordEl.value = apPassword ?? "";

        if (ArchipelagoController.isConnected()) {
            this.#apHostnameEl.setAttribute("disabled", "");
            this.#apPortEl.setAttribute("disabled", "");
            this.#apSlotNameEl.setAttribute("disabled", "");
            this.#apPasswordEl.setAttribute("disabled", "");
            this.#connectEl.classList.add("hidden");
            this.#disconnectEl.classList.remove("hidden");
        }

        this.initialFocus();
    }

    async connect() {
        const apHostname = this.#apHostnameEl.value;
        const apPort = parseInt(this.#apPortEl.value) || "";
        const apSlotName = this.#apSlotNameEl.value;
        const apPassword = this.#apPasswordEl.value;

        try {
            await ArchipelagoController.connect(apHostname, apPort, apSlotName, apPassword);
            APStateStorage.setAll({apHostname, apPort, apSlotName, apPassword});
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
        this.#disconnectEl.classList.add("hidden");
    }

}

customElements.define("tootr-window-ap", APWindow);
