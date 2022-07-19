const ENTRANCES = [
    {
        "lake_owl_gateway": "Lake Hylia Owl",
        "owl_lake_gateway": "Hyrule Field Owl Drop"
    },
    {
        "mountain_owl_gateway": "Death Mountain Owl",
        "owl_mountain_gateway": "Kakariko Owl Drop"
    },
    {
        "child_spawn_links_house_gateway": "Child Spawn",
        "links_house_child_spawn_gateway": "Links House Spawn"
    },
    {
        "adult_spawn_temple_of_time_gateway": "Adult Spawn",
        "temple_of_time_adult_spawn_gateway": "Temple of Time Spawn"
    },
    {
        "prelude_temple_of_time_gateway": "Prelude Warp",
        "temple_of_time_prelude_gateway": "Prelude Warp Pad"
    },
    {
        "minuet_meadow_gateway": "Minuet Warp",
        "meadow_minuet_gateway": "Minuet Warp Pad"
    },
    {
        "bolero_crater_gateway": "Bolero Warp",
        "crater_bolero_gateway": "Bolero Warp Pad"
    },
    {
        "serenade_lake_gateway": "Serenade Warp",
        "lake_serenade_gateway": "Serenade Warp Pad"
    },
    {
        "nocturne_graveyard_gateway": "Nocturne Warp",
        "graveyard_nocturne_gateway": "Nocturne Warp Pad"
    },
    {
        "requiem_colossus_gateway": "Requiem Warp",
        "colossus_requiem_gateway": "Requiem Warp Pad"
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
