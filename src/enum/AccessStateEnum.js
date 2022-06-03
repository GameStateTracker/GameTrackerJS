// frameworks
import Enum from "/emcJS/data/Enum.js";

export default class AccessStateEnum extends Enum {

    static UNAVAILABLE = new this("unavailable");

    static POSSIBLE = new this("possible");

    static AVAILABLE = new this("available");

    static OPENED = new this("opened");

}
