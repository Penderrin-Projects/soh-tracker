const ENTRANCES = [
    {
        "deku_tree_entrance": "Kokiri Wald",
        "deku_tree_gateway": "Deku Baum"
    },
    {
        "dodongos_cavern_entrance": "Todesberg",
        "dodongos_cavern_gateway": "Dodongos Höhle"
    },
    {
        "jabu_jabus_belly_entrance": "Zoras Quelle",
        "jabu_jabus_belly_gateway": "Jabu-Jabu"
    },
    {
        "bottom_of_the_well_entrance": "Kakariko",
        "bottom_of_the_well_gateway": "Brunnen"
    },
    {
        "forest_temple_entrance": "Heilige Lichtung",
        "forest_temple_gateway": "Waldtempel"
    },
    {
        "fire_temple_entrance": "Todesberg-Krater",
        "fire_temple_gateway": "Feuertempel"
    },
    {
        "water_temple_entrance": "Hyliasee",
        "water_temple_gateway": "Wassertempel"
    },
    {
        "spirit_temple_entrance": "Wüstenkoloss",
        "spirit_temple_gateway": "Geistertempel"
    },
    {
        "shadow_temple_entrance": "Friedhof",
        "shadow_temple_gateway": "Schattentempel"
    },
    {
        "ice_cavern_entrance": "Zoras Quelle",
        "ice_cavern_gateway": "Eishöhle"
    },
    {
        "gerudo_training_grounds_entrance": "Gerudo-Festung",
        "gerudo_training_grounds_gateway": "Trainingsarena"
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
