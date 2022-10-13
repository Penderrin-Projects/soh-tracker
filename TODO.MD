### gateway errors (not accessible)

- HF Fairy Grotto -> Hyrule Field becomes red once it’s bound to an entrance
- Shuffle Boss Entrances puts some beatable bosses as red (idk what the issue really is)
- Child and Adult Castle Grounds have some “misleading” checks (e.g. : If Adult has access to Castle Grounds from Child Great Fairy Fountain, Malon Weird Egg is considered available "as adult")

- Kakariko Redead Grotto Chest is red if Kakariko -> Redead Grotto is not accessible
- Both left and right Near Meadow Grotto Deku Salesman are red if Lost Woods -> Near Meadow Grotto is not accessible

### BUGS

- world status bar not counting correctly (when filtered) (?)
- after spoiler log parse not all options set in logic

### SPOILER PARSER

- [bridge: hearts] is a invalid value
- [shuffle_dungeon_entrances: off] is a invalid value

### TRACKER TODO

- boss shortcuts
- remove done filter for areas / exits
    - list option to ignore empty list?
- shuffle bosses

### SPOILER LOG ERRORS

### WIP (nightly)

- boss region (boss rando)

---

### DUNGEONSTATE

change:

```json
{
    "type": "panel",
    "name": "dungeon-status",
    "options": {
        "itemsize": 40,
        "orientation": "column",
        "active": [
            "reward",
            "key"
        ]
    }
}
```

to:

```json
{
    "type": "panel",
    "name": "dungeon-status",
    "options": {
        "itemsize": 40,
        "orientation": "column",
        "dungeons": {
            "whitelist": false,
            "values": [
                "area/well",
                "area/ice_cavern",
                "area/gerudo_fortress",
                "area/training_grounds"
            ]
        },
        "states": {
            "whitelist": true,
            "values": [
                "reward",
                "key"
            ]
        },
    }
}
```

---

### OTHER TODO

- auto get seed by id?
    - https://ootrandomizer.com/spoilers/get?id=${id}

- add rom options
    - disabled locations
        - remove them from lists if deactivated
        - alternative "ghost" locations to be activated in option
            - do not count ghost locations for totals
        - needs side-by-side input element
    - starting items
        - modify item elements to allow min values
        - needs side-by-side input element

- add warning dialog to download update if needed

- custom layout (aka build yourself a tracker)

- implement settings for dungeon status control

- custom element using 2 list-select
    - add search options (done)
    - 1 list with deactivated elements
    - 1 list with activated elements
    - buttons for (de-)activating elements
    
- add tooltips to location badges

- message to deactivate the following for detached window
    - chrome://flags/#web-contents-occlusion
    - chrome://flags/#calculate-native-win-occlusion

- include this https://developer.mozilla.org/en-US/docs/Web/API/StorageManager
    - persist option
        - if not persisted aske for persistence
    - show storage usage

---

### REQUESTS

- optionally increase skully token count with ticking off skullies

- on network play make location- and mode change (locationlist/map) synchronize optional

- add notes to each location/area
