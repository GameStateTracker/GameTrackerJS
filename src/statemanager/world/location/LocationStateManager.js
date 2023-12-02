import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultLocationState from "../../../state/world/location/DefaultLocationState.js";

const LocationStateManager = new WorldStateManager(DefaultLocationState, "locations");
if (!WorldStateManagerRegistry.has("Location")) {
    WorldStateManagerRegistry.register("Location", LocationStateManager);
}

export default LocationStateManager;
