------------------------------------------------------------
-- Area Detection Script for Ocarina of Time (Randomizer) --
-- Version: v04                                           --
-- Author: ZidArgs                                        --
-- Source: https://bitbucket.org/zidargs/track-oot/src    --
-- License: MIT                                           --
------------------------------------------------------------
local region_table = {
    --- Dungeon
    [0x00] = "Deku Tree",
    [0x01] = "Dodongos Cavern",
    [0x02] = "Jabu Jabus Belly",
    [0x03] = "Forest Temple",
    [0x04] = "Fire Temple",
    [0x05] = "Water Temple",
    [0x06] = "Spirit Temple",
    [0x07] = "Shadow Temple",
    [0x08] = "Bottom of the Well",
    [0x09] = "Ice Cavern",
    [0x0A] = "Ganons Tower",
    [0x0B] = "Gerudo Training Ground",
    [0x0D] = "Ganons Castle",
    [0x0E] = "Collapsing Castle",
    [0x0F] = "Collapsing Castle",
    [0x1A] = "Collapsing Castle",
    --- Boss Room
    [0x11] = "Gohmas Boss Room",
    [0x12] = "King Dodongos Boss Room",
    [0x13] = "Barinades Boss Room",
    [0x14] = "Phantom Ganons Boss Room",
    [0x15] = "Volvagias Boss Room",
    [0x16] = "Morphas Boss Room",
    [0x17] = "Twinrovas Boss Room",
    [0x18] = "Bongo Bongos Boss Room",
    [0x19] = "Ganondorfs Boss Room",
    [0x4F] = "Ganons Battle Arena",
    --- Interior
    [0x0C] = "Thieves Hideout",
    [0x10] = "Chest Game",
    [0x26] = "Know It All House",
    [0x27] = "Twins House",
    [0x28] = "Midos House",
    [0x29] = "Sarias House",
    [0x2A] = "Carpenter Boss House",
    [0x2B] = "Market Back House",
    [0x2C] = {
        [0x00B7] = "Adult Bazaar",
        [0x052C] = "Child Bazaar"
    },
    [0x2D] = "Kokiri Shop",
    [0x2E] = "Goron Shop",
    [0x2F] = "Zora Shop",
    [0x30] = {
        [0x0384] = "Adult Potion Shop",
        [0x03EC] = "Adult Potion Shop" --- back entrance
    },
    [0x31] = "Child Potion Shop",
    [0x32] = "Bombchu Shop",
    [0x33] = "Mask Shop",
    [0x34] = "Links House",
    [0x35] = "Dog Ladys House",
    [0x36] = "LLR Stables",
    [0x37] = {
        [0x039C] = "Impas House",
        [0x05C8] = "Impas House" --- back entrance
    },
    [0x38] = "Lake Lab",
    [0x39] = "Carpenter Tent",
    [0x3A] = "Dampes Hut",
    [0x3B] = {
        [0x04C2] = "OGC Great Fairy",
        [0x04BE] = "DMC Great Fairy",
        [0x0315] = "DMT Great Fairy"
    },
    [0x3D] = {
        [0x0578] = "HC Great Fairy",
        [0x0588] = "Colossus Great Fairy"
    },
    [0x42] = {
        [0x003B] = "Adult Shooting Gallery",
        [0x016D] = "Child Shooting Gallery"
    },
    [0x43] = "Temple of Time",
    [0x44] = "Chamber of the Sages",
    [0x48] = {
        [0x0453] = "Windmill",
        [0x044F] = "Dampes Grave"
    },
    [0x49] = "Fishing Pond",
    [0x4B] = "Bombchu Bowling",
    [0x4C] = {
        [0x004F] = "Talons House",
        [0x05E4] = "Talons House",
        [0x05D0] = "LLR Tower"
    },
    [0x4D] = "Market Guard House",
    [0x4E] = "Odd Medicine Building",
    [0x50] = "Skulltula House",
    --- Grave
    [0x3F] = "Redead Grave",
    [0x40] = "Shield Grave",
    [0x41] = "Royal Grave",
    --- Overworld
    [0x1B] = "Market Entrance", -- child day
    [0x1C] = "Market Entrance", -- child night
    [0x1D] = "Market Entrance", -- ruins
    [0x1E] = "Market Back Alley", -- child day
    [0x1F] = "Market Back Alley", -- child night
    [0x20] = "Market", -- child day
    [0x21] = "Market", -- child night
    [0x22] = "Market", -- ruins
    [0x23] = "Temple of Time Exterior", -- child day
    [0x24] = "Temple of Time Exterior", -- child night
    [0x25] = "Temple of Time Exterior", -- ruins
    [0x45] = "Castle Hedge Maze", -- child day
    [0x46] = "Castle Hedge Maze", -- child night
    [0x4A] = "Castle Courtyard",
    [0x51] = "Hyrule Field",
    [0x52] = "Kakariko Village",
    [0x53] = "Graveyard",
    [0x54] = "Zora River",
    [0x55] = "Kokiri Forest",
    [0x56] = "Sacred Forest Meadow",
    [0x57] = "Lake Hylia",
    [0x58] = "Zoras Domain",
    [0x59] = "Zoras Fountain",
    [0x5A] = "Gerudo Valley",
    [0x5B] = "Lost Woods",
    [0x5C] = "Desert Colossus",
    [0x5D] = "Gerudo Fortress",
    [0x5E] = "Haunted Wasteland",
    [0x5F] = "Hyrule Castle",
    [0x60] = "Death Mountain Trail",
    [0x61] = "Death Mountain Crater",
    [0x62] = "Goron City",
    [0x63] = "Lon Lon Ranch",
    [0x64] = "Ganons Castle Grounds"

}

