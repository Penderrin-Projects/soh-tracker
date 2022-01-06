/**
 * move to serverside earliest past 2022‑??‑??
 */

 import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";
 import "./StateConverter18.js";
 
 SavestateConverter.register(function(state) {
     state = state ?? {};
     const res = {
         data: {},
         extra: state.extra ?? {},
         notes: state.notes ?? state.data.notes ?? "",
         autosave: state.autosave ?? false,
         timestamp: state.timestamp ?? new Date(),
         name: state.name ?? ""
     };
     if (state.extra?.exits != null) {
         const buf = {};
         for (const i of Object.keys(state.extra.exits ?? {})) {
             const [k1, k2] = i.split(" -> ");
             const [v1, v2] = state.extra.exits[i].split(" -> ");
             buf[`${EXIT_TRANS[k1] || k1} -> ${EXIT_TRANS[k2] || k2}`] = `${EXIT_TRANS[v1] || v1} -> ${EXIT_TRANS[v2] || v2}`;
         }
         res.extra.exits = buf;
     }
     return res;
 });
 
 const EXIT_TRANS = {
     "region.graveyard_composers_grave": "region.graveyard_royal_familys_tomb"
 };
 