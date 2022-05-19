// frameworks
import {
    mix
} from "/emcJS/util/Mixin.js";
import DataState from "../../DataState.js";
import StateEntranceActiveMixin from "../../mixins/StateEntranceActiveMixin.js";

const BaseClass = mix(
    DataState
).with(
    StateEntranceActiveMixin
);

export default class DefaultEntranceState extends BaseClass {

}
