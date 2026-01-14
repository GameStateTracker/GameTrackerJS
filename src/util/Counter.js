export default class Counter {

    #count = 0;

    add() {
        this.#count += 1;
        return this.#count === 1;
    }

    sub() {
        if (this.#count > 0) {
            this.#count -= 1;
            return this.#count === 0;
        }
        return false;
    }

    get value() {
        return this.#count;
    }

}
