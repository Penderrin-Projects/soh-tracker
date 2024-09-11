import DataList from "/emcJS/ui/dataview/datalist/DataList.js";
import "./components/ChatListEntry.js";

export default class ChatList extends DataList {

    createListEntry() {
        return document.createElement("cc-downloadlist-entry");
    }

}

customElements.define("ootrt-chatlist", ChatList);
