// frameworks
import {createMixin} from "/emcJS/util/Mixin.js";

import iOSTouchHandler from "../../util/iOSTouchHandler.js";

export default createMixin((superclass) => class iOSTouchMixin extends superclass {

    constructor(...args) {
        super(...args);
        /* fck iOS */
        iOSTouchHandler.register(this);
    }

});
