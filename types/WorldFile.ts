import { ExitDataList } from "./data/ExitData";
import { MarkerAreaList } from "./data/MarkerArea";
import { MarkerExitList } from "./data/MarkerExit";
import { MarkerLocationList } from "./data/MarkerLocation";

export interface WorldFile {
    overworld: MapData,
    area: {
        [key: string]: MapDataSpecial
    },
    subarea: {
        [key: string]: MapData
    },
    exit: ExitDataList,
    marker: {
        area: MarkerAreaList,
        subarea: MarkerAreaList,
        exit: MarkerExitList,
        subexit: MarkerExitList,
        location: MarkerLocationList
    }
};

export interface MapData {
    /**
     * path to an image shown as map background
     */
    background: string,
    width: number,
    height: number,
    list: WorldListEntry[]
};

export interface MapDataSpecial {
    /**
     * path to an image shown as map background
     */
    background: string,
    width: number,
    height: number,
    lists: {
        v: WorldListEntry[],
        mq?: WorldListEntry[]
    }
};

export interface WorldListEntry {
    category: "area" | "subarea" | "exit" | "subexit" | "location",
    /**
     * the marker id
     */
    id: string,
    /**
     * x position on the map
     */
    x: number,
    /**
     * y position on the map
     */
    y: number
};
