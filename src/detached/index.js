
// frameworks
import Import from "/emcJS/util/import/Import.js";
import EventBus from "/emcJS/event/EventBus.js";
import "/emcJS/ui/layout/Layout.js";


// GameTrackerJS
import Language from "/GameTrackerJS/util/Language.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
// -------------
import LayoutsResource from "/script/resource/LayoutsResource.js";
import "/script/ui/items/ItemGrid.js";
import "/script/ui/dungeonstate/DungeonState.js";
import "/script/ui/world/LocationList.js";
import "/script/ui/world/Map.js";

try {
    // load current language
    await Language.load(SettingsStorage.get("language"));
    // load layout
    const conf = decodeURI(window.location.hash.slice(1));
    const layout = LayoutsResource.get(conf);
    const el = document.getElementById("layout");
    el.loadLayout(layout);
    const waw = window.outerWidth - window.innerWidth;
    const wah = window.outerHeight - window.innerHeight;
    window.resizeTo(waw + el.clientWidth, wah + el.clientHeight);
    // shared worker
    if ("SharedWorker" in window) {
        const [EventBusModuleShare] = await Import.module("/emcJS/event/module/EventBusModuleShare.js");
        EventBus.addModule(EventBusModuleShare, {blacklist:["logic"]});
    }
    // notify parent
    EventBus.trigger("detached-window-created", {});
} catch(err) {
    console.error(err);
}
