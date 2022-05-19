const ENTRANCES = [
    {
        "region.field_woods_gateway": "Hyrule Field",
        "region.woods_field_gateway": "Lost Woods Bridge"
    },
    {
        "region.field_lake_gateway": "Hyrule Field",
        "region.lake_field_gateway": "Lake Hylia"
    },
    {
        "region.field_marketentrance_gateway": "Hyrule Field",
        "region.marketentrance_field_gateway": "Market Entrance"
    },
    {
        "region.field_ranch_gateway": "Hyrule Field",
        "region.ranch_field_gateway": "Lon Lon Ranch"
    },
    {
        "region.field_kakariko_gateway": "Hyrule Field",
        "region.kakariko_field_gateway": "Kakariko"
    },
    {
        "region.field_river_gateway": "Hyrule Field",
        "region.river_field_gateway": "Zora's River"
    },
    {
        "region.field_valley_gateway": "Hyrule Field",
        "region.valley_field_gateway": "Gerudo Valley"
    },
    {
        "region.kokiri_bridge_gateway": "Kokiri Forest",
        "region.bridge_kokiri_gateway": "Lost Woods Bridge"
    },
    {
        "region.kokiri_woods_gateway": "Kokiri Forest",
        "region.woods_kokiri_gateway": "Lost Woods"
    },
    {
        "region.woods_gc_gateway": "Lost Woods",
        "region.gc_woods_gateway": "Goron City"
    },
    {
        "region.woods_river_gateway": "Lost Woods",
        "region.river_woods_gateway": "Zora's River"
    },
    {
        "region.woods_meadow_gateway": "Lost Woods",
        "region.meadow_woods_gateway": "Sacred Forest Meadow"
    },
    {
        "region.market_marketentrance_gateway": "Market",
        "region.marketentrance_market_gateway": "Market Entrance"
    },
    {
        "region.market_marketback_gateway": "Market",
        "region.marketback_market_gateway": "Market Backalley"
    },
    {
        "region.market_grounds_gateway": "Market",
        "region.grounds_market_gateway": "Castle Grounds"
    },
    {
        "region.market_tot_gateway": "Market",
        "region.tot_market_gateway": "Temple of Time Plaza"
    },
    {
        "region.kakariko_graveyard_gateway": "Kakariko",
        "region.graveyard_kakariko_gateway": "Graveyard"
    },
    {
        "region.kakariko_mountain_gateway": "Kakariko",
        "region.mountain_kakariko_gateway": "Death Mountain"
    },
    {
        "region.mountain_goron_gateway": "Death Mountain",
        "region.goron_mountain_gateway": "Goron City"
    },
    {
        "region.mountain_crater_gateway": "Death Mountain",
        "region.crater_mountain_gateway": "Death Mountain Crater"
    },
    {
        "region.goron_crater_gateway": "Goron City",
        "region.crater_goron_gateway": "Death Mountain Crater"
    },
    {
        "region.domain_river_gateway": "Zora's Domain",
        "region.river_domain_gateway": "Zora's River"
    },
    {
        "region.domain_lake_gateway": "Zora's Domain",
        "region.lake_domain_gateway": "Lake Hylia"
    },
    {
        "region.domain_fountain_gateway": "Zora's Domain",
        "region.fountain_domain_gateway": "Zora's Fountain"
    },
    {
        "region.fortress_valley_gateway": "Gerudo Fortress",
        "region.valley_fortress_gateway": "Gerudo Valley"
    },
    {
        "region.fortress_wasteland_gateway": "Gerudo Fortress",
        "region.wasteland_fortress_gateway": "Haunted Wasteland"
    },
    {
        "region.colossus_wasteland_gateway": "Desert Colossus",
        "region.wasteland_colossus_gateway": "Haunted Wasteland"
    },
    {
        "region.valley_lake_gateway": "Gerudo Valley",
        "region.lake_valley_gateway": "Lake Hylia"
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
