const VALID_NAME = /[a-zA-Z0-9_./-]+/;

export default class DataState extends EventTarget {

    #ref;

    #props = {};

    constructor(ref, props = {}) {
        if (typeof ref != "string") {
            throw new TypeError(`ref parameter must be of type "string" but was "${typeof ref}"`);
        }
        if (!ref) {
            throw new Error("ref parameter must not be empty");
        }
        if (!VALID_NAME.test(ref)) {
            throw new Error("ref parameter can only include the following characters [a-zA-Z0-9_./-]");
        }
        super();
        /* --- */
        this.#ref = ref;
        this.#props = props;
    }

    get ref() {
        return this.#ref;
    }

    get props() {
        return this.#props;
    }

}
