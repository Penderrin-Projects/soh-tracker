// frameworks
import ActionMessage from "/emcJS/ui/overlay/message/ActionMessage.js";
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";

// GameTrackerJS
import AppSettingsWindow from "/GameTrackerJS/ui/window/settings/AppSettingsWindow.js";
// Track-OOT
import "./tabs/CreditsTab.js";
import "./tabs/AboutTab.js";

// TODO bind erase stored data button

let showUpdatePopup = false;

export default class TrackerSettingsWindow extends AppSettingsWindow {

    constructor() {
        super();
        /* --- */
        const credits = document.createElement("tootr-credits");
        this.addElements("credits", credits);
        /* --- */
        const about = document.createElement("tootr-about");
        this.addElements("about", about);
        /* --- */

        about.addEventListener("updateavailable", () => {
            if (showUpdatePopup) {
                showUpdatePopup = false;
                ActionMessage.info({
                    text: "A new update is available.\nClick here to download!",
                    time: 60
                }).addEventListener("action", () => {
                    super.show("about");
                });
            }
        });
        about.addEventListener("updaterror", () => {
            if (!showUpdatePopup) {
                Dialog.alert("Connection Lost", "The ServiceWorker was not able to establish or keep connection to the Server<br>Please try again later.");
            }
        });

        this.addEventListener("close", () => {
            showUpdatePopup = true;
        });

        showUpdatePopup = true;
        about.checkUpdate();
    }

    show() {
        showUpdatePopup = false;
        super.show();
    }

}

customElements.define("tootr-window-trackersettings", TrackerSettingsWindow);
