// frameworks
import GlobalContext from "/emcJS/data/storage/global/GlobalContext.js";
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import Window from "/emcJS/ui/overlay/window/Window.js";
import "/emcJS/ui/layout/panel/TabPanel.js";
import "/emcJS/ui/input/ListSelect.js";

// GameTrackerJS
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";

const TPL = new Template(`
<div>
    You have a few options to initialize your new savestate.
    <br><br>
    <h2>⚠ Note:</h2>
    Please be aware, that there is a trick for hidden grottos without the need of the stone of agony.<br>
    This trick is turned off by default, as it is in the randomizer, and it might be preventing you to access grottos in the tracker.
    <br><br><br><br>
</div>
<hr style="width: 100%;">
<div>
    You can simply import a spoiler log to set all needed randomizer options<br>
    <emc-input-wrapper>
        <button id="uplaod-spoiler-button">upload spoiler</button>
    </emc-input-wrapper>
</div>
<hr style="width: 100%;">
<div>
    You can open the randomizer options to set them manually<br>
    <emc-input-wrapper>
        <button id="open-options-button">randomizer options</button>
    </emc-input-wrapper>
</div>
`);

const FOOTER = new Template(`
<div id="footer">
    <label class="settings-option">
        <emc-input-wrapper>
            <input id="show-init-checkbox" class="settings-input" type="checkbox">
        </emc-input-wrapper>
        <span class="option-text">
            <emc-i18n-label i18n-value="show_state_init_window"></emc-i18n-label>
        </span>
    </label>
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    position: relative;
    box-sizing: border-box;
    position: relative;
    box-sizing: border-box;
}
#body {
    height: 50vh;
}
#footer {
    display: flex;
    height: 50px;
    padding: 10px 30px 10px;
    justify-content: flex-end;
    border-top: solid 2px #cccccc;
}
.settings-option {
    flex: 1;
    display: flex;
    align-items: center;
}
`);

export default class NewGameWindow extends Window {

    constructor(title = "Initialize new state", options = {}) {
        super(title, options.close);
        const els = TPL.generate();
        const footer = FOOTER.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const windowEl = this.shadowRoot.getElementById("window");
        const bodyEl = this.shadowRoot.getElementById("body");
        bodyEl.innerHTML = "";
        bodyEl.append(els);
        windowEl.append(footer);
        /* --- */
        const romSettingsButton = this.shadowRoot.getElementById("open-options-button");
        romSettingsButton.addEventListener("click", () => {
            this.close();
            const romOptionsWindow = GlobalContext.get("RomOptionsWindow");
            if (romOptionsWindow) {
                romOptionsWindow.show();
            }
        });
        const uploadSpoilerButton = this.shadowRoot.getElementById("uplaod-spoiler-button");
        uploadSpoilerButton.addEventListener("click", () => {
            this.close();
            const spoilerLogWindow = GlobalContext.get("SpoilerLogWindow");
            if (spoilerLogWindow) {
                spoilerLogWindow.show();
            }
        });
    }

    show() {
        super.show();
        const showInitCheckbox = this.shadowRoot.getElementById("show-init-checkbox");
        showInitCheckbox.checked = SettingsStorage.get("show_state_init_window");
    }

    close() {
        const showInitCheckbox = this.shadowRoot.getElementById("show-init-checkbox");
        SettingsStorage.set("show_state_init_window", showInitCheckbox.checked);
        super.close();
    }

}

customElements.define("tootr-window-newgame", NewGameWindow);
