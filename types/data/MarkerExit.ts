import { Logic } from "./Logic";

export interface MarkerExitList {
    [key: string]: MarkerExit
};

export interface MarkerExit {
    /**
     * logic access value
     * also pointer to exitData
     */
    access: string,
    /**
     * visibility check
     */
    visible: true | false | Logic,
    /**
     * filters for the list and badges
     */
    filter: {
        "filter.era": {
            "child": true | false,
            "adult": true | false
        },
        "filter.time": {
            "day": true | false,
            "night": true | false
        }
    },
    /**
     * array of categories for additional filters on top of types in entrance overview
     * 
     * this is a maybe, because the types could be enough already
     * like the directions for forest, fire, water, spirit and shadow as well as the castle with town and the field
     * 
     * e.g.:
     * ["forest"] for kokiri, sfm and woods
     * ["forest", "dungeon"] for deku
     */
    categories: string[],
    /**
     * path to an icon shown on the entries
     */
    icon: string
};