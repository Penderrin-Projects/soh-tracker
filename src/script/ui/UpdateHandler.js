// frameworks
import Template from "/emcJS/util/html/Template.js";
import CustomElement from "/emcJS/ui/CustomElement.js";
import "/emcJS/ui/input/InputWrapper.js";


const TPL = new Template(`
    <div id="update-check" style="padding: 5px;">
        checking for new version...
    </div>
    <div id="update-available" style="padding: 5px; display: none;">
        newer version found
        <br>
        <emc-input-wrapper>
            <button id="download-update">download</button>
            <a href="CHANGELOG.MD?nosw" target="_BLANK">see the changelog</a>
        </emc-input-wrapper>
    </div>
    <div id="update-unavailable" style="padding: 5px; display: none;">
        already up to date 
        <br>
        <emc-input-wrapper>
            <button id="check-update">check again</button>
        </emc-input-wrapper>
    </div>
    <div id="update-running" style="padding: 5px; display: none;">
        <progress id="update-progress" value="0" max="0"></progress>
        <span id="update-progress-text">0/0</span>
    </div>
    <div id="update-finished" style="padding: 5px; display: none;">
        you need to reload for the new version to apply...
        <br>
        <emc-input-wrapper>
            <button onclick="window.location.reload()">reload now</button>
        </emc-input-wrapper>
    </div>
    <div id="update-force" style="padding: 5px; display: none;">
        if files seem corrupt, you can try this
        <br>
        <emc-input-wrapper>
            <button id="download-forced">force download</button>
        </emc-input-wrapper>
    </div>
`);

export default class UpdateHandler extends CustomElement {

    constructor() {
        super();
        if ("serviceWorker" in navigator) {
            this.shadowRoot.append(TPL.generate());

            const prog = this.shadowRoot.getElementById("update-progress");
            const progtext = this.shadowRoot.getElementById("update-progress-text");

            const check = this.shadowRoot.getElementById("update-check");
            const force = this.shadowRoot.getElementById("update-force");
            const avail = this.shadowRoot.getElementById("update-available");
            const unavail = this.shadowRoot.getElementById("update-unavailable");
            const running = this.shadowRoot.getElementById("update-running");
            const finished = this.shadowRoot.getElementById("update-finished");

            navigator.serviceWorker.addEventListener("message", (event) => {
                if (event.data.type == "state") {
                    switch (event.data.msg) {
                        case "update_available": {
                            check.style.display = "none";
                            force.style.display = "block";
                            avail.style.display = "block";
                            unavail.style.display = "none";
                            running.style.display = "none";
                            finished.style.display = "none";
                            this.dispatchEvent(new Event("updateavailable"));
                        } break;
                        case "update_unavailable": {
                            check.style.display = "none";
                            force.style.display = "block";
                            avail.style.display = "none";
                            unavail.style.display = "block";
                            running.style.display = "none";
                            finished.style.display = "none";
                        } break;
                        case "need_download": {
                            const max_files = event.data.total;
                            prog.max = max_files;
                            prog.value = 0;
                            progtext.innerHTML = `0/${max_files}`;
                        } break;
                        case "file_downloaded": {
                            const load_files = event.data.loaded;
                            const max_files = event.data.total;
                            prog.max = max_files;
                            prog.value = load_files;
                            progtext.innerHTML = `${load_files}/${max_files}`;
                        } break;
                        case "update_finished": {
                            prog.value = 0;
                            prog.max = 0;
                            progtext.innerHTML = `0/0`;
                            check.style.display = "none";
                            force.style.display = "none";
                            avail.style.display = "none";
                            unavail.style.display = "none";
                            running.style.display = "none";
                            finished.style.display = "block";
                        } break;
                    }
                } else if (event.data.type == "error") {
                    check.style.display = "none";
                    force.style.display = "block";
                    avail.style.display = "none";
                    unavail.style.display = "block";
                    running.style.display = "none";
                    finished.style.display = "none";
                    this.dispatchEvent(new Event("noconnection"));
                }
            
                this.shadowRoot.getElementById("check-update").onclick = function() {
                    this.checkUpdate();
                }.bind(this);
            
                this.shadowRoot.getElementById("download-update").onclick = function() {
                    check.style.display = "none";
                    force.style.display = "none";
                    avail.style.display = "none";
                    unavail.style.display = "none";
                    running.style.display = "block";
                    finished.style.display = "none";
                    navigator.serviceWorker.getRegistration().then(function(registration) {
                        registration.active.postMessage("update");
                    });
                }
            
                this.shadowRoot.getElementById("download-forced").onclick = function() {
                    check.style.display = "none";
                    force.style.display = "none";
                    avail.style.display = "none";
                    unavail.style.display = "none";
                    running.style.display = "block";
                    finished.style.display = "none";
                    navigator.serviceWorker.getRegistration().then(function(registration) {
                        registration.active.postMessage("forceupdate");
                    });
                }
            });
        }
    }

    checkUpdate() {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistration().then(function(registration) {
                registration.active.postMessage("check");
            });
        }
    }

}

customElements.define("ootrt-updatehandler", UpdateHandler);
