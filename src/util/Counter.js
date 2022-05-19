const COUNT = new WeakMap();

export default class Counter {

    constructor() {
        COUNT.set(this, 0);
    }

    add() {
        const count = COUNT.get(this);
        if (count > 0) {
            COUNT.set(this, count + 1);
        } else {
            COUNT.set(this, 1);
        }
    }

    sub() {
        const count = COUNT.get(this);
        if (count > 1) {
            COUNT.set(this, count - 1);
        } else {
            COUNT.set(this, 0);
        }
    }

    get value() {
        return COUNT.get(this);
    }

}
