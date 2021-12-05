import Dialog from "/emcJS/ui/overlay/window/Dialog.js";

let send = false;

export default class spoilerErrorAlert {
    prepareDialog() {
        if(!send) {
            send = true;
        }
    }
    sendDialog() {
        if(send) {
            Dialog.alert("Spoiler Loaded Partially", "Not all settings in your spoiler log were loaded correctly.<br>Please report this issue on discord and provide the affected spoiler log.");
        }
    }
}