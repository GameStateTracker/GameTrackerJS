import WorldResource from "../../data/resource/WorldResource.js";
import SimpleStateManager from "../SimpleStateManager.js";

export default class WorldStateManager extends SimpleStateManager {

    constructor(DefaultState, name) {
        const resourceData = WorldResource.get(name);
        super(DefaultState, resourceData);
    }

}
