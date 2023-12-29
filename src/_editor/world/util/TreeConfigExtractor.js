import DataManager from "../data/DataManager.js";

export default class TreeConfigExtractor {

    extractTreeStructure() {
        const tree = {
            world: {
                nodeType: "gt-edt-world::world-config",
                label: "World Config"
            },
            locations: {
                nodeType: "gt-edt-world::locations",
                label: "Locations",
                sorted: true,
                startCollapsed: true,
                children: this.extractTreeStructureLocations()
            },
            exits: {
                nodeType: "gt-edt-world::exits",
                label: "Exits",
                sorted: true,
                startCollapsed: true,
                children: this.extractTreeStructureExits()
            },
            collections: {
                nodeType: "gt-edt-world::collections",
                label: "Collections",
                sorted: true,
                startCollapsed: true,
                children: this.extractTreeStructureCollections()
            },
            areas: {
                nodeType: "gt-edt-world::areas",
                label: "Areas",
                sorted: true,
                startCollapsed: true,
                children: this.extractTreeStructureAreas()
            }
        };
        console.log("extracted tree", tree);
        return tree;
    }

    extractTreeStructureLocations() {
        const res = {};
        const locations = DataManager.getEntities("Location");
        for (const ref in locations) {
            const data = locations[ref];
            const type = data.type;
            res[ref] = {
                nodeType: "gt-edt-world::locations-entry",
                label: ref,
                type
            };
        }
        return res;
    }

    extractTreeStructureExits() {
        const res = {};
        const exits = DataManager.getEntities("Exit");
        for (const ref in exits) {
            const data = exits[ref];
            const type = data.type;
            res[ref] = {
                nodeType: "gt-edt-world::exits-entry",
                label: ref,
                type
            };
        }
        return res;
    }

    extractTreeStructureAreas() {
        const res = {};
        const areas = DataManager.getEntities("Area");
        for (const ref in areas) {
            const data = areas[ref];
            const type = data.type;
            res[ref] = {
                nodeType: "gt-edt-world::areas-entry",
                label: ref,
                type
            };
        }
        return res;
    }

    extractTreeStructureCollections() {
        const res = {};
        const collections = DataManager.getEntities("Collection");
        for (const ref in collections) {
            const data = collections[ref];
            const type = data.type;
            res[ref] = {
                nodeType: "gt-edt-world::collections-entry",
                label: ref,
                type
            };
        }
        return res;
    }

}
