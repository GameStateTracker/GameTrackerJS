import WorldResource from "../../resource/WorldResource.js";
import AbstractStateManager from "../AbstractStateManager.js";

export default class WorldStateManager extends AbstractStateManager {

    constructor(DefaultState, name) {
        const resourceData = WorldResource.get(name);
        super(DefaultState, resourceData);
    }

}
