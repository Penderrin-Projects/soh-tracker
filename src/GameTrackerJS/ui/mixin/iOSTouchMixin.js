/* asym-import: off */
import {registerMixin} from "/emcJS/util/Mixin.js";
/* asym-import: on */
import iOSTouchHandler from "../../util/iOSTouchHandler.js";

export default registerMixin((superclass) => class iOSTouchMixin extends superclass {

    constructor(...args) {
        super(...args);
        /* fck iOS */
        iOSTouchHandler.register(this);
    }

});
