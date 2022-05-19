const ENTRANCES = [
    {
        "region.deku_tree_entrance": "Kokiri Forest",
        "region.deku_tree_gateway": "Deku Tree"
    },
    {
        "region.dodongos_cavern_entrance": "Death Mountain",
        "region.dodongos_cavern_gateway": "Dodongos Cavern"
    },
    {
        "region.jabu_jabus_belly_entrance": "Zora's Fountain",
        "region.jabu_jabus_belly_gateway": "Jabu Jabu"
    },
    {
        "region.bottom_of_the_well_entrance": "Kakariko Village",
        "region.bottom_of_the_well_gateway": "Well"
    },
    {
        "region.forest_temple_entrance": "Sacred Forest Meadow",
        "region.forest_temple_gateway": "Forest Temple"
    },
    {
        "region.fire_temple_entrance": "Death Mountain Crater",
        "region.fire_temple_gateway": "Fire Temple"
    },
    {
        "region.water_temple_entrance": "Lake Hylia",
        "region.water_temple_gateway": "Water Temple"
    },
    {
        "region.spirit_temple_entrance": "Desert Colossus",
        "region.spirit_temple_gateway": "Spirit Temple"
    },
    {
        "region.shadow_temple_entrance": "Graveyard",
        "region.shadow_temple_gateway": "Shadow Temple"
    },
    {
        "region.ice_cavern_entrance": "Zora's Fountain",
        "region.ice_cavern_gateway": "Ice Cavern"
    },
    {
        "region.gerudo_training_grounds_entrance": "Gerudo Fortress",
        "region.gerudo_training_grounds_gateway": "Training Grounds"
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
