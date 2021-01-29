const spl = document.getElementById("splash").querySelector(".loading");
function updateLoadingMessage(msg = "loading...") {
    spl.innerHTML = msg;
}

function printError(msg = "Error", url = "index", line = 1) {
    //alert(`${msg}\n${url}:${line}`);
    updateLoadingMessage(msg);
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
                navigator.serviceWorker.removeEventListener("message", swStateRecieve);
            }
            updateLoadingMessage("add structure...");
            const r = await Import.html("/content/app.html");
            while (r.length > 0) {
                document.body.append(r[0]);
            }
            updateLoadingMessage("add style...");
            await Inject.css("/style/index.css");
            updateLoadingMessage("add script...");
            await Inject.module("/script/app.js");
        } catch(e) {
            printError(e);
        }
    }

    const swStateRecieve = (event) => {
        if (event.data.type == "state") {
            switch (event.data.msg) {
                case "start":
                    startApp();
                    break;
                case "need_download":
                    load_files = 0;
                    max_files = event.data.value;
                    updateLoadingMessage(`installing, please wait... 0/${max_files}`);
                    break;
                case "file_downloaded":
                    updateLoadingMessage(`installing, please wait... ${++load_files}/${max_files}`);
                    break;
            }
        }
    }
    
    updateLoadingMessage("loading...");

    if ("serviceWorker" in navigator) {
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
                navigator.serviceWorker.addEventListener("message", swStateRecieve);
                registration.active.postMessage("start");
            }
            callSW();
        }, function(err) {
            updateLoadingMessage("ServiceWorker registration failed");
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
