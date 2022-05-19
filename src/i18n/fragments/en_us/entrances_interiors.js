const ENTRANCES = [
    {
        "region.market_bazaar_entrance": "Market",
        "region.market_bazaar": "Child Bazaar"
    },
    {
        "region.market_bombchu_bowling_entrance": "Market",
        "region.market_bombchu_bowling": "Bombchu Bowling"
    },
    {
        "region.market_mask_shop_entrance": "Market",
        "region.market_mask_shop": "Mask Shop"
    },
    {
        "region.market_potion_shop_entrance": "Market",
        "region.market_potion_shop": "Child Potion Shop"
    },
    {
        "region.market_shooting_gallery_entrance": "Market",
        "region.market_shooting_gallery": "Child Shooting Gallery"
    },
    {
        "region.market_treasure_chest_game_entrance": "Market",
        "region.market_treasure_chest_game": "Chest Game"
    },
    {
        "region.market_bombchu_shop_entrance": "Market Backalley",
        "region.market_bombchu_shop": "Bombchu Shop"
    },
    {
        "region.market_man_in_green_house_entrance": "Market Backalley",
        "region.market_man_in_green_house": "Back House"
    },
    {
        "region.market_guard_house_entrance": "Market Entrance",
        "region.market_guard_house": "Guard Tower"
    },
    {
        "region.gv_carpenter_tent_entrance": "Gerudo Valley",
        "region.gv_carpenter_tent": "Tent"
    },
    {
        "region.gc_shop_entrance": "Goron City",
        "region.gc_shop": "Goron Shop"
    },
    {
        "region.graveyard_dampes_house_entrance": "Graveyard",
        "region.graveyard_dampes_house": "Dampes House"
    },
    {
        "region.kak_impas_house_entrance": "Kakariko",
        "region.kak_impas_house": "Impas House"
    },
    {
        "region.kak_impas_house_back_entrance": "Kakariko",
        "region.kak_impas_house_back": "Impas House Back"
    },
    {
        "region.kak_carpenter_boss_house_entrance": "Kakariko",
        "region.kak_carpenter_boss_house": "Carpenter Boss House"
    },
    {
        "region.kak_house_of_skulltula_entrance": "Kakariko",
        "region.kak_house_of_skulltula": "Skulltula House"
    },
    {
        "region.kak_bazaar_entrance": "Kakariko",
        "region.kak_bazaar": "Adult Bazaar Entrance"
    },
    {
        "region.kak_shooting_gallery_entrance": "Kakariko",
        "region.kak_shooting_gallery": "Adult Shooting Gallery"
    },
    {
        "region.kak_windmill_entrance": "Kakariko",
        "region.kak_windmill": "Windmill"
    },
    {
        "region.kak_odd_medicine_building_entrance": "Kakariko",
        "region.kak_odd_medicine_building": "Odd Medicine Building"
    },
    {
        "region.kf_house_of_twins_entrance": "Kokiri Forest",
        "region.kf_house_of_twins": "Twins House"
    },
    {
        "region.kf_know_it_all_house_entrance": "Kokiri Forest",
        "region.kf_know_it_all_house": "Know It All House"
    },
    {
        "region.kf_kokiri_shop_entrance": "Kokiri Forest",
        "region.kf_kokiri_shop": "Kokiri Shop"
    },
    {
        "region.kf_midos_house_entrance": "Kokiri Forest",
        "region.kf_midos_house": "Midos House"
    },
    {
        "region.kf_sarias_house_entrance": "Kokiri Forest",
        "region.kf_sarias_house": "Sarias House"
    },
    {
        "region.lh_fishing_hole_entrance": "Lake Hylia",
        "region.lh_fishing_hole": "Fishing Hole"
    },
    {
        "region.lh_lab_entrance": "Lake Hylia",
        "region.lh_lab": "Lab"
    },
    {
        "region.llr_stables_entrance": "Lon Lon Ranch",
        "region.llr_stables": "Stables"
    },
    {
        "region.llr_tower_entrance": "Lon Lon Ranch",
        "region.llr_tower": "Silo"
    },
    {
        "region.llr_talons_house_entrance": "Lon Lon Ranch",
        "region.llr_talons_house": "Talons House"
    },
    {
        "region.zd_shop_entrance": "Zora's Domain",
        "region.zd_shop": "Zora Shop"
    },
    // great fairies
    {
        "region.dmc_great_fairy_fountain_entrance": "Death Mountain Crater",
        "region.dmc_great_fairy_fountain": "Great Fairy"
    },
    {
        "region.dmt_great_fairy_fountain_entrance": "Death Mountain",
        "region.dmt_great_fairy_fountain": "Great Fairy"
    },
    {
        "region.colossus_great_fairy_fountain_entrance": "Desert Colossus",
        "region.colossus_great_fairy_fountain": "Great Fairy"
    },
    {
        "region.ogc_great_fairy_fountain_entrance": "Castle Grounds",
        "region.ogc_great_fairy_fountain": "Adult Great Fairy"
    },
    {
        "region.hc_great_fairy_fountain_entrance": "Castle Grounds",
        "region.hc_great_fairy_fountain": "Child Great Fairy"
    },
    {
        "region.zf_great_fairy_fountain_entrance": "Zora's Fountain",
        "region.zf_great_fairy_fountain": "Great Fairy"
    },
    // special
    {
        "region.kak_potion_shop_front_entrance": "Kakariko",
        "region.kak_potion_shop_front": "Adult Potion Shop"
    },
    {
        "region.kak_potion_shop_back_entrance": "Kakariko",
        "region.kak_potion_shop_back": "Adult Potion Shop Back"
    },
    {
        "region.kf_links_house_entrance": "Kokiri Forest",
        "region.kf_links_house": "Links House"
    },
    {
        "region.tot_entrance": "Temple of Time Plaza",
        "region.temple_of_time": "Temple of Time"
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
