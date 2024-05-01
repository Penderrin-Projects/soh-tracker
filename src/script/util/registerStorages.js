import ObservableDefaultingStorage from "/emcJS/data/storage/observable/ObservableDefaultingStorage.js";
import ObservableDefaultValueStorage from "/emcJS/data/storage/observable/ObservableDefaultValueStorage.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";

import SongsResource from "/script/resource/SongsResource.js";

// dungeons
Savestate.registerStorage("dungeonRewards", new ObservableDefaultValueStorage(""));

// shops
Savestate.registerStorage("shopItems", new ObservableDefaultValueStorage(""));
Savestate.registerStorage("shopItemsPrice", new ObservableDefaultValueStorage(0));
Savestate.registerStorage("shopItemsBought", new ObservableDefaultValueStorage(false));
Savestate.registerStorage("shopItemsName", new ObservableDefaultValueStorage(""));

// gossipstones
Savestate.registerStorage("gossipstoneItems", new ObservableDefaultValueStorage(""));
Savestate.registerStorage("gossipstoneLocations", new ObservableDefaultValueStorage(""));

// songs
const songNotesStorage = new ObservableDefaultingStorage();
const songData = SongsResource.get();
for (const ref in songData) {
    songNotesStorage.setDefault(ref, songData[ref].notes);
}
Savestate.registerStorage("songNotes", songNotesStorage);

// --> register to logic caller
LogicCaller.registerStorage(Savestate.getStorage("songNotes"), "songnotes[", "]");
LogicCaller.registerStorage(Savestate.getStorage("shopItems"), "shopslot[", "]");
