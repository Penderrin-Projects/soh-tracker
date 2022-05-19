const ENTRANCES = [
    {
        "region.deku_tree_entrance": "Kokiri Wald",
        "region.deku_tree_gateway": "Deku Baum"
    },
    {
        "region.dodongos_cavern_entrance": "Todesberg",
        "region.dodongos_cavern_gateway": "Dodongos Höhle"
    },
    {
        "region.jabu_jabus_belly_entrance": "Zoras Quelle",
        "region.jabu_jabus_belly_gateway": "Jabu-Jabu"
    },
    {
        "region.bottom_of_the_well_entrance": "Kakariko",
        "region.bottom_of_the_well_gateway": "Brunnen"
    },
    {
        "region.forest_temple_entrance": "Heilige Lichtung",
        "region.forest_temple_gateway": "Waldtempel"
    },
    {
        "region.fire_temple_entrance": "Todesberg-Krater",
        "region.fire_temple_gateway": "Feuertempel"
    },
    {
        "region.water_temple_entrance": "Hyliasee",
        "region.water_temple_gateway": "Wassertempel"
    },
    {
        "region.spirit_temple_entrance": "Wüstenkoloss",
        "region.spirit_temple_gateway": "Geistertempel"
    },
    {
        "region.shadow_temple_entrance": "Friedhof",
        "region.shadow_temple_gateway": "Schattentempel"
    },
    {
        "region.ice_cavern_entrance": "Zoras Quelle",
        "region.ice_cavern_gateway": "Eishöhle"
    },
    {
        "region.gerudo_training_grounds_entrance": "Gerudo-Festung",
        "region.gerudo_training_grounds_gateway": "Trainingsarena"
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
