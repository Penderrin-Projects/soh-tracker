// frameworks
import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import CustomElement from "/emcJS/ui/element/CustomElement.js";

const TPL = new HTMLTemplate(`
    <style>
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            padding: 10px;
        }
        #text {
            flex: 1;
            padding: 5px;
            resize: none;
            overflow: scroll;
            background-color: var(--edit-back-color, #ffffff);
            color: var(--edit-text-color, #000000);
            word-wrap: unset;
            white-space: pre;
            user-select: text;
        }
    </style>
    <textarea id="text" readonly></textarea>
`);

export default class MPLogger extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
    }

    log(...message) {
        const el = this.shadowRoot.getElementById("text");
        if (message.length == 1) {
            message = message[0];
        }
        if (typeof message == "object") {
            el.value += "LOG " + JSON.stringify(message, null, 4) + "\n----------------------------------------\n";
        } else {
            el.value += "LOG\n" + message + "\n----------------------------------------\n";
        }
        el.scrollTop = el.scrollHeight;
    }

    info(...message) {
        const el = this.shadowRoot.getElementById("text");
        if (message.length == 1) {
            message = message[0];
        }
        if (typeof message == "object") {
            el.value += "INFO " + JSON.stringify(message, null, 4) + "\n----------------------------------------\n";
        } else {
            el.value += "INFO\n" + message + "\n----------------------------------------\n";
        }
        el.scrollTop = el.scrollHeight;
    }

    warn(...message) {
        const el = this.shadowRoot.getElementById("text");
        if (message.length == 1) {
            message = message[0];
        }
        if (typeof message == "object") {
            el.value += "WARN " + JSON.stringify(message, null, 4) + "\n----------------------------------------\n";
        } else {
            el.value += "WARN\n" + message + "\n----------------------------------------\n";
        }
        el.scrollTop = el.scrollHeight;
    }

    error(...message) {
        const el = this.shadowRoot.getElementById("text");
        if (message.length == 1) {
            message = message[0];
        }
        if (typeof message == "object") {
            el.value += "ERROR " + JSON.stringify(message, null, 4) + "\n----------------------------------------\n";
        } else {
            el.value += "ERROR\n" + message + "\n----------------------------------------\n";
        }
        el.scrollTop = el.scrollHeight;
    }

}

customElements.define("ootrt-mplogger", MPLogger);
