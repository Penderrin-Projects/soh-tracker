export type Logic = LogicBoolaean | LogicString | LogicNumber |
                    LogicMemoryValue | LogicMemoryPointer |
                    LogicMemoryState | BoolMultiLogic |
                    BoolTwoElLogic | MathMinMax | MathComparators |
                    MultiElMath | TwoElMath | InterLogicDependency |
                    LogicMixin;

export type LogicBoolaean = {
    type: "true" | "false"
};

export type LogicString = {
    type: "string",
    el: string
};

export type LogicNumber = {
    type: "number",
    el: number
};

export type LogicMemoryValue = {
    type: "value",
    el: string // identifier where a value is stored
};

export type LogicMemoryPointer = {
    type: "pointer",
    el: string // pointer to an identifier where a value is stored
};

export type LogicMemoryState = {
    type: "state",
    el: string, // identifier where a value is stored
    value: string // expected value
};

export type BoolMultiLogic = {
    type: "and" | "nand" | "or" | "nor",
    el: Logic[]
};

export type BoolTwoElLogic = {
    type: "xor" | "xnor",
    el: [Logic, Logic]
};

export type MathMinMax = {
    type: "min" | "max",
    el: string, // identifier where a value is stored
    value: number // compare to value
};

export type MathComparators = {
    type: "eq" | "neq" | "lt" | "lte" | "gt" | "gte",
    el: [Logic, Logic]
};

export type MultiElMath = {
    type: "add" | "sub" | "mul" | "div" | "mod",
    el: Logic[]
};

export type TwoElMath = {
    type: "pow",
    el: [Logic, Logic]
};

export type InterLogicDependency = {
    type: "at",
    node: string, // identifier to a Logic node
    el?: Logic
};

export type LogicMixin = {
    type: "mixin",
    el: string // identifier of a mixin to execute
};