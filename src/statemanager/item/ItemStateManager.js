import EntityStateManager from "@emcjs/core/data/state/entity/EntityStateManager.js";
import ItemsRecource from "../../data/resource/ItemsResource.js";
import DefaultItemState from "../../state/item/DefaultItemState.js";

const resourceData = ItemsRecource.get();

const ItemStateManager = new EntityStateManager(DefaultItemState, resourceData);

export default ItemStateManager;
