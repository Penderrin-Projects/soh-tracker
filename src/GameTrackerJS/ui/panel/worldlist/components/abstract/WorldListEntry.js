// frameworks
import Template from "/emcJS/util/html/Template.js";
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import CustomElement from "/emcJS/ui/CustomElement.js";

import { mix } from "/emcJS/util/Mixin.js";
import ContextMenuManagerMixin from "/emcJS/ui/overlay/ctxmenu/ContextMenuManagerMixin.js";
import "/emcJS/i18n/ui/I18nLabel.js";

const TPL = new Template(`
<div id="header" class="textarea">
    <emc-i18n-label id="text"></emc-i18n-label>
</div>
`);

const STYLE = new GlobalStyle(`
:host {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
    cursor: pointer;
    padding: 5px;
    user-select: none;
}
:host(:hover),
:host(.ctx-marked) {
    background-color: var(--main-hover-color, #ffffff32);
}
.textarea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    width: 100%;
    min-height: 35px;
    word-break: break-word;
}
.textarea:empty {
    display: none;
}
.textarea + .textarea {
    margin-top: 5px;
}
#text {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex: 1;
    color: var(--page-text-color, #000000);
}
`);

const BaseClass = mix(
    CustomElement
).with(
    ContextMenuManagerMixin
);

export default class WorldListEntry extends BaseClass {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* mouse events */
        this.addEventListener("click", event => {
            this.clickHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            this.contextmenuHandler(event);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
    }

    clickHandler(event) {
        // nothing
    }

    contextmenuHandler(event) {
        this.showDefaultContextMenu(event);
        event.stopPropagation();
        event.preventDefault();
        return false;
    }

}
