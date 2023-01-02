const ENTRANCES = [
    {
        "mountain_storms_grotto_gateway": "Death Mountain",
        "storms_grotto_mountain_gateway": "Storms Grotto"
    },
    {
        "mountain_cow_grotto_gateway": "Death Mountain",
        "cow_grotto_mountain_gateway": "Cow Grotto"
    },
    {
        "crater_hammer_grotto_gateway": "Death Mountain Crater",
        "hammer_grotto_crater_gateway": "Hammer Grotto"
    },
    {
        "crater_bomb_grotto_gateway": "Death Mountain Crater",
        "bomb_grotto_crater_gateway": "Bomb Grotto"
    },
    {
        "colossus_grotto_gateway": "Desert Colossus",
        "grotto_colossus_gateway": "Grotto"
    },
    {
        "fortress_storms_grotto_gateway": "Gerudo Fortress",
        "storms_grotto_fortress_gateway": "Storms Grotto"
    },
    {
        "valley_octorok_grotto_gateway": "Gerudo Valley",
        "octorok_grotto_valley_gateway": "Octorok Grotto"
    },
    {
        "valley_storms_grotto_gateway": "Gerudo Valley",
        "storms_grotto_valley_gateway": "Storms Grotto"
    },
    {
        "goron_grotto_gateway": "Goron City",
        "grotto_goron_gateway": "Grotto"
    },
    {
        "grounds_storms_grotto_gateway": "Castle Grounds",
        "storms_grotto_grounds_gateway": "Storms Grotto"
    },
    {
        "kakariko_redead_grotto_gateway": "Kakariko",
        "redead_grotto_kakariko_gateway": "Redead Grotto"
    },
    {
        "kakariko_open_grotto_gateway": "Kakariko",
        "open_grotto_kakariko_gateway": "Open Grotto"
    },
    {
        "kokiri_storms_grotto_gateway": "Kokiri Forest",
        "storms_grotto_kokiri_gateway": "Storms Grotto"
    },
    {
        "lake_grotto_gateway": "Lake Hylia",
        "grotto_lake_gateway": "Gravestone Grotto"
    },
    {
        "ranch_grotto_gateway": "Lon Lon Ranch",
        "grotto_ranch_gateway": "Grotto"
    },
    {
        "woods_near_shortcuts_grotto_gateway": "Lost Woods",
        "near_shortcuts_grotto_woods_gateway": "Near Goron Grotto"
    },
    {
        "woods_scrubs_grotto_gateway": "Lost Woods",
        "scrubs_grotto_woods_gateway": "Near Meadow Grotto"
    },
    {
        "woods_deku_theater_gateway": "Lost Woods",
        "deku_theater_woods_gateway": "Theatre Grotto"
    },
    {
        "meadow_fairy_grotto_gateway": "Sacred Forest Meadow",
        "fairy_grotto_meadow_gateway": "Fairy Grotto"
    },
    {
        "meadow_storms_grotto_gateway": "Sacred Forest Meadow",
        "storms_grotto_meadow_gateway": "Storms Grotto"
    },
    {
        "meadow_wolfos_grotto_gateway": "Sacred Forest Meadow",
        "wolfos_grotto_meadow_gateway": "Wolfos Grotto"
    },
    {
        "river_fairy_grotto_gateway": "Zora's River",
        "fairy_grotto_river_gateway": "Fairy Grotto"
    },
    {
        "river_open_grotto_gateway": "Zora's River",
        "open_grotto_river_gateway": "Open Grotto"
    },
    {
        "river_storms_grotto_gateway": "Zora's River",
        "storms_grotto_river_gateway": "Storms Grotto"
    },
    {
        "domain_storms_grotto_gateway": "Zora's Domain",
        "storms_grotto_domain_gateway": "Storms Grotto"
    },
    {
        "field_fairy_grotto_gateway": "Hyrule Field",
        "fairy_grotto_field_gateway": "Fairy Grotto"
    },
    {
        "field_near_kak_grotto_gateway": "Hyrule Field",
        "near_kak_grotto_field_gateway": "Near Kakariko Grotto"
    },
    {
        "field_inside_fence_grotto_gateway": "Hyrule Field",
        "inside_fence_grotto_field_gateway": "Inside Fence Grotto"
    },
    {
        "field_open_grotto_gateway": "Hyrule Field",
        "open_grotto_field_gateway": "Open Grotto"
    },
    {
        "field_tektite_grotto_gateway": "Hyrule Field",
        "tektite_grotto_field_gateway": "Diving Grotto"
    },
    {
        "field_cow_grotto_gateway": "Hyrule Field",
        "cow_grotto_field_gateway": "Cow Grotto"
    },
    {
        "field_near_market_grotto_gateway": "Hyrule Field",
        "near_market_grotto_field_gateway": "Near Market Grotto"
    },
    {
        "field_southeast_grotto_gateway": "Hyrule Field",
        "southeast_grotto_field_gateway": "Forest Grotto"
    },
    // graves
    {
        "graveyard_composers_grave_gateway": "Graveyard",
        "composers_grave_graveyard_gateway": "Royal Tomb"
    },
    {
        "graveyard_redead_grave_gateway": "Graveyard",
        "redead_grave_graveyard_gateway": "Redead Grave"
    },
    {
        "graveyard_shield_grave_gateway": "Graveyard",
        "shield_grave_graveyard_gateway": "Shield Grave"
    },
    // special
    {
        "graveyard_dampes_grave_gateway": "Graveyard",
        "dampes_grave_graveyard_gateway": "Dampes Grave"
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
