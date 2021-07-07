// frameworks
import Template from "/emcJS/util/Template.js";


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

export default class HTMLTrackerSongList extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: "open"});
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
