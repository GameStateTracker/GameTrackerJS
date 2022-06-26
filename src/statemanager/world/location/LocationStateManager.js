import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultLocationState from "../../../state/world/location/DefaultLocationState.js";

const LocationStateManager = new WorldStateManager(DefaultLocationState, "location");
if (!WorldStateManagerRegistry.has("location")) {
    WorldStateManagerRegistry.register("location", LocationStateManager);
}

export default LocationStateManager;
