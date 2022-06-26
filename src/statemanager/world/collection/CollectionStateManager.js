import WorldStateManagerRegistry from "../../WorldStateManagerRegistry.js";
import WorldStateManager from "../WorldStateManager.js";
import DefaultCollectionState from "../../../state/world/collection/DefaultCollectionState.js";

const CollectionStateManager = new WorldStateManager(DefaultCollectionState, "collection");
if (!WorldStateManagerRegistry.has("collection")) {
    WorldStateManagerRegistry.register("collection", CollectionStateManager);
}

export default CollectionStateManager;
