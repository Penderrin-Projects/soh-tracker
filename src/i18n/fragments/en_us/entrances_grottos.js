const ENTRANCES = [
    {
        "dmt_storms_grotto_entrance": "Death Mountain",
        "dmt_storms_grotto": "Storms Grotto"
    },
    {
        "dmt_cow_grotto_entrance": "Death Mountain",
        "dmt_cow_grotto": "Cow Grotto"
    },
    {
        "dmc_hammer_grotto_entrance": "Death Mountain Crater",
        "dmc_hammer_grotto": "Hammer Grotto"
    },
    {
        "dmc_upper_grotto_entrance": "Death Mountain Crater",
        "dmc_upper_grotto": "Bomb Grotto"
    },
    {
        "colossus_grotto_entrance": "Desert Colossus",
        "colossus_grotto": "Grotto"
    },
    {
        "gf_storms_grotto_entrance": "Gerudo Fortress",
        "gf_storms_grotto": "Storms Grotto"
    },
    {
        "gv_octorok_grotto_entrance": "Gerudo Valley",
        "gv_octorok_grotto": "Octorok Grotto"
    },
    {
        "gv_storms_grotto_entrance": "Gerudo Valley",
        "gv_storms_grotto": "Storms Grotto"
    },
    {
        "gc_grotto_entrance": "Goron City",
        "gc_grotto": "Grotto"
    },
    {
        "hc_storms_grotto_entrance": "Castle Grounds",
        "hc_storms_grotto": "Storms Grotto"
    },
    {
        "kak_redead_grotto_entrance": "Kakariko",
        "kak_redead_grotto": "Redead Grotto"
    },
    {
        "kak_open_grotto_entrance": "Kakariko",
        "kak_open_grotto": "Open Grotto"
    },
    {
        "kf_storms_grotto_entrance": "Kokiri Forest",
        "kf_storms_grotto": "Storms Grotto"
    },
    {
        "lh_grotto_entrance": "Lake Hylia",
        "lh_grotto": "Gravestone Grotto"
    },
    {
        "llr_grotto_entrance": "Lon Lon Ranch",
        "llr_grotto": "Grotto"
    },
    {
        "lw_near_shortcuts_grotto_entrance": "Lost Woods",
        "lw_near_shortcuts_grotto": "Near Goron Grotto"
    },
    {
        "lw_scrubs_grotto_entrance": "Lost Woods",
        "lw_scrubs_grotto": "Near Meadow Grotto"
    },
    {
        "deku_theater_entrance": "Lost Woods",
        "deku_theater": "Theatre Grotto"
    },
    {
        "sfm_fairy_grotto_entrance": "Sacred Forest Meadow",
        "sfm_fairy_grotto": "Fairy Grotto"
    },
    {
        "sfm_storms_grotto_entrance": "Sacred Forest Meadow",
        "sfm_storms_grotto": "Storms Grotto"
    },
    {
        "sfm_wolfos_grotto_entrance": "Sacred Forest Meadow",
        "sfm_wolfos_grotto": "Wolfos Grotto"
    },
    {
        "zr_fairy_grotto_entrance": "Zora's River",
        "zr_fairy_grotto": "Fairy Grotto"
    },
    {
        "zr_open_grotto_entrance": "Zora's River",
        "zr_open_grotto": "Open Grotto"
    },
    {
        "zr_storms_grotto_entrance": "Zora's River",
        "zr_storms_grotto": "Storms Grotto"
    },
    {
        "zd_storms_grotto_entrance": "Zora's Domain",
        "zd_storms_grotto": "Storms Grotto"
    },
    {
        "hf_fairy_grotto_entrance": "Hyrule Field",
        "hf_fairy_grotto": "Fairy Grotto"
    },
    {
        "hf_near_kak_grotto_entrance": "Hyrule Field",
        "hf_near_kak_grotto": "Near Kakariko Grotto"
    },
    {
        "hf_inside_fence_grotto_entrance": "Hyrule Field",
        "hf_inside_fence_grotto": "Inside Fence Grotto"
    },
    {
        "hf_open_grotto_entrance": "Hyrule Field",
        "hf_open_grotto": "Open Grotto"
    },
    {
        "hf_tektite_grotto_entrance": "Hyrule Field",
        "hf_tektite_grotto": "Diving Grotto"
    },
    {
        "hf_cow_grotto_entrance": "Hyrule Field",
        "hf_cow_grotto": "Cow Grotto"
    },
    {
        "hf_near_market_grotto_entrance": "Hyrule Field",
        "hf_near_market_grotto": "Near Market Grotto"
    },
    {
        "hf_southeast_grotto_entrance": "Hyrule Field",
        "hf_southeast_grotto": "Forest Grotto"
    },
    // graves
    {
        "graveyard_composers_grave_entrance": "Graveyard",
        "graveyard_royal_familys_tomb": "Royal Tomb"
    },
    {
        "graveyard_heart_piece_grave_entrance": "Graveyard",
        "graveyard_heart_piece_grave": "Redead Grave"
    },
    {
        "graveyard_shield_grave_entrance": "Graveyard",
        "graveyard_shield_grave": "Shield Grave"
    },
    // special
    {
        "graveyard_dampes_grave_entrance": "Graveyard",
        "graveyard_dampes_grave": "Dampes Grave"
    }
];

export default function() {
    const result = {};
    for (const entry of ENTRANCES) {
        const keys = Object.entries(entry);
        result[`exit[${keys[0][0]} -> ${keys[1][0]}]`]      = `${keys[0][1]} To ${keys[1][1]}`;
        result[`entrance[${keys[0][0]} -> ${keys[1][0]}]`]  = `${keys[0][1]} From ${keys[1][1]}`;
        result[`exit[${keys[1][0]} -> ${keys[0][0]}]`]      = `${keys[1][1]} To ${keys[0][1]}`;
        result[`entrance[${keys[1][0]} -> ${keys[0][0]}]`]  = `${keys[1][1]} From ${keys[0][1]}`;
    }
    return result;
}
