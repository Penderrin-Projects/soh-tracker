export type Logic = LogicBoolaean | LogicString | LogicNumber |
                    LogicMemoryValue | LogicMemoryPointer |
                    LogicMemoryState | MultiElLogic |
                    TwoElLogic | MathMinMax | MathComparators |
                    MultiElMath | TwoElMath | InterLogicDependency |
                    LogicMixin;

export interface LogicBoolaean {
    type: "true" | "false"
};

export interface LogicString {
    type: "string",
    el: string
};

export interface LogicNumber {
    type: "number",
    el: number
};

export interface LogicMemoryValue {
    type: "value",
    el: string // identifier where a value is stored
};

export interface LogicMemoryPointer {
    type: "pointer",
    el: string // pointer to an identifier where a value is stored
};

export interface LogicMemoryState {
    type: "state",
    el: string, // identifier where a value is stored
    value: string // expected value
};

export interface MultiElLogic {
    type: "and" | "nand" | "or" | "nor",
    el: Logic[]
};

export interface TwoElLogic {
    type: "xor" | "xnor",
    el: [Logic, Logic]
};

export interface MathMinMax {
    type: "min" | "max",
    el: string, // identifier where a value is stored
    value: number // compare to value
};

export interface MathComparators {
    type: "eq" | "neq" | "lt" | "lte" | "gt" | "gte",
    el: [Logic, Logic]
};

export interface MultiElMath {
    type: "add" | "sub" | "mul" | "div" | "mod",
    el: Logic[]
};

export interface TwoElMath {
    type: "pow",
    el: [Logic, Logic]
};

export interface InterLogicDependency {
    type: "at",
    node: string, // identifier to a Logic node
    el?: Logic
};

export interface LogicMixin {
    type: "mixin",
    el: string // identifier of a mixin to execute
};