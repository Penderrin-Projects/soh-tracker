import { Logic } from "./data/Logic";

export type LogicFile = {
    /**
     * the graph logic will be executed as a nearest fit graph, with unreachables never being executed
     * dependencies on other nodes are possible due to access awaiting functionality
     */
    edges: {
        /**
         * the source node of the edge
         * with a list of target nodes and the edge traverse logic
         */
        [key: string]: {
            [key: string]: Logic
        }
    },
    /**
     * mixins are executed on demand whenever needed
     * the resulting value will not be cached, in case values change in memory
     */
    logic: {
        [key: string]: Logic
    },
};


export type FutureLogicFile = {
    /**
     * the whole linear logic will be executed at once
     * dependencies on other entries are possible due to postcompile sorting
     */
    linear?: {
        [key: string]: Logic
    },
    /**
     * the graph logic will be executed as a nearest fit graph, with unreachables never being executed
     * dependencies on other nodes are possible due to access awaiting functionality
     * 
     * graph logic will always be executed after linear logic
     * linear logic can therefore be used as preprocessing step
     */
    graph?: {
        /**
         * the source node of the edge
         * with a list of target nodes and the edge traverse logic
         */
        [key: string]: {
            [key: string]: Logic
        }
    },
    /**
     * mixins are executed on demand whenever needed
     * the resulting value will not be cached, in case values change in memory
     */
    mixins?: {
        [key: string]: Logic
    },
};
