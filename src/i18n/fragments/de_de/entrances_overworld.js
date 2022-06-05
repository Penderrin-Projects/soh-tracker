const ENTRANCES = [
    {
        "field_woods_gateway": "Hylianische Steppe",
        "woods_field_gateway": "Verlorene Wälder Brücke"
    },
    {
        "field_lake_gateway": "Hylianische Steppe",
        "lake_field_gateway": "Hyliasee"
    },
    {
        "field_marketentrance_gateway": "Hylianische Steppe",
        "marketentrance_field_gateway": "Markt Eingang"
    },
    {
        "field_ranch_gateway": "Hylianische Steppe",
        "ranch_field_gateway": "Lon Lon-Farm"
    },
    {
        "field_kakariko_gateway": "Hylianische Steppe",
        "kakariko_field_gateway": "Kakariko"
    },
    {
        "field_river_gateway": "Hylianische Steppe",
        "river_field_gateway": "Zoras Fluss"
    },
    {
        "field_valley_gateway": "Hylianische Steppe",
        "valley_field_gateway": "Gerudo Tal"
    },
    {
        "kokiri_bridge_gateway": "Kokiri Forest",
        "bridge_kokiri_gateway": "Verlorene Wälder Brücke"
    },
    {
        "kokiri_woods_gateway": "Kokiri Forest",
        "woods_kokiri_gateway": "Verlorene Wälder"
    },
    {
        "woods_gc_gateway": "Verlorene Wälder",
        "gc_woods_gateway": "Goronia"
    },
    {
        "woods_river_gateway": "Verlorene Wälder",
        "river_woods_gateway": "Zoras Fluss"
    },
    {
        "woods_meadow_gateway": "Verlorene Wälder",
        "meadow_woods_gateway": "Heilige Lichtung"
    },
    {
        "market_marketentrance_gateway": "Markt",
        "marketentrance_market_gateway": "Markt Eingang"
    },
    {
        "market_marketback_gateway": "Markt",
        "marketback_market_gateway": "Markt Hintergasse"
    },
    {
        "market_grounds_gateway": "Markt",
        "grounds_market_gateway": "Castle Grounds"
    },
    {
        "market_tot_gateway": "Markt",
        "tot_market_gateway": "Tempel der Zeit Platz"
    },
    {
        "kakariko_graveyard_gateway": "Kakariko",
        "graveyard_kakariko_gateway": "Friedhof"
    },
    {
        "kakariko_mountain_gateway": "Kakariko",
        "mountain_kakariko_gateway": "Todesberg"
    },
    {
        "mountain_goron_gateway": "Todesberg",
        "goron_mountain_gateway": "Goronia"
    },
    {
        "mountain_crater_gateway": "Todesberg",
        "crater_mountain_gateway": "Todesberg-Krater"
    },
    {
        "goron_crater_gateway": "Goronia",
        "crater_goron_gateway": "Todesberg-Krater"
    },
    {
        "domain_river_gateway": "Zoras Reich",
        "river_domain_gateway": "Zoras Fluss"
    },
    {
        "domain_lake_gateway": "Zoras Reich",
        "lake_domain_gateway": "Hyliasee"
    },
    {
        "domain_fountain_gateway": "Zoras Reich",
        "fountain_domain_gateway": "Zoras Quelle"
    },
    {
        "fortress_valley_gateway": "Gerudo Festung",
        "valley_fortress_gateway": "Gerudo Tal"
    },
    {
        "fortress_wasteland_gateway": "Gerudo Festung",
        "wasteland_fortress_gateway": "Gespensterwüste"
    },
    {
        "colossus_wasteland_gateway": "Desert Colossus",
        "wasteland_colossus_gateway": "Gespensterwüste"
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
