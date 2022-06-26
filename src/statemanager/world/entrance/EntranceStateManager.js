import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultEntranceState from "../../../state/world/entrance/DefaultEntranceState.js";

const EntranceStateManager = new WorldStateManager(DefaultEntranceState, "exit");
if (!WorldStateManagerRegistry.has("entrance")) {
    WorldStateManagerRegistry.register("entrance", EntranceStateManager);
}

export default EntranceStateManager;
