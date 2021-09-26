
// GameTrackerJS
import DataSync from "/GameTrackerJS/data/DataSync.js";
import Counter from "/GameTrackerJS/util/Counter.js";
import Savestate from "/GameTrackerJS/savestate/Savestate.js";

const muted = new Counter();
DataSync.addEventListener("message", (event) => {
    muted.add();
    if (event.data.type == "load") {
        const {state = {}} = event.data;
        Savestate.deserialize(state);
    } else if (event.data.type == "change") {
        const {category = "", data = {}} = event.data;
        Savestate.set(category, data);
    }
    muted.sub();
});
Savestate.addEventListener("change", (event) => {
    if (!muted.value) {
        const {category = "", data = {}} = event;
        DataSync.postMessage({type: "change", category, data});
    }
});
Savestate.addEventListener("load", (event) => {
    if (!muted.value) {
        const {data = {}} = event;
        DataSync.postMessage({type: "load", data});
    }
});