local grotto_table = {
    [0x00] = "Hyrule Field - Near Market Grotto",
    [0x03] = "Hyrule Field - Open Grotto",
    [0x14] = "Lost Woods - Near Shortcuts Grotto",
    [0x22] = "Hyrule Field - Southeast Grotto",
    [0x28] = "Kakariko Village - Open Grotto",
    [0x29] = "Zora River - Open Grotto",
    [0x2C] = "Kokiri Forest - Storms Grotto",
    [0x57] = "Death Mountain - Storms Grotto",
    [0x7A] = "Death Mountain Crater - Upper Grotto",
    [0xE1] = "Hyrule Field - Tektite Grotto",
    [0xE4] = "Hyrule Field - Cow Grotto",
    [0xE5] = "Hyrule Field - Near Kakariko Grotto",
    [0xE6] = "Hyrule Field - Inside Fence Grotto",
    [0xE7] = "Kakariko Village - Redead Grotto",
    [0xEB] = "Zora River - Storms Grotto",
    [0xED] = "Sacred Forest Meadow - Wolfos Grotto",
    [0xEE] = "Sacred Forest Meadow - Storms Grotto",
    [0xEF] = "Lake Hylia - Gravestone Grotto",
    [0xF0] = "Gerudo Valley - Storms Grotto",
    [0xF2] = "Gerudo Valley - Octorok Grotto",
    [0xF3] = "Lost Woods - Deku Theater",
    [0xF5] = "Lost Woods - Scrubs Grotto",
    [0xF6] = "Hyrule Castle - Storms Grotto",
    [0xF8] = "Death Mountain - Cow Grotto",
    [0xF9] = "Death Mountain Crater - Hammer Grotto",
    [0xFB] = "Goron City - Open Grotto",
    [0xFC] = "Lon Lon Ranch - Open Grotto",
    [0xFD] = "Desert Colossus - Scrubs Grotto"
}

local game_modes = {
    [-1] = {
        name = "Unknown",
        loaded = false
    },
    [0] = {
        name = "N64 Logo",
        loaded = false
    },
    [1] = {
        name = "Title Screen",
        loaded = false
    },
    [2] = {
        name = "File Select",
        loaded = false
    },
    [3] = {
        name = "Normal Gameplay",
        loaded = true
    },
    [4] = {
        name = "Cutscene",
        loaded = true
    },
    [5] = {
        name = "Paused",
        loaded = true
    },
    [6] = {
        name = "Dying",
        loaded = true
    },
    [7] = {
        name = "Dying Menu Start",
        loaded = false
    },
    [8] = {
        name = "Dead",
        loaded = false
    }
}

local frame = 0
local current_region = ""
local last_printed_region = ""

