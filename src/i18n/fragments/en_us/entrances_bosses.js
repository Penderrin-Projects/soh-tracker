const ENTRANCES = [
    {
        "deku_boss_gateway": "Deku Tree",
        "boss_deku_gateway": "Gohma"
    },
    {
        "dodongo_boss_gateway": "Dodongos Cavern",
        "boss_dodongo_gateway": "King Dodongo"
    },
    {
        "jabu_boss_gateway": "Jabu Jabu",
        "boss_jabu_gateway": "Barinade"
    },
    {
        "forest_temple_boss_gateway": "Forest Temple",
        "boss_forest_temple_gateway": "Phantom Ganon"
    },
    {
        "fire_temple_boss_gateway": "Fire Temple",
        "boss_fire_temple_gateway": "Volvagia"
    },
    {
        "water_temple_boss_gateway": "Water Temple",
        "boss_water_temple_gateway": "Morpha"
    },
    {
        "shadow_temple_boss_gateway": "Shadow Temple",
        "boss_shadow_temple_gateway": "Bongo Bongo"
    },
    {
        "spirit_temple_boss_gateway": "Spirit Temple",
        "boss_spirit_temple_gateway": "Twinrova"
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
