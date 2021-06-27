/* asym-import: off */
import Context from "/emcJS/data/Context.js";
/* asym-import: on */

const GlobalContext = new Context();
/*global globalThis*/
globalThis.GlobalContext = GlobalContext;
export default GlobalContext;
