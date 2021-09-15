// frameworks
import Panel from "/emcJS/ui/layout/Panel.js";

// GameTrackerJS
import GTWorldMap from "/GameTrackerJS/ui/panel/worldmap/WorldMap.js";

// Track-OOT
import "../../../state/world/WorldStates.js";
// import "./listitems/Button.js";
// import "./listitems/TypeButton.js";
// import "./listitems/Location.js";
// import "./listitems/Gossipstone.js";
// import "./listitems/ShopSlot.js";
// import "./listitems/Area.js";
// import "./listitems/SubArea.js";
// import "./listitems/Exit.js";
// import "./listitems/SubExit.js";
// import "./listitems/ListCollection.js";
// import "../dungeonstate/DungeonType.js";

export default class WorldMap extends GTWorldMap {
    
}

Panel.registerReference("worldmap", WorldMap);
customElements.define("ootrt-worldmap", WorldMap);
