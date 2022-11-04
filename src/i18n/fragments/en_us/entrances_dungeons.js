const ENTRANCES = [
    {
        "kokiri_deku_gateway": "Kokiri Forest",
        "deku_kokiri_gateway": "Deku Tree"
    },
    {
        "mountain_dodongo_gateway": "Death Mountain",
        "dodongo_mountain_gateway": "Dodongos Cavern"
    },
    {
        "fountain_jabu_gateway": "Zora's Fountain",
        "jabu_fountain_gateway": "Jabu Jabu"
    },
    {
        "kakariko_well_gateway": "Kakariko",
        "well_kakriko_gateway": "Well"
    },
    {
        "meadow_forest_temple_gateway": "Sacred Forest Meadow",
        "forest_temple_meadow_gateway": "Forest Temple"
    },
    {
        "crater_fire_temple_gateway": "Death Mountain Crater",
        "fire_temple_crater_gateway": "Fire Temple"
    },
    {
        "lake_water_temple_gateway": "Lake Hylia",
        "water_temple_lake_gateway": "Water Temple"
    },
    {
        "colossus_spirit_temple_gateway": "Desert Colossus",
        "spirit_temple_colossus_gateway": "Spirit Temple"
    },
    {
        "graveyard_shadow_temple_gateway": "Graveyard",
        "shadow_temple_graveyard_gateway": "Shadow Temple"
    },
    {
        "fountain_ice_cavern_gateway": "Zora's Fountain",
        "ice_cavern_fountain_gateway": "Ice Cavern"
    },
    {
        "fortress_training_grounds_gateway": "Gerudo Fortress",
        "training_grounds_fortress_gateway": "Training Grounds"
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
