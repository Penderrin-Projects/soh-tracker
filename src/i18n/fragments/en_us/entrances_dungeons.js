const ENTRANCES = [
    {
        "deku_tree_entrance": "Kokiri Forest",
        "deku_tree_gateway": "Deku Tree"
    },
    {
        "dodongos_cavern_entrance": "Death Mountain",
        "dodongos_cavern_gateway": "Dodongos Cavern"
    },
    {
        "jabu_jabus_belly_entrance": "Zora's Fountain",
        "jabu_jabus_belly_gateway": "Jabu Jabu"
    },
    {
        "bottom_of_the_well_entrance": "Kakariko",
        "bottom_of_the_well_gateway": "Well"
    },
    {
        "forest_temple_entrance": "Sacred Forest Meadow",
        "forest_temple_gateway": "Forest Temple"
    },
    {
        "fire_temple_entrance": "Death Mountain Crater",
        "fire_temple_gateway": "Fire Temple"
    },
    {
        "water_temple_entrance": "Lake Hylia",
        "water_temple_gateway": "Water Temple"
    },
    {
        "spirit_temple_entrance": "Desert Colossus",
        "spirit_temple_gateway": "Spirit Temple"
    },
    {
        "shadow_temple_entrance": "Graveyard",
        "shadow_temple_gateway": "Shadow Temple"
    },
    {
        "ice_cavern_entrance": "Zora's Fountain",
        "ice_cavern_gateway": "Ice Cavern"
    },
    {
        "gerudo_training_grounds_entrance": "Gerudo Fortress",
        "gerudo_training_grounds_gateway": "Training Grounds"
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
