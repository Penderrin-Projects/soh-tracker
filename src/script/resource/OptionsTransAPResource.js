import JSONCResource from "/emcJS/data/resource/file/JSONCResource.js";

const data = await JSONCResource.get("/database/options_trans_ap.json");

export default data;
