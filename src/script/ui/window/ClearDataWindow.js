// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import Window from "/emcJS/ui/overlay/window/Window.js";
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";

// GameTrackerJS
import StartItemsStorage from "/GameTrackerJS/storage/StartItemsStorage.js";
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
        <button data-type="shops">delete shop items</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button id="startitems">delete start items</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-type="songs">delete songs</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-type="area_hint">delete area hints (woth/fool)</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-type="dungeonreward">delete dungeon rewards</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-type="dungeontype">delete dungeon types</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-type="item_location">delete item locations</button>
    </emc-input-wrapper>
    <emc-input-wrapper>
        <button data-type="gossipstone">delete gossipstone hints</button>
    </emc-input-wrapper>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
#body {
    height: 50vh;
}
`);

async function clearData(event) {
    const buttonEl = event.target;
    if (!await Dialog.confirm("Warning", `Do you really want to "${buttonEl.innerHTML}"? This can not be undone.`)) {
        return;
    }
    SavestateHandler.overwrite({
        data: {
            [buttonEl.dataset.type]: null
        }
    });
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
        const buttonEls = bodyEl.querySelectorAll("[data-type]");
        for (const buttonEl of Array.from(buttonEls)) {
            buttonEl.addEventListener("click", clearData);
        }
        /* --- */
        const clearStartitemsEl = bodyEl.querySelector("#startitems");
        clearStartitemsEl.addEventListener("click", async () => {
            if (!await Dialog.confirm("Warning", `Do you really want to "delete start items"? This can not be undone.`)) {
                return;
            }
            StartItemsStorage.clear();
        });
    }

}

customElements.define("tootr-window-cleardata", ClearDataWindow);
