// GameTrackerJS
import SimpleStateManager from "../../../GameTrackerJS/statemanager/SimpleStateManager.js";
// Track-OOT
import DungeonstateResource from "/script/resource/DungeonstateResource.js";
import DefaultDungeonState from "./DefaultDungeonState.js";

const resourceData = DungeonstateResource.get();

const DungeonStateManager = new SimpleStateManager(DefaultDungeonState, resourceData);

export default DungeonStateManager;
