import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import AreaStates from "/script/state/AreaStates.js";
import FilterMixin from "/script/state/mixins/FilterMixin.js";
import AreaStateEnum from "/script/enum/AreaStateEnum.js";
import WorldRegistry from "/script/state/WorldRegistry.js";

const AREA_DATA = new WeakMap();
const ACCESS = new WeakMap();
const TYPE = new WeakMap();

function stateLoaded(event) {
    const ref = this.ref;
    const props = this.props;
    // type
    if (props["maxmq"] != null && props.hasOwnProperty["related_dungeon"] != null) {
        const types = event.data.extra.dungeontype;
        if (types != null) {
            this.type = types[props.related_dungeon];
        } else {
            this.type = "n";
        }
    }
    // savesatate
    this.value = parseInt(event.data.state[ref]) || 0;
}

function stateChanged(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data[ref];
    if (change != null) {
        this.value = parseInt(change.newValue) || 0;
    }
}

function dungeonTypeUpdate(event) {
    const props = this.props;
    if (props["maxmq"] != null && props["related_dungeon"] != null) {
        const change = event.data[props.related_dungeon];
        if (change != null) {
            this.type = StateStorage.readExtra("dungeontype", props.related_dungeon, "n");
        }
    }
}

export default class DungeonState extends FilterMixin({}) {

    constructor(ref, props, areaData) {
        super(ref, props, AreaStateEnum);
        /* --- */
        AREA_DATA.set(this, areaData);
        ACCESS.set(AreaStateEnum.UNAVAILABLE);
        if (props["maxmq"] != null && props["related_dungeon"] != null) {
            this.type = StateStorage.readExtra("dungeontype", props.related_dungeon, "n");
        } else {
            this.type = "v";
        }
        /* EVENTS */
        EventBus.register("state", stateLoaded.bind(this));
        EventBus.register("statechange", stateChanged.bind(this));
        EventBus.register("statechange_dungeontype", dungeonTypeUpdate.bind(this));

        // TODO calculate value on location/subarea/subexit/logic change

        /* register */
        WorldRegistry.set(`area/${ref}`, this);
    }

    get areaData() {
        return AREA_DATA.get(this);
    }

    get access() {
        return ACCESS.get(this);
    }

    getFilteredList() {
        const areaData = AREA_DATA.get(this);
        const list = areaData.lists[this.type];
        if (list != null) {
            const result = [];
            list.forEach(record => {
                const id = `${record.category}/${record.id}`;
                const loc = WorldRegistry.get(id);
                if (!!loc && loc.visible) {
                    result.push(id);
                }
            });
            return result;
        }
    }

    set type(value) {
        const type = TYPE.get(this);
        TYPE.set(this, value);
        if (type != value) {
            const event = new Event("type");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get type() {
        return TYPE.get(this);
    }

}

AreaStates.register("dungeon", DungeonState);
AreaStates.register("boss_dungeon", DungeonState);
