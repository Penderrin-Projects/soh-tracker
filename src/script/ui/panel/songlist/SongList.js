// frameworks
import GlobalStyle from "/emcJS/util/html/GlobalStyle.js";
import Panel from "/emcJS/ui/layout/Panel.js";

// Track-OOT
import SongsResource from "/script/resource/SongsResource.js";
import "./components/SongField.js";

const STYLE = new GlobalStyle(`
:host {
    display: inline-block;
    width: 300px;
    height: 300px;
}
`);

export default class SongList extends Panel {

    constructor() {
        super();
        STYLE.apply(this.shadowRoot);
        /* --- */
        const songs = SongsResource.get();
        for (const i in songs) {
            const el = document.createElement("ootrt-songfield");
            el.ref = i;
            this.shadowRoot.append(el);
        }
    }

}

Panel.registerReference("songlist", SongList);
customElements.define("ootrt-songlist", SongList);
