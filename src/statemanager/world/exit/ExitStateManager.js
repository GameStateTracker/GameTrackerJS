import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultExitState from "../../../state/world/exit/DefaultExitState.js";

const ExitStateManager = new WorldStateManager(DefaultExitState, "exits");
if (!WorldStateManagerRegistry.has("Exit")) {
    WorldStateManagerRegistry.register("Exit", ExitStateManager);
}

export default ExitStateManager;
