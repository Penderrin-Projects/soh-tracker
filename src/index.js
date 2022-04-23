const NOSW = (new URL(location.href)).searchParams.get("nosw") !== null;

const spl = document.getElementById("loading-info");

function updateLoadingMessage(msg = "loading...", blockUpdates = false) {
    if (messageUpdateAllowed) {
        spl.innerHTML = msg;
        if (blockUpdates) {
            messageUpdateAllowed = false;
        }
    }
}

let messageUpdateAllowed = true;

function printError(msg = "Error", url = "index", line = 1) {
    //alert(`${msg}\n${url}:${line}`);
    updateLoadingMessage(msg, true);
    console.error(`${msg}\n${url}:${line}`);
    return false;
}

window.onerror = printError;

if (document.head.createShadowRoot || document.head.attachShadow) {
    let max_files = 0;
    let load_files = 0;

    const startApp = async () => {
        try {
            const {default: Inject} = await import("/emcJS/util/import/Inject.js");
            const {default: Import} = await import("/emcJS/util/import/Import.js");

            updateLoadingMessage("load framework...");
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.removeEventListener("message", swMsgRecieve);
            }
            updateLoadingMessage("add structure...");
            const r = await Import.html("/content/app.html");
            while (r.length > 0) {
                document.body.append(r[0]);
            }
            updateLoadingMessage("add style...");
            await Inject.css("/style/index.css");
            updateLoadingMessage("load app...");
            await Inject.module("/script/app.js");
        } catch(e) {
            printError(e);
        }
    }

    const swMsgRecieve = (event) => {
        if (event.data.type == "state") {
            switch (event.data.msg) {
                case "start":
                    startApp();
                    break;
                case "need_download":
                    load_files = 0;
                    max_files = event.data.total;
                    updateLoadingMessage(`installing, please wait... 0/${max_files}`);
                    break;
                case "file_downloaded":
                    load_files = event.data.loaded;
                    max_files = event.data.total;
                    updateLoadingMessage(`installing, please wait... ${load_files}/${max_files}`);
                    break;
            }
        } else if (event.data.type == "error") {
            console.error("recieved sw error:", event.data);
            updateLoadingMessage(`
                SW_ERR: ${event.data.msg}
                <br><br>
                if this error keeps coming up, try the following link to disable service worker<br>
                <a class="button" href="${location.origin}?nosw">NO SERVICEWORKER</a>
            `, true);
        }
    }
    
    updateLoadingMessage("loading...");

    if (!NOSW && "serviceWorker" in navigator) {
        const refBtn = document.getElementById("splash-refresh");
        refBtn.innerHTML = "FORCE DOWNLOAD";
        refBtn.onclick = function() {
            caches.keys().then(function(names) {
                for (const name of names) {
                    caches.delete(name);
                }
                window.location.reload();
            });
        };
        navigator.serviceWorker.register("/sw.js").then(function(registration) {
            updateLoadingMessage("call servant...");

            function callSW() {
                if (!registration.active) {
                    setTimeout(callSW, 10);
                    return;
                }
                navigator.serviceWorker.addEventListener("message", swMsgRecieve);
                registration.active.postMessage("start");
            }

            callSW();
        }, function(err) {
            updateLoadingMessage("ServiceWorker registration failed", true);
            console.log("ServiceWorker registration failed: ", err);
        });
    } else {
        updateLoadingMessage("start without service...");
        startApp();
    }
} else {
    updateLoadingMessage(`
        This website uses Shadow DOM.<br>
        Your Browser does not support them.<br>
        Please use a compatible Browser like Chrome, Edge (Blink), Firefox or Safari.
    `);
}