local function MemBit(addr, bytes, pos)
    local obj = {
        get = function()
            return 0
        end,
        set = function(value)
        end
    }

    local _addr = addr + bytes - math.floor(pos / 8) - 1
    local _pos = pos % 8

    function obj.get()
        return bit.check(mainmemory.read_u8(_addr), _pos)
    end

    function obj.set(value)
        local orig = mainmemory.readbyte(_addr)
        local changed
        if value then
            changed = bit.set(orig, _pos)
        else
            changed = bit.clear(orig, _pos)
        end
        mainmemory.writebyte(_addr, changed)
    end

    return obj
end

local function MemInt(addr, width)
    local obj = {
        get = function()
            return 0
        end,
        set = function(value)
        end
    }

    local gets = {
        [1] = function()
            return mainmemory.read_u8(addr)
        end,
        [2] = function()
            return mainmemory.read_u16_be(addr)
        end,
        [3] = function()
            return mainmemory.read_u24_be(addr)
        end,
        [4] = function()
            return mainmemory.read_u32_be(addr)
        end
    }
    obj.get = gets[width]

    local sets = {
        [1] = function(value)
            mainmemory.write_u8(addr, value)
        end,
        [2] = function(value)
            mainmemory.write_u16_be(addr, value)
        end,
        [3] = function(value)
            mainmemory.write_u24_be(addr, value)
        end,
        [4] = function(value)
            mainmemory.write_u32_be(addr, value)
        end
    }
    obj.set = sets[width]

    return obj
end

local value_list = {
    state_main = MemInt(0x11B92F, 1),
    state_sub = MemInt(0x11B933, 1),
    state_menu = MemInt(0x1D8DD5, 1),
    state_logo = MemInt(0x11F200, 4),
    cur_health = MemInt(0x11A600, 2),
    link_dying = MemBit(0x1DB09F, 8, 0x27),
    --- where am i?
    entrance = MemInt(0x11A5D2, 2),
    content = MemInt(0x11B967, 1),
    scene = MemInt(0x1C8545, 1)
}

local function get_current_game_mode()
    local mode = -1
    local logo_state = value_list.state_logo.get()
    if logo_state == 0x802C5880 or logo_state == 0x00000000 then
        mode = 0
    else
        local main_state = value_list.state_main.get()
        if main_state == 1 then
            mode = 1
        elseif main_state == 2 then
            mode = 2
        else
            local menu_state = value_list.state_menu.get()
            if menu_state == 0 then
                if value_list.link_dying.get() or value_list.cur_health.get() <= 0 then
                    mode = 6
                else
                    if value_list.state_sub.get() == 4 then
                        mode = 4
                    else
                        mode = 3
                    end
                end
            elseif (0 < menu_state and menu_state < 9) or menu_state == 13 then
                mode = 5
            elseif menu_state == 9 or menu_state == 0xB then
                mode = 7
            else
                mode = 8
            end
        end
    end
    return mode, game_modes[mode]
end

function isGameLoaded()
    return get_current_game_mode() > 2
end

function updateRegion()
    local current_scene = value_list.scene.get()

    if (current_scene == 0x3C) then
        -- Fairy Fountain (hard to differentiate them)
        current_region = "Fairy Fountain"
    elseif (current_scene == 0x3E) then
        -- Any other Grotto
        local current_content = value_list.content.get()
        current_region = grotto_table[current_content]
        if (current_region == nil) then
            current_region = ""
        end
    else
        -- Any other Scene
        current_region = region_table[current_scene]
        if (type(current_region) == "table") then
            local current_entrance = value_list.entrance.get()
            current_region = current_region[current_entrance]
        end
        if (current_region == nil) then
            current_region = ""
        end
    end
end

function printRegion()
    if (current_region ~= last_printed_region) then
        if (current_region ~= "") then
            gui.drawString(20, 20, current_region, "white", "black", 18, nil, "bold")
        else
            gui.drawString(20, 20, "")
        end
        last_printed_region = current_region
    end
end

function main()
    while true do
        frame = frame + 1
        if (frame % 60 == 0) then
            if (isGameLoaded()) then
                updateRegion()
            else
                current_entrance = ""
                current_region = ""
            end
        end
        printRegion()
        emu.frameadvance()
    end
end

main()
