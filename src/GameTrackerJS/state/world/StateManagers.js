let AREA = null;
let ENTRANCE = null;
let EXIT = null;
let LOCATION = null;
let SUBAREA = null;
let SUBEXIT = null;

class StateManagers {

    set area(value) {
        if (AREA == null) {
            AREA = value;
        }
    }

    get area() {
        return AREA;
    }

    set entrance(value) {
        if (ENTRANCE == null) {
            ENTRANCE = value;
        }
    }

    get entrance() {
        return ENTRANCE;
    }

    set exit(value) {
        if (EXIT == null) {
            EXIT = value;
        }
    }

    get exit() {
        return EXIT;
    }

    set location(value) {
        if (LOCATION == null) {
            LOCATION = value;
        }
    }

    get location() {
        return LOCATION;
    }

    set subarea(value) {
        if (SUBAREA == null) {
            SUBAREA = value;
        }
    }

    get subarea() {
        return SUBAREA;
    }

    set subexit(value) {
        if (SUBEXIT == null) {
            SUBEXIT = value;
        }
    }

    get subexit() {
        return SUBEXIT;
    }

}

export default new StateManagers();
