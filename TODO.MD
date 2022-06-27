
### BUGS

- after load entrance bind is not recognized by binding menu
    - possibly due to lazy load and initial choice
- world status bar not counting correctly (when filtered)
- after spoiler log parse not all options set in logic
- shops not loading correctly
- multiplayer entrances not synced correctly on join?
- on filter no list update

### TRACKER TODO

- boss shortcuts
- frog songs individual checks
- key rings for location items / shops
    - why? can just use normal key icon
- ganon boss keysanity needs own option
- remove done filter for areas / exits
    - list option to ignore empty list?
- spoiler parser (items) values from settings (?)
    - child trade
    - free scarecrow

    
### SPOILER LOG ERRORS

[Deku Tree Boss Door -> Gohma Boss Room: Barinade Boss Room] is a invalid Entrance value.
[Dodongos Cavern Boss Door -> King Dodongo Boss Room: Morpha Boss Room] is a invalid Entrance value.
[Fire Temple Boss Door -> Volvagia Boss Room: Twinrova Boss Room] is a invalid Entrance value.
[Forest Temple Boss Door -> Phantom Ganon Boss Room: Bongo Bongo Boss Room] is a invalid Entrance value.
[Jabu Jabus Belly Boss Door -> Barinade Boss Room: King Dodongo Boss Room] is a invalid Entrance value.
[Shadow Temple Boss Door -> Bongo Bongo Boss Room: Phantom Ganon Boss Room] is a invalid Entrance value.
[Spirit Temple Boss Door -> Twinrova Boss Room: Gohma Boss Room] is a invalid Entrance value.
[Water Temple Boss Door -> Morpha Boss Room: Volvagia Boss Room] is a invalid Entrance value.

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
