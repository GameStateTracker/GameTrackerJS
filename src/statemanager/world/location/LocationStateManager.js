import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultLocationState from "../../../state/world/location/DefaultLocationState.js";

class LocationStateManager extends WorldStateManager {

    constructor() {
        super(DefaultLocationState, "location");
    }

}

const locationStateManager = new LocationStateManager();
if (!WorldStateManagerRegistry.has("location")) {
    WorldStateManagerRegistry.register("location", locationStateManager);
}

export default locationStateManager;
