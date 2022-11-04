const ENTRANCES = [
    {
        "field_woods_gateway": "Hyrule Field",
        "woods_field_gateway": "Lost Woods Bridge"
    },
    {
        "field_lake_gateway": "Hyrule Field",
        "lake_field_gateway": "Lake Hylia"
    },
    {
        "field_marketentrance_gateway": "Hyrule Field",
        "marketentrance_field_gateway": "Market Entrance"
    },
    {
        "field_ranch_gateway": "Hyrule Field",
        "ranch_field_gateway": "Lon Lon Ranch"
    },
    {
        "field_kakariko_gateway": "Hyrule Field",
        "kakariko_field_gateway": "Kakariko"
    },
    {
        "field_river_gateway": "Hyrule Field",
        "river_field_gateway": "Zora's River"
    },
    {
        "field_valley_gateway": "Hyrule Field",
        "valley_field_gateway": "Gerudo Valley"
    },
    {
        "kokiri_bridge_gateway": "Kokiri Forest",
        "bridge_kokiri_gateway": "Lost Woods Bridge"
    },
    {
        "kokiri_woods_gateway": "Kokiri Forest",
        "woods_kokiri_gateway": "Lost Woods"
    },
    {
        "woods_gc_gateway": "Lost Woods",
        "gc_woods_gateway": "Goron City"
    },
    {
        "woods_river_gateway": "Lost Woods",
        "river_woods_gateway": "Zora's River"
    },
    {
        "woods_meadow_gateway": "Lost Woods",
        "meadow_woods_gateway": "Sacred Forest Meadow"
    },
    {
        "market_marketentrance_gateway": "Market",
        "marketentrance_market_gateway": "Market Entrance"
    },
    {
        "market_marketback_gateway": "Market",
        "marketback_market_gateway": "Market Backalley"
    },
    {
        "market_grounds_gateway": "Market",
        "grounds_market_gateway": "Castle Grounds"
    },
    {
        "market_tot_gateway": "Market",
        "tot_market_gateway": "Temple of Time Plaza"
    },
    {
        "kakariko_graveyard_gateway": "Kakariko",
        "graveyard_kakariko_gateway": "Graveyard"
    },
    {
        "kakariko_mountain_gateway": "Kakariko",
        "mountain_kakariko_gateway": "Death Mountain"
    },
    {
        "mountain_goron_gateway": "Death Mountain",
        "goron_mountain_gateway": "Goron City"
    },
    {
        "mountain_crater_gateway": "Death Mountain",
        "crater_mountain_gateway": "Death Mountain Crater"
    },
    {
        "goron_crater_gateway": "Goron City",
        "crater_goron_gateway": "Death Mountain Crater"
    },
    {
        "domain_river_gateway": "Zora's Domain",
        "river_domain_gateway": "Zora's River"
    },
    {
        "domain_lake_gateway": "Zora's Domain",
        "lake_domain_gateway": "Lake Hylia"
    },
    {
        "domain_fountain_gateway": "Zora's Domain",
        "fountain_domain_gateway": "Zora's Fountain"
    },
    {
        "fortress_valley_gateway": "Gerudo Fortress",
        "valley_fortress_gateway": "Gerudo Valley"
    },
    {
        "fortress_wasteland_gateway": "Gerudo Fortress",
        "wasteland_fortress_gateway": "Haunted Wasteland"
    },
    {
        "colossus_wasteland_gateway": "Desert Colossus",
        "wasteland_colossus_gateway": "Haunted Wasteland"
    },
    {
        "valley_lake_gateway": "Gerudo Valley",
        "lake_valley_gateway": "Lake Hylia"
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
