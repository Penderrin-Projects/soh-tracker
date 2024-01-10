import LogicCaller from "/GameTrackerJS/util/logic/LogicCaller.js";
import "./AugmentOptions.js";

const SONGS = [
    "song_zelda",
    "song_epona",
    "song_saria",
    "song_sun",
    "song_time",
    "song_storm",
    "warp_forest",
    "warp_fire",
    "warp_water",
    "warp_spirit",
    "warp_shadow",
    "warp_light"
];

export function augment(cache) {
    // augment zoras letter
    if (cache.hasChange("option[shuffle_individual_ocarina_notes]") ||
        cache.hasChange("item[ocarina_a_button]") ||
        cache.hasChange("item[ocarina_up_button]") ||
        cache.hasChange("item[ocarina_down_button]") ||
        cache.hasChange("item[ocarina_left_button]") ||
        cache.hasChange("item[ocarina_right_button]") ||
        cache.hasChange("songnotes[song_zelda]") ||
        cache.hasChange("songnotes[song_epona]") ||
        cache.hasChange("songnotes[song_saria]") ||
        cache.hasChange("songnotes[song_sun]") ||
        cache.hasChange("songnotes[song_time]") ||
        cache.hasChange("songnotes[song_storm]") ||
        cache.hasChange("songnotes[warp_forest]") ||
        cache.hasChange("songnotes[warp_fire]") ||
        cache.hasChange("songnotes[warp_water]") ||
        cache.hasChange("songnotes[warp_spirit]") ||
        cache.hasChange("songnotes[warp_shadow]") ||
        cache.hasChange("songnotes[warp_light]")
    ) {
        const areNotesShuffled = cache.get("option[shuffle_individual_ocarina_notes]");
        if (areNotesShuffled) {
            const hasA = cache.get("item[ocarina_a_button]");
            const hasU = cache.get("item[ocarina_up_button]");
            const hasD = cache.get("item[ocarina_down_button]");
            const hasL = cache.get("item[ocarina_left_button]");
            const hasR = cache.get("item[ocarina_right_button]");

            // cache.set("calculated[has_all_notes_for_song(song_woods)]", hasA && hasU && hasD && hasL && hasR);
            // cache.set("calculated[has_all_notes_for_song(song_frogs)]", hasA && hasU && hasD && hasL && hasR);
            cache.set("calculated[has_all_notes_for_song(song_scarecrow)]", (hasA + hasU + hasD + hasL + hasR) > 2);

            for (const ref of SONGS) {
                if (ref === "scarecrow" || ref === "woods" || ref === "frogs") {
                    continue;
                }
                const notes = cache.get(`songnotes[${ref}]`) ?? "";
                if (!hasA && notes.includes("A")) {
                    cache.set(`calculated[has_all_notes_for_song(${ref})]`, false);
                    continue;
                }
                if (!hasU && notes.includes("U")) {
                    cache.set(`calculated[has_all_notes_for_song(${ref})]`, false);
                    continue;
                }
                if (!hasD && notes.includes("D")) {
                    cache.set(`calculated[has_all_notes_for_song(${ref})]`, false);
                    continue;
                }
                if (!hasL && notes.includes("L")) {
                    cache.set(`calculated[has_all_notes_for_song(${ref})]`, false);
                    continue;
                }
                if (!hasR && notes.includes("R")) {
                    cache.set(`calculated[has_all_notes_for_song(${ref})]`, false);
                    continue;
                }
                cache.set(`calculated[has_all_notes_for_song(${ref})]`, true);
            }
        }
    }
}

LogicCaller.registerAugment(augment);
