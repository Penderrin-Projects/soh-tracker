const ENTRANCES = [
    {
        "lh_owl_flight": "Lake Hylia Owl",
        "hyrule_field": "Hyrule Field Owl Drop"
    },
    {
        "dmt_owl_flight": "Death Mountain Owl",
        "kak_impas_rooftop": "Kakariko Owl Drop"
    },
    {
        "child_spawn": "Child Spawn",
        "kf_links_house": "Links House Spawn"
    },
    {
        "adult_spawn": "Adult Spawn",
        "temple_of_time": "Temple of Time Spawn"
    },
    {
        "prelude_of_light_warp": "Prelude Warp",
        "temple_of_time": "Prelude Warp Pad"
    },
    {
        "minuet_of_forest_warp": "Minuet Warp",
        "sacred_forest_meadow": "Minuet Warp Pad"
    },
    {
        "bolero_of_fire_warp": "Bolero Warp",
        "dmc_central_local": "Bolero Warp Pad"
    },
    {
        "serenade_of_water_warp": "Serenade Warp",
        "lake_hylia": "Serenade Warp Pad"
    },
    {
        "nocturne_of_shadow_warp": "Nocturne Warp",
        "graveyard_warp_pad_region": "Nocturne Warp Pad"
    },
    {
        "requiem_of_spirit_warp": "Requiem Warp",
        "desert_colossus": "Requiem Warp Pad"
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
