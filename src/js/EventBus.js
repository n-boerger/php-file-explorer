export default class EventBus {

    #callbacks = {};

    on(event, callback) {
        if(typeof this.#callbacks[event] === 'undefined') {
            this.#callbacks[event] = [];
        }

        this.#callbacks[event].push(callback);
    }

    emit(event, data) {
        if(typeof this.#callbacks[event] === 'undefined') return;

        for(const callback of this.#callbacks[event]) {
            callback(data);
        }
    }
}