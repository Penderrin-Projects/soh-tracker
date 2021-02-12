/**
 * move to serverside earliest past TBD
 */

import SavestateConverter from "/GameTrackerJS/savestate/SavestateConverter.js";

SavestateConverter.register(function(state) {
    const res = {
        data: state.data,
        extra: {},
        notes: state.notes,
        autosave: state.autosave,
        timestamp: state.timestamp,
        name: state.name
    };
    const exits = {};
    if (state.extra.exits != null) {
        for (const i of Object.keys(state.extra.exits)) {
            exits[translation[i] || i] = translation[state.extra.exits[i]] || state.extra.exits[i];
        }
    }
    res.extra = {...state.extra, exits};
    return res;
});

const translation = {
    "region.field_woods_gateway -> region.lw_bridge": "region.lw_bridge -> region.field_woods_gateway",
    "region.lake_field_gateway -> region.lake_hylia": "region.lake_hylia -> region.lake_field_gateway",
    "region.valley_field_gateway -> region.gerudo_valley": "region.gerudo_valley -> region.valley_field_gateway",
    "region.marketentrance_field_gateway -> region.market_entrance": "region.market_entrance -> region.marketentrance_field_gateway",
    "region.kakariko_field_gateway -> region.kakariko_village": "region.kakariko_village -> region.kakariko_field_gateway",
    "region.river_field_gateway -> region.zr_front": "region.zr_front -> region.river_field_gateway",
    "region.ranch_field_gateway -> region.lon_lon_ranch": "region.lon_lon_ranch -> region.ranch_field_gateway",
    "region.kokiri_bridge_gateway -> region.lw_bridge": "region.bridge_to_kokiri_entrance -> region.kokiri_bridge_gateway",
    "region.kokiri_woods_gateway -> region.lost_woods": "region.lost_woods -> region.kokiri_woods_gateway",
    "region.field_woods_gateway -> region.hyrule_field": "region.hyrule_field -> region.field_woods_gateway",
    "region.kokiri_bridge_gateway -> region.kokiri_forest": "region.kokiri_to_bridge_entrance -> region.kokiri_bridge_gateway",
    "region.kokiri_woods_gateway -> region.kokiri_forest": "region.kokiri_forest -> region.kokiri_woods_gateway",
    "region.gc_woods_gateway -> region.gc_woods_warp": "region.gc_woods_warp -> region.gc_woods_gateway",
    "region.river_woods_gateway -> region.zora_river": "region.zora_river -> region.river_woods_gateway",
    "region.meadow_woods_gateway -> region.sfm_entryway": "region.sfm_entryway -> region.meadow_woods_gateway",
    "region.meadow_woods_gateway -> region.lw_beyond_mido": "region.lw_beyond_mido -> region.meadow_woods_gateway",
    "region.lake_field_gateway -> region.hyrule_field": "region.hyrule_field -> region.lake_field_gateway",
    "region.domain_lake_gateway -> region.zoras_domain": "region.zoras_domain -> region.domain_lake_gateway",
    "region.marketentrance_field_gateway -> region.hyrule_field": "region.hyrule_field -> region.marketentrance_field_gateway",
    "region.marketentrance_market_gateway -> region.market": "region.market -> region.marketentrance_market_gateway",
    "region.marketentrance_market_gateway -> region.market_entrance": "region.market_entrance -> region.marketentrance_market_gateway",
    "region.grounds_market_gateway -> region.castle_grounds": "region.castle_grounds -> region.grounds_market_gateway",
    "region.tot_market_gateway -> region.tot_entrance": "region.tot_entrance -> region.tot_market_gateway",
    "region.grounds_market_gateway -> region.market": "region.market -> region.grounds_market_gateway",
    "region.tot_market_gateway -> region.market": "region.market -> region.tot_market_gateway",
    "region.ranch_field_gateway -> region.hyrule_field": "region.hyrule_field -> region.ranch_field_gateway",
    "region.kakariko_field_gateway -> region.hyrule_field": "region.hyrule_field -> region.kakariko_field_gateway",
    "region.graveyard_kakariko_gateway -> region.graveyard": "region.graveyard -> region.graveyard_kakariko_gateway",
    "region.mountain_kakariko_gateway -> region.death_mountain": "region.death_mountain -> region.mountain_kakariko_gateway",
    "region.graveyard_kakariko_gateway -> region.kakariko_village": "region.kakariko_village -> region.graveyard_kakariko_gateway",
    "region.mountain_kakariko_gateway -> region.kak_behind_gate": "region.kak_behind_gate -> region.mountain_kakariko_gateway",
    "region.mountain_goron_gateway -> region.goron_city": "region.goron_city -> region.mountain_goron_gateway",
    "region.crater_mountain_gateway -> region.dmc_upper_local": "region.crater_to_mountain_entrance -> region.crater_mountain_gateway",
    "region.mountain_goron_gateway -> region.death_mountain": "region.death_mountain -> region.mountain_goron_gateway",
    "region.crater_goron_gateway -> region.dmc_lower_local": "region.crater_to_goron_entrance -> region.crater_goron_gateway",
    "region.gc_woods_gateway -> region.lost_woods": "region.lost_woods -> region.gc_woods_gateway",
    "region.crater_mountain_gateway -> region.death_mountain_summit": "region.mountain_to_crater_entrance -> region.crater_mountain_gateway",
    "region.crater_goron_gateway -> region.gc_darunias_chamber": "region.goron_to_crater_entrance -> region.crater_goron_gateway",
    "region.river_field_gateway -> region.hyrule_field": "region.hyrule_field -> region.river_field_gateway",
    "region.river_woods_gateway -> region.lost_woods": "region.lost_woods -> region.river_woods_gateway",
    "region.river_domain_gateway -> region.zoras_domain": "region.zoras_domain -> region.river_domain_gateway",
    "region.river_domain_gateway -> region.zr_behind_waterfall": "region.zr_behind_waterfall -> region.river_domain_gateway",
    "region.domain_lake_gateway -> region.lake_hylia": "region.lake_hylia -> region.domain_lake_gateway",
    "region.fountain_domain_gateway -> region.zoras_fountain": "region.zoras_fountain -> region.fountain_domain_gateway",
    "region.fountain_domain_gateway -> region.zd_behind_king_zora": "region.zd_behind_king_zora -> region.fountain_domain_gateway",
    "region.valley_field_gateway -> region.hyrule_field": "region.hyrule_field -> region.valley_field_gateway",
    "region.valley_fortress_gateway -> region.gerudo_fortress": "region.gerudo_fortress -> region.valley_fortress_gateway",
    "region.valley_fortress_gateway -> region.gv_fortress_side": "region.gv_fortress_side -> region.valley_fortress_gateway",
    "region.wasteland_fortress_gateway -> region.wasteland_near_fortress": "region.wasteland_near_fortress -> region.wasteland_fortress_gateway",
    "region.wasteland_fortress_gateway -> region.gf_outside_gate": "region.gf_outside_gate -> region.wasteland_fortress_gateway",
    "region.wasteland_colossus_gateway -> region.desert_colossus": "region.desert_colossus -> region.wasteland_colossus_gateway",
    "region.wasteland_colossus_gateway -> region.wasteland_near_colossus": "region.wasteland_near_colossus -> region.wasteland_colossus_gateway",
    "region.lw_bridge -> region.kokiri_bridge_gateway": "region.bridge_to_kokiri_entrance -> region.kokiri_bridge_gateway",
    "region.kokiri_forest -> region.kokiri_bridge_gateway": "region.kokiri_to_bridge_entrance -> region.kokiri_bridge_gateway",
    "region.dmc_upper_local -> region.crater_mountain_gateway": "region.crater_to_mountain_entrance -> region.crater_mountain_gateway",
    "region.dmc_lower_local -> region.crater_goron_gateway": "region.crater_to_goron_entrance -> region.crater_goron_gateway",
    "region.death_mountain_summit -> region.crater_mountain_gateway": "region.mountain_to_crater_entrance -> region.crater_mountain_gateway",
    "region.gc_darunias_chamber -> region.crater_goron_gateway": "region.goron_to_crater_entrance -> region.crater_goron_gateway"
};
