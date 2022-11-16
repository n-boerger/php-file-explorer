import API from "./API";

export default class Terminal {

    #dir = `<?= getcwd() ?>`;

    #containerRef = null;

    #resultRef = null;

    #commandInputRef = null;

    #api = null;

    constructor(container, result, commandInput) {
        this.#containerRef = container;
        this.#resultRef = result;
        this.#commandInputRef = commandInput;
        this.#api = new API();
        
        this.#commandInputRef.addEventListener('submit', event => this.runCommand(event));
    }

    toggle() {
        this.#containerRef.classList.toggle('visible');
    }

    async runCommand(event) {
        event.preventDefault();

        const command = this.#commandInputRef.command.value;

        if(command.trim() === 'clear') {
            this.#resultRef.innerHTML = '';
        }

        const data = await this.#api.post('/command', { dir: this.#dir, command });
    
        this.#resultRef.innerHTML += `<strong>${this.#dir}$ ${command}</strong>\n${data.result}\n`;
        this.#resultRef.scrollTop = this.#resultRef.scrollHeight;
    
        this.#commandInputRef.reset();
    
        this.#dir = data.dir;
    }
}