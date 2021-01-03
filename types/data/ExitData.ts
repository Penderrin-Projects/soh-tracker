import { Logic } from "./Logic";

export type ExitDataList = {
    [key: string]: ExitData
};

export type ExitData = {
    /**
     * the type of the entrance
     */
    type: string,
    /**
     * the default target entrance
     */
    target: string,
    /**
     * array of types to bind to
     * this makes the types more granular
     *
     * e.g.:
     * ["dungeon"] for dungeon
     * or
     * ["interior", "grotto", "overworld"] for spawn, owl_drop and warp
     */
    bindsTo: string[],
    /**
     * ignores if entrances are already bound to anything or just to others
     */
    ignoreBound: true | false | "others",
    /**
     * the logic to decide wether this entrance is activated
     */
    active: true | false | Logic,
    /**
     * ignores if entrances are marked as inactive, so they can still be bound
     */
    includeInactiveEntrances: true | false,
    /**
     * area this exit represents
     */
    area: string
};