
import FileData from "/emcJS/data/FileData.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";

const LogicsStorage = new IDBStorage('logics');
const LogicsStorageGlitched = new IDBStorage('logics_glitched');

const LOGIC_OPERATORS = [
    // literals
    "jse-logic-false",
    "jse-logic-true",
    // operators
    "jse-logic-not",
    "jse-logic-and",
    "jse-logic-nand",
    "jse-logic-or",
    "jse-logic-nor",
    "jse-logic-xor",
    "jse-logic-xnor",
    "jse-logic-min",
    "jse-logic-max",
    // comparators
    "jse-logic-eq",
    "jse-logic-gt",
    "jse-logic-gte",
    "jse-logic-lt",
    "jse-logic-lte",
    "jse-logic-neq",
    // math
    "jse-logic-add",
    "jse-logic-sub",
    "jse-logic-mul",
    "jse-logic-div",
    "jse-logic-mod",
    "jse-logic-pow"
];
const CUSTOM_OPERATOR_GROUP = [
    "location"
];

class LogicListsCreator {

    async createLists(glitched = false) {

        const result = {
            logics: [],
            operators: []
        };

        const world = FileData.get("world/marker");
        const items = FileData.get("items");
        const randomizer_options = FileData.get("options");
        const filter = FileData.get("filter");
        const logic = FileData.get(`logic${!!glitched?"_glitched":""}`);
        let custom_logic = {};
        if (!!glitched) {
            custom_logic = await LogicsStorageGlitched.getAll();
        } else {
            custom_logic = await LogicsStorage.getAll();
        }

        const mixins = {};
        const functions = {};
        
        if (!!logic) {
            for (const i in logic.logic) {
                if (i.startsWith("mixin.")) {
                    mixins[i] = logic[i];
                    continue;
                }
                if (i.startsWith("function.")) {
                    functions[i] = logic[i];
                    continue;
                }
            }
        }
        if (!!custom_logic) {
            for (const i in custom_logic.logic) {
                if (i.startsWith("mixin.")) {
                    mixins[i] = logic[i];
                    continue;
                }
                if (i.startsWith("function.")) {
                    functions[i] = logic[i];
                    continue;
                }
            }
        }

        // OPERATORS
        result.operators.push(createDefaultOperatorCategory());
        result.operators.push(createItemOperatorCategory(items));
        result.operators.push(createSettingsOperatorCategory(randomizer_options.options, "option"));
        result.operators.push(createSettingsOperatorCategory(randomizer_options.skips, "skip"));
        result.operators.push(createFilterOperatorCategory(filter));
        /*for (let cat of createOperatorWorldCategories(world)) {
            result.operators.push(cat);
        }*/
        result.operators.push(createOperatorLocationDoneCategory(world));
        
        for (const cat of createOperatorReachCategories(logic.edges)) {
            result.operators.push(cat);
        }

        result.operators.push(createOperatorMixins(mixins));
        result.operators.push(createOperatorFunctions(functions));
        
        // LOGICS
        //for (let cat of createLogicWorldCategories(world_lists, world)) {
        //    result.logics.push(cat);
        //}
        result.logics.push(createLogicGraphCategory(logic.edges, world));
        result.logics.push(createLogicMixinCategory(mixins));
        result.logics.push(createLogicFunctionCategory(functions));

        return result;
    }

}

export default new LogicListsCreator();

// OPERATORS
// -------------------
function createDefaultOperatorCategory() {
    const res = {
        "type": "group",
        "caption": "default",
        "children": []
    };
    for (const i in LOGIC_OPERATORS) {
        res.children.push({
            "type": LOGIC_OPERATORS[i]
        });
    }
    return res;
}

function createItemOperatorCategory(data) {
    const res = {
        "type": "group",
        "caption": "item",
        "children": []
    };
    for (const i in data) {
        res.children.push({
            "type": "tracker-logic-custom",
            "ref": i,
            "category": "item"
        });
    }
    return res;
}

function createFilterOperatorCategory(data, ref) {
    const res = {
        "type": "group",
        "caption": "filter",
        "children": []
    };
    for (const i in data) {
        const opt = data[i];
        for (const j of opt.values) {
            res.children.push({
                "type": "tracker-logic-custom",
                "ref": i,
                "value": j,
                "category": "filter"
            });
        }
    }
    return res;
}

function createSettingsOperatorCategory(data, ref) {
    const res = {
        "type": "group",
        "caption": ref,
        "children": []
    };
    for (const i in data) {
        const opt = data[i];
        if (!!opt.type && opt.type.startsWith("-")) continue;
        if (opt.type === "choice") {
            for (const j of opt.values) {
                res.children.push({
                    "type": "tracker-logic-custom",
                    "ref": i,
                    "value": j,
                    "category": ref
                });
            }
        } else {
            if (opt.type === "list") {
                for (const j of opt.values) {
                    res.children.push({
                        "type": "tracker-logic-custom",
                        "ref": j,
                        "category": ref
                    });
                }
            } else {
                res.children.push({
                    "type": "tracker-logic-custom",
                    "ref": i,
                    "category": ref
                });
            }
        }
    }
    return res;
}

function createOperatorReachCategories(data) {
    const lbuf = {
        "type": "group",
        "caption": "locations reach",
        "children": []
    };
    const rbuf = {
        "type": "group",
        "caption": "regions reach",
        "children": []
    };
    const ebuf = {
        "type": "group",
        "caption": "events reach",
        "children": []
    };
    for (const ref in data) {
        const sub = data[ref];
        for (const sref in sub) {
            if (sref.startsWith("logic.location.")) {
                lbuf.children.push({
                    "type": "tracker-logic-custom",
                    "ref": sref,
                    "category": "location"
                });
            } else if (sref.startsWith("region.")) {
                rbuf.children.push({
                    "type": "jse-logic-at",
                    "ref": sref,
                    "category": "region"
                });
            } else if (sref.startsWith("event.")) {
				ebuf.children.push({
                    "type": "tracker-logic-custom",
					"ref": sref,
					"category": "event"
				});
			}
        }
    }
    return [lbuf, rbuf, ebuf];
}

