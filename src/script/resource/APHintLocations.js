import JSONCResource from "/emcJS/data/resource/file/JSONCResource.js";

const data = await JSONCResource.get("/database/ap_hint_locations.json");

export default data;
