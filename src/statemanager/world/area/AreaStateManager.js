import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultAreaState from "../../../state/world/area/DefaultAreaState.js";

const AreaStateManager = new WorldStateManager(DefaultAreaState, "area");
if (!WorldStateManagerRegistry.has("area")) {
    WorldStateManagerRegistry.register("area", AreaStateManager);
}

export default AreaStateManager;
