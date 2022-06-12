const ENTRANCES = [
    {
        "market_bazaar_entrance": "Market",
        "market_bazaar": "Child Bazaar"
    },
    {
        "market_bombchu_bowling_entrance": "Market",
        "market_bombchu_bowling": "Bombchu Bowling"
    },
    {
        "market_mask_shop_entrance": "Market",
        "market_mask_shop": "Mask Shop"
    },
    {
        "market_potion_shop_entrance": "Market",
        "market_potion_shop": "Child Potion Shop"
    },
    {
        "market_shooting_gallery_entrance": "Market",
        "market_shooting_gallery": "Child Shooting Gallery"
    },
    {
        "market_treasure_chest_game_entrance": "Market",
        "market_treasure_chest_game": "Chest Game"
    },
    {
        "market_bombchu_shop_entrance": "Market Backalley",
        "market_bombchu_shop": "Bombchu Shop"
    },
    {
        "market_man_in_green_house_entrance": "Market Backalley",
        "market_man_in_green_house": "Back House"
    },
    {
        "market_guard_house_entrance": "Market Entrance",
        "market_guard_house": "Guard Tower"
    },
    {
        "gv_carpenter_tent_entrance": "Gerudo Valley",
        "gv_carpenter_tent": "Tent"
    },
    {
        "gc_shop_entrance": "Goron City",
        "gc_shop": "Goron Shop"
    },
    {
        "graveyard_dampes_house_entrance": "Graveyard",
        "graveyard_dampes_house": "Dampes House"
    },
    {
        "kak_impas_house_entrance": "Kakariko",
        "kak_impas_house": "Impas House"
    },
    {
        "kak_impas_house_back_entrance": "Kakariko",
        "kak_impas_house_back": "Impas House Back"
    },
    {
        "kak_carpenter_boss_house_entrance": "Kakariko",
        "kak_carpenter_boss_house": "Carpenter Boss House"
    },
    {
        "kak_house_of_skulltula_entrance": "Kakariko",
        "kak_house_of_skulltula": "Skulltula House"
    },
    {
        "kak_bazaar_entrance": "Kakariko",
        "kak_bazaar": "Adult Bazaar Entrance"
    },
    {
        "kak_shooting_gallery_entrance": "Kakariko",
        "kak_shooting_gallery": "Adult Shooting Gallery"
    },
    {
        "kak_windmill_entrance": "Kakariko",
        "kak_windmill": "Windmill"
    },
    {
        "kak_odd_medicine_building_entrance": "Kakariko",
        "kak_odd_medicine_building": "Odd Medicine Building"
    },
    {
        "kf_house_of_twins_entrance": "Kokiri Forest",
        "kf_house_of_twins": "Twins House"
    },
    {
        "kf_know_it_all_house_entrance": "Kokiri Forest",
        "kf_know_it_all_house": "Know It All House"
    },
    {
        "kf_kokiri_shop_entrance": "Kokiri Forest",
        "kf_kokiri_shop": "Kokiri Shop"
    },
    {
        "kf_midos_house_entrance": "Kokiri Forest",
        "kf_midos_house": "Midos House"
    },
    {
        "kf_sarias_house_entrance": "Kokiri Forest",
        "kf_sarias_house": "Sarias House"
    },
    {
        "lh_fishing_hole_entrance": "Lake Hylia",
        "lh_fishing_hole": "Fishing Hole"
    },
    {
        "lh_lab_entrance": "Lake Hylia",
        "lh_lab": "Lab"
    },
    {
        "llr_stables_entrance": "Lon Lon Ranch",
        "llr_stables": "Stables"
    },
    {
        "llr_tower_entrance": "Lon Lon Ranch",
        "llr_tower": "Silo"
    },
    {
        "llr_talons_house_entrance": "Lon Lon Ranch",
        "llr_talons_house": "Talons House"
    },
    {
        "zd_shop_entrance": "Zora's Domain",
        "zd_shop": "Zora Shop"
    },
    // great fairies
    {
        "dmc_great_fairy_fountain_entrance": "Death Mountain Crater",
        "dmc_great_fairy_fountain": "Great Fairy"
    },
    {
        "dmt_great_fairy_fountain_entrance": "Death Mountain",
        "dmt_great_fairy_fountain": "Great Fairy"
    },
    {
        "colossus_great_fairy_fountain_entrance": "Desert Colossus",
        "colossus_great_fairy_fountain": "Great Fairy"
    },
    {
        "ogc_great_fairy_fountain_entrance": "Castle Grounds",
        "ogc_great_fairy_fountain": "Adult Great Fairy"
    },
    {
        "hc_great_fairy_fountain_entrance": "Castle Grounds",
        "hc_great_fairy_fountain": "Child Great Fairy"
    },
    {
        "zf_great_fairy_fountain_entrance": "Zora's Fountain",
        "zf_great_fairy_fountain": "Great Fairy"
    },
    // special
    {
        "kak_potion_shop_front_entrance": "Kakariko",
        "kak_potion_shop_front": "Adult Potion Shop"
    },
    {
        "kak_potion_shop_back_entrance": "Kakariko",
        "kak_potion_shop_back": "Adult Potion Shop Back"
    },
    {
        "kf_links_house_entrance": "Kokiri Forest",
        "kf_links_house": "Links House"
    },
    {
        "tot_entrance": "Temple of Time Plaza",
        "temple_of_time": "Temple of Time"
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
