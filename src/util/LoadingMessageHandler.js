function defaultFn(msg) {
    console.log(msg);
}

let fn = defaultFn;

class LoadingMessageHandler {

    registerCallback(value) {
        if (typeof value == "function") {
            fn = value;
        } else {
            fn = defaultFn
        }
    }

    updateMessage(message) {
        fn(message);
    }

}

export default new LoadingMessageHandler();
