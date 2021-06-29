
### FIX MAJOR BUGS

- 

---

### FIX MINOR BUGS

- shopsanity location wrong slots on 1,2,3

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

### TODO

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

- after import state ask to load the state or not
    - dialog "state imported --- do you want to load the imported state? --- Yes - No"

- message to deactivate the following for detached window
    - chrome://flags/#web-contents-occlusion
    - chrome://flags/#calculate-native-win-occlusion

---

### REQUESTS

- optionally increase skully token count with ticking off skullies

- on network play make location- and mode change (locationlist/map) synchronize optional

- add shops to map / list

- add notes to each location/area