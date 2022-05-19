const ENTRANCES = [
    {
        "region.dmt_storms_grotto_entrance": "Death Mountain",
        "region.dmt_storms_grotto": "Storms Grotto"
    },
    {
        "region.dmt_cow_grotto_entrance": "Death Mountain",
        "region.dmt_cow_grotto": "Cow Grotto"
    },
    {
        "region.dmc_hammer_grotto_entrance": "Death Mountain Crater",
        "region.dmc_hammer_grotto": "Hammer Grotto"
    },
    {
        "region.dmc_upper_grotto_entrance": "Death Mountain Crater",
        "region.dmc_upper_grotto": "Bomb Grotto"
    },
    {
        "region.colossus_grotto_entrance": "Desert Colossus",
        "region.colossus_grotto": "Grotto"
    },
    {
        "region.gf_storms_grotto_entrance": "Gerudo Fortress",
        "region.gf_storms_grotto": "Storms Grotto"
    },
    {
        "region.gv_octorok_grotto_entrance": "Gerudo Valley",
        "region.gv_octorok_grotto": "Octorok Grotto"
    },
    {
        "region.gv_storms_grotto_entrance": "Gerudo Valley",
        "region.gv_storms_grotto": "Storms Grotto"
    },
    {
        "region.gc_grotto_entrance": "Goron City",
        "region.gc_grotto": "Grotto"
    },
    {
        "region.hc_storms_grotto_entrance": "Castle Grounds",
        "region.hc_storms_grotto": "Storms Grotto"
    },
    {
        "region.kak_redead_grotto_entrance": "Kakariko",
        "region.kak_redead_grotto": "Redead Grotto"
    },
    {
        "region.kak_open_grotto_entrance": "Kakariko",
        "region.kak_open_grotto": "Open Grotto"
    },
    {
        "region.kf_storms_grotto_entrance": "Kokiri Forest",
        "region.kf_storms_grotto": "Storms Grotto"
    },
    {
        "region.lh_grotto_entrance": "Lake Hylia",
        "region.lh_grotto": "Gravestone Grotto"
    },
    {
        "region.llr_grotto_entrance": "Lon Lon Ranch",
        "region.llr_grotto": "Grotto"
    },
    {
        "region.lw_near_shortcuts_grotto_entrance": "Lost Woods",
        "region.lw_near_shortcuts_grotto": "Near Goron Grotto"
    },
    {
        "region.lw_scrubs_grotto_entrance": "Lost Woods",
        "region.lw_scrubs_grotto": "Near Meadow Grotto"
    },
    {
        "region.deku_theater_entrance": "Lost Woods",
        "region.deku_theater": "Theatre Grotto"
    },
    {
        "region.sfm_fairy_grotto_entrance": "Sacred Forest Meadow",
        "region.sfm_fairy_grotto": "Fairy Grotto"
    },
    {
        "region.sfm_storms_grotto_entrance": "Sacred Forest Meadow",
        "region.sfm_storms_grotto": "Storms Grotto"
    },
    {
        "region.sfm_wolfos_grotto_entrance": "Sacred Forest Meadow",
        "region.sfm_wolfos_grotto": "Wolfos Grotto"
    },
    {
        "region.zr_fairy_grotto_entrance": "Zora's River",
        "region.zr_fairy_grotto": "Fairy Grotto"
    },
    {
        "region.zr_open_grotto_entrance": "Zora's River",
        "region.zr_open_grotto": "Open Grotto"
    },
    {
        "region.zr_storms_grotto_entrance": "Zora's River",
        "region.zr_storms_grotto": "Storms Grotto"
    },
    {
        "region.zd_storms_grotto_entrance": "Zora's Domain",
        "region.zd_storms_grotto": "Storms Grotto"
    },
    {
        "region.hf_fairy_grotto_entrance": "Hyrule Field",
        "region.hf_fairy_grotto": "Fairy Grotto"
    },
    {
        "region.hf_near_kak_grotto_entrance": "Hyrule Field",
        "region.hf_near_kak_grotto": "Near Kakariko Grotto"
    },
    {
        "region.hf_inside_fence_grotto_entrance": "Hyrule Field",
        "region.hf_inside_fence_grotto": "Inside Fence Grotto"
    },
    {
        "region.hf_open_grotto_entrance": "Hyrule Field",
        "region.hf_open_grotto": "Open Grotto"
    },
    {
        "region.hf_tektite_grotto_entrance": "Hyrule Field",
        "region.hf_tektite_grotto": "Diving Grotto"
    },
    {
        "region.hf_cow_grotto_entrance": "Hyrule Field",
        "region.hf_cow_grotto": "Cow Grotto"
    },
    {
        "region.hf_near_market_grotto_entrance": "Hyrule Field",
        "region.hf_near_market_grotto": "Near Market Grotto"
    },
    {
        "region.hf_southeast_grotto_entrance": "Hyrule Field",
        "region.hf_southeast_grotto": "Forest Grotto"
    },
    // graves
    {
        "region.graveyard_composers_grave_entrance": "Graveyard",
        "region.graveyard_royal_familys_tomb": "Royal Tomb"
    },
    {
        "region.graveyard_heart_piece_grave_entrance": "Graveyard",
        "region.graveyard_heart_piece_grave": "Redead Grave"
    },
    {
        "region.graveyard_shield_grave_entrance": "Graveyard",
        "region.graveyard_shield_grave": "Shield Grave"
    },
    // special
    {
        "region.graveyard_dampes_grave_entrance": "Graveyard",
        "region.graveyard_dampes_grave": "Dampes Grave"
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
