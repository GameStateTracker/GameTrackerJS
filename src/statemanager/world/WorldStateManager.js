import EntityStateManager from "@emcjs/core/data/state/entity/EntityStateManager.js";
import WorldResource from "../../data/resource/WorldResource.js";

export default class WorldStateManager extends EntityStateManager {

    constructor(DefaultState, name) {
        const resourceData = WorldResource.get(name);
        super(DefaultState, resourceData);
    }

}
