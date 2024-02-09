import FileSystem from "/emcJS/util/file/FileSystem.js";
import BusyIndicatorManager from "/emcJS/util/BusyIndicatorManager.js";
import OptionGroupRegistry from "/emcJS/data/registry/form/OptionGroupRegistry.js";
import FileLoader from "/emcJS/util/file/FileLoader.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import "/GameTrackerJS/_editor/world/WorldEditor.js";

async function laodResources() {
    const [
        icons,
        mapImages,
        settings,
        options,
        items,
        filter,
        areaTypes,
        exitTypes,
        locationTypes
    ] = await Promise.all([
        await FileLoader.jsonc("/images/_index.icons.json"),
        await FileLoader.jsonc("/images/_index.maps.json"),
        await FileLoader.jsonc("/database/settings.json"),
        await FileLoader.jsonc("/database/options.json"),
        await FileLoader.jsonc("/database/items.json"),
        await FileLoader.jsonc("/database/filter.json"),
        await FileLoader.jsonc("/modules/world/config/AreaTypes.json"),
        await FileLoader.jsonc("/modules/world/config/ExitTypes.json"),
        await FileLoader.jsonc("/modules/world/config/LocationTypes.json")
    ]);
    return {
        icons,
        mapImages,
        settings,
        options,
        items,
        filter,
        areaTypes,
        exitTypes,
        locationTypes
    };
}

export default async function() {
    const editorEl = document.createElement("gt-edt-world-editor");
    editorEl.addEventListener("change", () => {
        const config = editorEl.getConfig();
        console.log("change config:", config);
    });

    window.onbeforeunload = function() {
        if (editorEl.checkWorldDataHasChanges() || editorEl.checkCurrentEditorHasChanges()) {
            return "You have unsaved changes in the current form. Discard changes and continue?";
        }
    }

    // refresh
    async function refreshFn() {
        await BusyIndicatorManager.busy();
        // ---
        editorEl.reset();
        OptionGroupRegistry.reset();
        // ---
        const {
            icons,
            mapImages,
            settings,
            options,
            items,
            filter,
            areaTypes,
            exitTypes,
            locationTypes
        } = await laodResources();
        // ---
        OptionGroupRegistry.load({
            worldEditor_icons: {
                "": "",
                ...icons
            },
            worldEditor_areaMapImages: {
                "": "",
                ...mapImages
            },
            worldEditor_areaTypes: areaTypes,
            worldEditor_exitTypes: exitTypes,
            worldEditor_locationTypes: locationTypes
        });
        // ---
        editorEl.setSettings(settings);
        editorEl.setOptions(options);
        editorEl.setItems(items);
        editorEl.setFilterConfig(filter);
        // ---
        await BusyIndicatorManager.unbusy();
    }

    // navigation
    const NAV = [{
        "content": "FILE",
        "submenu": [{
            "content": "SAVE",
            "handler": async () => {
                if (editorEl.checkCurrentEditorHasChanges()) {
                    const result = await ModalDialog.confirm("Unsaved changes in Form", "You have unsaved changes in the current form. Do you want to save anyways?");
                    if (result !== true) {
                        return;
                    }
                }
                await BusyIndicatorManager.busy();
                const config = editorEl.getWorldData();
                FileSystem.save(JSON.stringify(config, " ", 4), `world_${(new Date()).getTime()}.json`);
                editorEl.flushWorldDataChanges();
                await BusyIndicatorManager.unbusy();
            }
        }, {
            "content": "LOAD",
            "handler": async () => {
                if (editorEl.checkWorldDataHasChanges()) {
                    const result = await ModalDialog.confirm("Unsaved data changes", "You have not saved your changes to file. Discard changes and continue?");
                    if (result !== true) {
                        return;
                    }
                } else if (editorEl.checkCurrentEditorHasChanges()) {
                    const result = await ModalDialog.confirm("Unsaved changes in Form", "You have unsaved changes in the current form. Discard changes and continue?");
                    if (result !== true) {
                        return;
                    }
                }
                try {
                    await BusyIndicatorManager.busy();
                    const res = await FileSystem.load(".json");
                    await BusyIndicatorManager.unbusy();
                    if (res != null) {
                        const {data} = res;
                        if (data != null) {
                            await editorEl.setWorldData(data);
                        }
                    }
                } catch {
                    await BusyIndicatorManager.reset();
                }
            }
        }, {
            "content": "EXIT EDITOR",
            "handler": async () => {
                if (editorEl.checkWorldDataHasChanges()) {
                    const result = await ModalDialog.confirm("Unsaved data changes", "You have not saved your changes to file. Discard changes and continue?");
                    if (result !== true) {
                        return;
                    }
                } else if (editorEl.checkCurrentEditorHasChanges()) {
                    const result = await ModalDialog.confirm("Unsaved changes", "You have unsaved changes in the current form. Discard changes and continue?");
                    if (result !== true) {
                        return;
                    }
                }
                editorEl.reset();
                const event = new Event("close");
                editorEl.dispatchEvent(event);
            }
        }]
    }];

    return {
        name: "World Editor",
        panelEl: editorEl,
        navConfig: NAV,
        refreshFn
    }
}
