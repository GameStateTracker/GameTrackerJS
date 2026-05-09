// frameworks
import Enum from "@emcjs/core/enum/Enum.js";

export default class AccessStateEnum extends Enum {

    #orderValue;

    constructor(value, orderValue) {
        if (orderValue != null && typeof orderValue !== "number") {
            throw new TypeError("orderValue must be null or a number");
        }
        super(value);
        this.#orderValue = orderValue;
    }

    get orderValue() {
        return this.#orderValue;
    }

    static AVAILABLE = new this("available", 0);

    static POSSIBLE = new this("possible", 1);

    static UNAVAILABLE = new this("unavailable", 2);

    static OPENED = new this("opened", 4);

}
