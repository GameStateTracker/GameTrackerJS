import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultEntranceState from "../../../state/world/entrance/DefaultEntranceState.js";

const EntranceStateManager = new WorldStateManager(DefaultEntranceState, "exits");
if (!WorldStateManagerRegistry.has("Entrance")) {
    WorldStateManagerRegistry.register("Entrance", EntranceStateManager);
}

export default EntranceStateManager;
