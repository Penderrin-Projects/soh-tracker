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
        "temple_forest_boss_gateway": "Forest Temple",
        "boss_temple_forest_gateway": "Phantom Ganon"
    },
    {
        "temple_fire_boss_gateway": "Fire Temple",
        "boss_temple_fire_gateway": "Volvagia"
    },
    {
        "temple_water_boss_gateway": "Water Temple",
        "boss_temple_water_gateway": "Morpha"
    },
    {
        "temple_shadow_boss_gateway": "Shadow Temple",
        "boss_temple_shadow_gateway": "Bongo Bongo"
    },
    {
        "temple_spirit_boss_gateway": "Spirit Temple",
        "boss_temple_spirit_gateway": "Twinrova"
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
