/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import "/emcJS/ui/input/InputWrapper.js";
/* asym-import: on */

// Track-OOT
import VersionData from "/script/data/VersionData.js";
import "/script/ui/UpdateHandler.js";

const TPL = new Template(`
<div style="display: flex; margin-bottom: 10px;">
    <div style="flex: 1">
        <div style="padding: 5px;">
            Tracker Version:
            <span id="tracker-version">DEV</span>
        </div>
        <div style="padding: 5px;">
            Version Date:
            <span id="tracker-date">01.01.2019 00:00:00</span>
        </div>
        <div style="padding: 5px;">
            <emc-input-wrapper>
                <a href="CHANGELOG.MD" target="_BLANK">see the changelog</a>
            </emc-input-wrapper>
        </div>
    </div>
    <div style="width: 100px; height: 100px; margin: 10px; background-image: url('images/logo.svg'); background-size: contain; background-position: left; background-repeat: no-repeat;"></div>
</div>
<hr>
<div>
    <ootrt-updatehandler id="updatehandler"></ootrt-updatehandler>
    <hr>
    <div style="padding: 5px;">
        Erase all app data:
        <br>
        <emc-input-wrapper>
            <button id="erase-button">erase</button>
        </emc-input-wrapper>
    </div>
</div>
<hr>
<div>
    Please be aware, that the logic of this tracker (mostly) follows the randomizer logic.<br>
    This is due to the fact, that the logic of the randomizer is a good estimation of the logic of the game itself.<br>
    If the tracker acts weird, please 
    <emc-input-wrapper>
        <a href="https://bitbucket.org/zidargs/track-oot/issues" target="_blank" rel="noreferrer">report the error!</a>
    </emc-input-wrapper>
    <br><br>
    You can also report via Discord ▶ 
    <emc-input-wrapper>
        <a href="https://discord.gg/wgFVtuv" target="_blank" rel="noreferrer">Join my Discord!</a>
    </emc-input-wrapper>
    <br><br>
</div>
`);

export default class AboutTab extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.append(TPL.generate());
        /* --- */
        this.shadowRoot.getElementById("tracker-version").innerHTML = VersionData.version;
        this.shadowRoot.getElementById("tracker-date").innerHTML = VersionData.date;
        const updatehandler = this.shadowRoot.getElementById("updatehandler");
        updatehandler.addEventListener("updateavailable", () => {
            const ev = new Event("updateavailable");
            this.dispatchEvent(ev);
        });
        updatehandler.addEventListener("noconnection", () => {
            const ev = new Event("updaterror");
            this.dispatchEvent(ev);
        });
        this.shadowRoot.getElementById("erase-button").addEventListener("click", async () => {
            const eraseString = await Dialog.prompt("Erase all data", "Warning: All stored data will be lost\nPlease enter \"erase data\" to confirm");
            if (eraseString == "erase data") {
                window.location.href = "/uninstall.html?nosw";
            }
        });
    }

    checkUpdate() {
        const updatehandler = this.shadowRoot.getElementById("updatehandler");
        updatehandler.checkUpdate();
    }

}

customElements.define("tootr-about", AboutTab);
