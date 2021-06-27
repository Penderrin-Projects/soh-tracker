let OVERWORLD = null;
let ENTRANCE = null;
const WORLD = {
    area: null,
    exit: null,
    location: null,
    subarea: null,
    subexit: null
};

class StateManagers {

    set overworld(value) {
        if (OVERWORLD == null) {
            OVERWORLD = value;
        } else {
            throw new Error("can only bind overworld once");
        }
    }

    set entrance(value) {
        if (ENTRANCE == null) {
            ENTRANCE = value;
        } else {
            throw new Error("can only bind entrance manager once");
        }
    }

    set area(value) {
        if (WORLD.area == null) {
            WORLD.area = value;
        } else {
            throw new Error("can only bind area manager once");
        }
    }

    set exit(value) {
        if (WORLD.exit == null) {
            WORLD.exit = value;
        } else {
            throw new Error("can only bind exit manager once");
        }
    }

    set location(value) {
        if (WORLD.location == null) {
            WORLD.location = value;
        } else {
            throw new Error("can only bind location manager once");
        }
    }

    set subarea(value) {
        if (WORLD.subarea == null) {
            WORLD.subarea = value;
        } else {
            throw new Error("can only bind subarea manager once");
        }
    }

    set subexit(value) {
        if (WORLD.subexit == null) {
            WORLD.subexit = value;
        } else {
            throw new Error("can only bind subexit manager once");
        }
    }

    getOverworld() {
        return OVERWORLD;
    }

    getEntrance(id) {
        return ENTRANCE.get(id);
    }

    get(category, id) {
        if (typeof category != "string") {
            throw new TypeError(`category parameter must be of type "string" but was "${typeof category}"`);
        }
        if (typeof id != "string") {
            throw new TypeError(`id parameter must be of type "string" but was "${typeof id}"`);
        }
        if (category == "" || category == "overworld") {
            return this.getOverworld();
        }
        const Manager = WORLD[category];
        if (Manager != null) {
            return Manager.get(id);
        } else {
            throw new Error(`manager for category "${category}" not initialized before usage`);
        }
    }

    getByRef(ref) {
        if (typeof ref != "string") {
            throw new TypeError(`ref parameter must be of type "string" but was "${typeof ref}"`);
        }
        if (ref == "" || ref == "overworld") {
            return this.getOverworld();
        }
        const [category, id] = ref.split("/");
        return this.get(category, id);
    }

}

export default new StateManagers();
