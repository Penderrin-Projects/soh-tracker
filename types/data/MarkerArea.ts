import { Logic } from "./Logic";

export type MarkerAreaList = {
    [key: string]: MarkerArea
};

export type MarkerArea = {
    /**
     * logic access value
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
     * path to an icon shown on the entries
     */
    icon: string
};