function createOperatorLocationDoneCategory(world) {
    const res = {
        "type": "group",
        "caption": "locations done",
        "children": []
    };
    for (const name in world) {
        const ref = world[name];
        if (ref.category == "location") {
            res.children.push({
                "type": "tracker-logic-custom",
                "ref": name,
                "category": "location"
            });
        }
    }
    return res;
}

function createOperatorMixins(data) {
    const res = {
        "type": "group",
        "caption": "mixin",
        "children": []
    };
    for (const ref in data) {
        res.children.push({
            "type": "tracker-logic-mixin",
            "ref": ref
        });
    }
    return res;
}

function createOperatorFunctions(data) {
    const res = {
        "type": "group",
        "caption": "function",
        "children": []
    };
    for (const ref in data) {
        res.children.push({
            "type": "tracker-logic-function",
            "ref": ref
        });
    }
    return res;
}

// LOGICS
// -------------------
function createLogicGraphCategory(data, world) {
    const resC = {
        "type": "group",
        "caption": "child",
        "children": []
    };
    const resA = {
        "type": "group",
        "caption": "adult",
        "children": []
    };
	const res = {
        "type": "group",
        "caption": "graph",
        "children": [resC, resA]
    };
    for (const ref in data) {
        const lbuf = {
            "type": "group",
            "caption": "locations",
            "children": []
        };
        const rbuf = {
            "type": "group",
            "caption": "regions",
            "children": []
        };
		const ebuf = {
			"type": "group",
			"caption": "events",
			"children": []
		};
        const sub = data[ref];
        if (ref.endsWith("[child]")) {
            for (const sref in sub) {
                if (sref.startsWith("logic.location.")) {
                    const name = sref.slice(6);
                    const loc = world[name];
                    if (!!loc) {
                        lbuf.children.push({
                            "type": loc.type,
                            "ref": `${ref} -> ${sref}`,
                            "category": "location",
                            "content": sref,
                            "icon": `/images/icons/${loc.type}.svg`
                        });
                    } else {
                        lbuf.children.push({
                            "ref": `${ref} -> ${sref}`,
                            "category": "location",
                            "content": sref
                        });
                    }
                } else if (sref.startsWith("region.")) {
                    rbuf.children.push({
                        "ref": `${ref} -> ${sref}`,
                        "category": "region",
                        "content": sref
                    });
                } else if (sref.startsWith("event.")) {
                    ebuf.children.push({
                        "ref": `${ref} -> ${sref}`,
                        "category": "event",
                        "content": sref
                    });
                }
            }
            const ch = [];
            if (!!lbuf.children.length) {
                ch.push(lbuf);
            }
            if (!!rbuf.children.length) {
                ch.push(rbuf);
            }
            if (!!ebuf.children.length) {
                ch.push(ebuf);
            }
            resC.children.push({
                "type": "group",
                "caption": ref,
                "children": ch
            });
		} else {
			for (const sref in sub) {
				if (sref.startsWith("logic.location.")) {
					const name = sref.slice(6);
					const loc = world[name];
					if (!!loc) {
						lbuf.children.push({
							"type": loc.type,
                            "ref": `${ref} -> ${sref}`,
							"category": "location",
							"content": sref,
							"icon": `/images/icons/${loc.type}.svg`
						});
					} else {
						lbuf.children.push({
                            "ref": `${ref} -> ${sref}`,
							"category": "location",
							"content": sref
						});
					}
				} else if (sref.startsWith("region.")) {
					rbuf.children.push({
                        "ref": `${ref} -> ${sref}`,
						"category": "region",
						"content": sref
					});
				} else if (sref.startsWith("event.")) {
					ebuf.children.push({
                        "ref": `${ref} -> ${sref}`,
						"category": "event",
						"content": sref
					});
				}
			}
			const ch = [];
			if (!!lbuf.children.length) {
				ch.push(lbuf);
			}
			if (!!rbuf.children.length) {
				ch.push(rbuf);
			}
			if (!!ebuf.children.length) {
				ch.push(ebuf);
			}
			resA.children.push({
				"type": "group",
				"caption": ref,
				"children": ch
			});
		}
	}
    return res;
}

function createLogicMixinCategory(data) {
    const resC = {
        "type": "group",
        "caption": "child",
        "children": []
    };
	const resA = {
        "type": "group",
        "caption": "adult",
        "children": []
    };
	const res = {
        "type": "group",
        "caption": "mixin",
        "children": [resC, resA]
    };
    for (const ref in data) {
		if(ref.endsWith("[child]")) {
			resC.children.push({
				"ref": ref,
				"category": "mixin",
				"content": ref
			});
		} else {
			resA.children.push({
				"ref": ref,
				"category": "mixin",
				"content": ref
			});
		}
    }
    return res;
}

function createLogicFunctionCategory(data) {
	const resC = {
        "type": "group",
        "caption": "child",
        "children": []
    };
	const resA = {
        "type": "group",
        "caption": "adult",
        "children": []
    };
    const res = {
        "type": "group",
        "caption": "function",
        "children": [resC, resA]
    };
    for (const ref in data) {
		if(ref.endsWith("[child]")) {
			resC.children.push({
				"ref": ref,
				"category": "function",
				"content": ref
			});
		} else {
			resA.children.push({
				"ref": ref,
				"category": "function",
				"content": ref
			});
		}
    }
    return res;
}