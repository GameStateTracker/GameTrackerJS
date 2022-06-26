import ItemsRecource from "../../data/resource/ItemsResource.js";
import SimpleStateManager from "../SimpleStateManager.js";
import DefaultItemState from "../../state/item/DefaultItemState.js";

const resourceData = ItemsRecource.get();

const ItemStateManager = new SimpleStateManager(DefaultItemState, resourceData);

export default ItemStateManager;
