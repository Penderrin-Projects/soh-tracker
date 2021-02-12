/* asym-import: off */
import "/emcJS/ui/navigation/NavBar.js";
/* asym-import: on */

const NAV = document.querySelector("emc-navbar");
const PAGER = document.getElementById("view-pager");
const NAVIGATION = new Map();

class PageSwitcher {

    register(name, config) {
        NAVIGATION.set(name, config);
    }

    switch(name) {
        PAGER.active = name;
        if (NAVIGATION.has(name)) {
            NAV.loadNavigation(NAVIGATION.get(name));
        } else {
            NAV.loadNavigation([]);
        }
    }

}

export default new PageSwitcher();
