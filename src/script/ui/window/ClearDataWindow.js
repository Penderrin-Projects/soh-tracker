// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import Window from "/emcJS/ui/overlay/window/Window.js";
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";

const TPL = new Template(`
<div>
    You can clear selected parts of the savestate
    <br><br>
    <h2>⚠ Note:</h2>
    Deleted data can not be restored!
    <br><br><br><br>
</div>
<hr style="width: 100%;">
<div>
    <emc-input-wrapper>
        <button data-types="shopItems,shopItemsPrice,shopItemsBought,shopItemsName">delete shop items</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-types="startItems">delete start items</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-types="songNotes">delete songs</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-types="areaHints">delete area hints (woth/fool)</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-types="dungeonRewards">delete dungeon rewards</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-types="dungeonTypes">delete dungeon types</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-types="locationItems">delete item locations</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-types="gossipstoneLocations,gossipstoneItems">delete gossipstone hints</button>
    </emc-input-wrapper>
</div>
`);

const STYLE = new GlobalStyle(`
#body {
    height: 50vh;
}
`);

async function clearData(event) {
    const buttonEl = event.target;
    if (!await Dialog.confirm("Warning", `Do you really want to "${buttonEl.innerHTML}"? This can not be undone.`)) {
        return;
    }
    const types = buttonEl.dataset.types.split(",");
    const data = {};
    for (const name of types) {
        data[name] = null;
    }
    SavestateHandler.overwrite(data);
}

export default class ClearDataWindow extends Window {

    constructor(title = "Clear data", options = {}) {
        super(title, options.close);
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const bodyEl = this.shadowRoot.getElementById("body");
        bodyEl.innerHTML = "";
        bodyEl.append(els);
        /* --- */
        const buttonEls = bodyEl.querySelectorAll("[data-types]");
        for (const buttonEl of Array.from(buttonEls)) {
            buttonEl.addEventListener("click", clearData);
        }
    }

}

customElements.define("tootr-window-cleardata", ClearDataWindow);
