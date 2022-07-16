const ENTRANCES = [
    {
        "market_bazaar_gateway": "Market",
        "bazaar_market_gateway": "Child Bazaar"
    },
    {
        "market_bombchu_bowling_gateway": "Market",
        "bombchu_bowling_market_gateway": "Bombchu Bowling"
    },
    {
        "market_mask_shop_gateway": "Market",
        "mask_shop_market_gateway": "Mask Shop"
    },
    {
        "market_potion_shop_gateway": "Market",
        "potion_shop_market_gateway": "Child Potion Shop"
    },
    {
        "market_shooting_gallery_gateway": "Market",
        "shooting_gallery_market_gateway": "Child Shooting Gallery"
    },
    {
        "market_treasure_chest_game_gateway": "Market",
        "treasure_chest_game_market_gateway": "Chest Game"
    },
    {
        "market_bombchu_shop_gateway": "Market Backalley",
        "bombchu_shop_market_gateway": "Bombchu Shop"
    },
    {
        "market_back_house_gateway": "Market Backalley",
        "back_house_market_gateway": "Back House"
    },
    {
        "market_guard_house_gateway": "Market Entrance",
        "guard_house_market_gateway": "Guard Tower"
    },
    {
        "valley_carpenter_tent_gateway": "Gerudo Valley",
        "carpenter_tent_valley_gateway": "Tent"
    },
    {
        "goron_shop_gateway": "Goron City",
        "shop_goron_gateway": "Goron Shop"
    },
    {
        "graveyard_dampes_house_gateway": "Graveyard",
        "dampes_house_graveyard_gateway": "Dampes House"
    },
    {
        "kakariko_impas_house_gateway": "Kakariko",
        "impas_house_kakariko_gateway": "Impas House"
    },
    {
        "kakariko_impas_back_gateway": "Kakariko",
        "impas_back_kakariko_gateway": "Impas House Back"
    },
    {
        "kakariko_carpenter_house_gateway": "Kakariko",
        "carpenter_house_kakariko_gateway": "Carpenter Boss House"
    },
    {
        "kakariko_skulltula_house_gateway": "Kakariko",
        "skulltula_house_kakariko_gateway": "Skulltula House"
    },
    {
        "kakariko_bazaar_gateway": "Kakariko",
        "bazaar_kakariko_gateway": "Adult Bazaar Entrance"
    },
    {
        "kakariko_shooting_gallery_gateway": "Kakariko",
        "shooting_gallery_kakariko_gateway": "Adult Shooting Gallery"
    },
    {
        "kakariko_windmill_gateway": "Kakariko",
        "windmill_kakariko_gateway": "Windmill"
    },
    {
        "kakariko_medicine_building_gateway": "Kakariko",
        "medicine_building_kakariko_gateway": "Odd Medicine Building"
    },
    {
        "kokiri_house_of_twins_gateway": "Kokiri Forest",
        "house_of_twins_kokiri_gateway": "Twins House"
    },
    {
        "kokiri_know_it_all_house_gateway": "Kokiri Forest",
        "know_it_all_house_kokiri_gateway": "Know It All House"
    },
    {
        "kokiri_kokiri_shop_gateway": "Kokiri Forest",
        "kokiri_shop_kokiri_gateway": "Kokiri Shop"
    },
    {
        "kokiri_midos_house_gateway": "Kokiri Forest",
        "midos_house_kokiri_gateway": "Midos House"
    },
    {
        "kokiri_sarias_house_gateway": "Kokiri Forest",
        "sarias_house_kokiri_gateway": "Sarias House"
    },
    {
        "lake_fishing_hole_gateway": "Lake Hylia",
        "fishing_hole_lake_gateway": "Fishing Hole"
    },
    {
        "lake_lab_gateway": "Lake Hylia",
        "lab_lake_gateway": "Lab"
    },
    {
        "ranch_stables_gateway": "Lon Lon Ranch",
        "stables_ranch_gateway": "Stables"
    },
    {
        "ranch_tower_gateway": "Lon Lon Ranch",
        "tower_ranch_gateway": "Silo"
    },
    {
        "ranch_talons_house_gateway": "Lon Lon Ranch",
        "talons_house_ranch_gateway": "Talons House"
    },
    {
        "zora_shop_gateway": "Zora's Domain",
        "shop_zora_gateway": "Zora Shop"
    },
    // great fairies
    {
        "crater_great_fairy_gateway": "Death Mountain Crater",
        "great_fairy_crater_gateway": "Great Fairy"
    },
    {
        "mountain_great_fairy_gateway": "Death Mountain",
        "great_fairy_mountain_gateway": "Great Fairy"
    },
    {
        "colossus_great_fairy_gateway": "Desert Colossus",
        "great_fairy_colossus_gateway": "Great Fairy"
    },
    {
        "ganon_grounds_great_fairy_gateway": "Castle Grounds",
        "great_fairy_ganon_grounds_gateway": "Adult Great Fairy"
    },
    {
        "grounds_great_fairy_gateway": "Castle Grounds",
        "great_fairy_grounds_gateway": "Child Great Fairy"
    },
    {
        "fountain_great_fairy_gateway": "Zora's Fountain",
        "great_fairy_fountain_gateway": "Great Fairy"
    },
    // special
    {
        "kakariko_potion_shop_gateway": "Kakariko",
        "potion_shop_kakariko_gateway": "Adult Potion Shop"
    },
    {
        "kakariko_potion_back_gateway": "Kakariko",
        "potion_back_kakariko_gateway": "Adult Potion Shop Back"
    },
    {
        "kokiri_links_house_gateway": "Kokiri Forest",
        "links_house_kokiri_gateway": "Links House"
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
