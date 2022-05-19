const ENTRANCES = [
    {
        "region.field_woods_gateway": "Hylianische Steppe",
        "region.woods_field_gateway": "Verlorene Wälder Brücke"
    },
    {
        "region.field_lake_gateway": "Hylianische Steppe",
        "region.lake_field_gateway": "Hyliasee"
    },
    {
        "region.field_marketentrance_gateway": "Hylianische Steppe",
        "region.marketentrance_field_gateway": "Markt Eingang"
    },
    {
        "region.field_ranch_gateway": "Hylianische Steppe",
        "region.ranch_field_gateway": "Lon Lon-Farm"
    },
    {
        "region.field_kakariko_gateway": "Hylianische Steppe",
        "region.kakariko_field_gateway": "Kakariko"
    },
    {
        "region.field_river_gateway": "Hylianische Steppe",
        "region.river_field_gateway": "Zoras Fluss"
    },
    {
        "region.field_valley_gateway": "Hylianische Steppe",
        "region.valley_field_gateway": "Gerudo Tal"
    },
    {
        "region.kokiri_bridge_gateway": "Kokiri Forest",
        "region.bridge_kokiri_gateway": "Verlorene Wälder Brücke"
    },
    {
        "region.kokiri_woods_gateway": "Kokiri Forest",
        "region.woods_kokiri_gateway": "Verlorene Wälder"
    },
    {
        "region.woods_gc_gateway": "Verlorene Wälder",
        "region.gc_woods_gateway": "Goronia"
    },
    {
        "region.woods_river_gateway": "Verlorene Wälder",
        "region.river_woods_gateway": "Zoras Fluss"
    },
    {
        "region.woods_meadow_gateway": "Verlorene Wälder",
        "region.meadow_woods_gateway": "Heilige Lichtung"
    },
    {
        "region.market_marketentrance_gateway": "Markt",
        "region.marketentrance_market_gateway": "Markt Eingang"
    },
    {
        "region.market_marketback_gateway": "Markt",
        "region.marketback_market_gateway": "Markt Hintergasse"
    },
    {
        "region.market_grounds_gateway": "Markt",
        "region.grounds_market_gateway": "Castle Grounds"
    },
    {
        "region.market_tot_gateway": "Markt",
        "region.tot_market_gateway": "Tempel der Zeit Platz"
    },
    {
        "region.kakariko_graveyard_gateway": "Kakariko",
        "region.graveyard_kakariko_gateway": "Friedhof"
    },
    {
        "region.kakariko_mountain_gateway": "Kakariko",
        "region.mountain_kakariko_gateway": "Todesberg"
    },
    {
        "region.mountain_goron_gateway": "Todesberg",
        "region.goron_mountain_gateway": "Goronia"
    },
    {
        "region.mountain_crater_gateway": "Todesberg",
        "region.crater_mountain_gateway": "Todesberg-Krater"
    },
    {
        "region.goron_crater_gateway": "Goronia",
        "region.crater_goron_gateway": "Todesberg-Krater"
    },
    {
        "region.domain_river_gateway": "Zoras Reich",
        "region.river_domain_gateway": "Zoras Fluss"
    },
    {
        "region.domain_lake_gateway": "Zoras Reich",
        "region.lake_domain_gateway": "Hyliasee"
    },
    {
        "region.domain_fountain_gateway": "Zoras Reich",
        "region.fountain_domain_gateway": "Zoras Quelle"
    },
    {
        "region.fortress_valley_gateway": "Gerudo Festung",
        "region.valley_fortress_gateway": "Gerudo Tal"
    },
    {
        "region.fortress_wasteland_gateway": "Gerudo Festung",
        "region.wasteland_fortress_gateway": "Gespensterwüste"
    },
    {
        "region.colossus_wasteland_gateway": "Desert Colossus",
        "region.wasteland_colossus_gateway": "Gespensterwüste"
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
