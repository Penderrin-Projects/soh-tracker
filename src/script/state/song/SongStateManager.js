// GameTrackerJS
import AbstractStateManager from "/GameTrackerJS/statemanager/AbstractStateManager.js";
// Track-OOT
import SongsResource from "/script/resource/SongsResource.js";
import DefaultSongState from "./DefaultSongState.js";

const resourceData = SongsResource.get();

class SongStateManager extends AbstractStateManager {

    constructor() {
        super(DefaultSongState, resourceData);
    }

}

export default new SongStateManager();
