
// frameworks
import "/emcJS/ui/layout/Layout.js";

// GameTrackerJS
import Language from "/GameTrackerJS/util/Language.js";
import SettingsStorage from "/GameTrackerJS/storage/SettingsStorage.js";
import "/GameTrackerJS/util/sync/StorageSyncSlave.js";
// -------------
import LayoutsResource from "/script/resource/LayoutsResource.js";
import "/script/ui/panel/itemgrid/ItemGrid.js";
import "/script/ui/panel/worldlist/WorldList.js";
import "/script/ui/panel/worldmap/WorldMap.js";
import "/script/ui/panel/dungeonstate/DungeonState.js";
import "./styles.js";

try {
    // load current language
    await Language.load(SettingsStorage.get("language"), "en_us");
    // load layout
    const conf = decodeURI(window.location.hash.slice(1));
    const layout = LayoutsResource.get(conf);
    const el = document.getElementById("layout");
    el.loadLayout(layout);
    const waw = window.outerWidth - window.innerWidth;
    const wah = window.outerHeight - window.innerHeight;
    window.resizeTo(waw + el.clientWidth, wah + el.clientHeight);
} catch (err) {
    console.error(err);
}
