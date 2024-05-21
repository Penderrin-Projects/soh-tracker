import Panel from "/emcJS/ui/layout/Panel.js";
import LocationList from "/GameTrackerJS/ui/panel/locationlist/LocationList.js";
import "/script/state/StateTypesLoader.js";
import "./components/entries/TrackerLocationListLocation.js";
import "./components/entries/TrackerLocationListGossipstone.js";
import "./components/entries/TrackerLocationListShopSlot.js";

export default class TrackerLocationList extends LocationList {

}

Panel.registerReference("locationlist", TrackerLocationList);
customElements.define("ootrt-locationlist", TrackerLocationList);
