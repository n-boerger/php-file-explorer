import EventBus from "./EventBus";

export default class History extends EventBus {

    #navbarRef = null;

    #paths = [];

    #position = 0;

    constructor(navbar) {
        super();

        this.#navbarRef = navbar;

        this.#navbarRef.querySelector('[data-action="history-prev"]').addEventListener('click', () => this.prev());
        this.#navbarRef.querySelector('[data-action="history-next"]').addEventListener('click', () => this.next());
    }

    push(path) {
        if(path === this.#paths[this.#paths.length - 1]) return;

        if(this.#position !== 0) {
            this.#paths = this.#paths.slice(0, this.#paths.length - this.#position);
        }
        
        this.#position = 0;

        this.#paths.push(path);

        this.update();
    }

    update() {
        this.#navbarRef.querySelector('[data-action="history-prev"]').disabled = this.#position >= this.#paths.length - 1;
        this.#navbarRef.querySelector('[data-action="history-next"]').disabled = this.#position <= 0;
    }

    prev() {
        if(this.#position >= this.#paths.length - 1) return this.update();
    
        this.#position++;

        this.update();

        this.emit('change', this.current());
    }

    next() {
        if(this.#position <= 0) return this.update();
    
        this.#position--;
        
        this.update();

        this.emit('change', this.current());
    }

    current() {
        return this.#paths[this.#paths.length - this.#position - 1];
    }
}