import EntityState from "@emcjs/core/data/state/entity/EntityState.js";
import {mix} from "@emcjs/core/mixin/Mixin.js";
import StateEntranceActiveMixin from "../../mixins/StateEntranceActiveMixin.js";

const BaseClass = mix(EntityState).with(StateEntranceActiveMixin);

export default class DefaultEntranceState extends BaseClass {

}
