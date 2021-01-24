import PopOver from "/emcJS/ui/overlay/PopOver.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import AppSettingsWindow from "/GameTrackerJS/ui/window/AppSettingsWindow.js";
import "./CreditsTab.js";
import "./AboutTab.js";

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
                const popover = PopOver.show("A new update is available. Click here to download!", 60);
                popover.addEventListener("click", () => {
                    this.show("about");
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
        super.show("settings");
    }

}

customElements.define("tootr-window-trackersettings", TrackerSettingsWindow);
