import AccessStateEnum from "../../enum/AccessStateEnum.js";

export default class EmptyState extends EventTarget {

    setAccess() {
        // empty
    }
    
    generateList() {
        // empty
    }

    getList() {
        return [];
    }

    getFilteredList() {
        return [];
    }

    get ref() {
        return "\u0000";
    }

    get areaData() {
        return {};
    }

    get access() {
        return {
            done: 0,
            unopened: 0,
            reachable: 0,
            entrances: false,
            value: AccessStateEnum.OPENED
        };
    }

}

export const emptyState = new EmptyState();
