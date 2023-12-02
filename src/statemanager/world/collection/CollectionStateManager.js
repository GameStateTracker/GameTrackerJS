import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultCollectionState from "../../../state/world/collection/DefaultCollectionState.js";

const CollectionStateManager = new WorldStateManager(DefaultCollectionState, "collections");
if (!WorldStateManagerRegistry.has("Collection")) {
    WorldStateManagerRegistry.register("Collection", CollectionStateManager);
}

export default CollectionStateManager;
