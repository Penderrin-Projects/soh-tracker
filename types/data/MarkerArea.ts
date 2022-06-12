import { Logic } from "./Logic";

export interface MarkerAreaList {
    [key: string]: MarkerArea
};

export interface MarkerArea {
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
        "era": {
            "child": true | false,
            "adult": true | false
        },
        "time": {
            "day": true | false,
            "night": true | false
        }
    },
    /**
     * path to an icon shown on the entries
     */
    icon: string
};