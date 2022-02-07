// frameworks
import Template from "/emcJS/util/html/Template.js";
import CustomElement from "/emcJS/ui/CustomElement.js";

// Track-OOT
import SongsResource from "/script/resource/SongsResource.js";
import "./SongField.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
        }
    </style>
`);

export default class HTMLTrackerSongList extends CustomElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        const songs = SongsResource.get();
        for (const i in songs) {
            const el = document.createElement("ootrt-songfield");
            el.ref = i;
            this.shadowRoot.append(el);
        }
    }

}

customElements.define("ootrt-songlist", HTMLTrackerSongList);
