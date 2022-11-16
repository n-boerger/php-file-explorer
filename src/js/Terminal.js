import API from "./API";

export default class Terminal {

    #containerRef = null;

    #resultRef = null;

    #commandInputRef = null;

    #dirInputRef = null;

    #api = null;

    constructor(container, result, commandInput, dirInput) {
        this.#containerRef = container;
        this.#resultRef = result;
        this.#commandInputRef = commandInput;
        this.#dirInputRef = dirInput;
        this.#api = new API();
        
        this.#commandInputRef.addEventListener('submit', event => this.runCommand(event));
    }

    toggle() {
        this.#containerRef.classList.toggle('visible');
    }

    async runCommand(event) {
        event.preventDefault();
    
        const formData = new FormData(this.#commandInputRef);
    
        if(formData.get('command') === 'clear') {
            this.#resultRef.innerHTML = '';
        }

        const data = await this.#api.post('/command', formData);
    
        this.#resultRef.innerHTML += [
            `<strong>${formData.get('dir')}$ ${formData.get('command')}</strong>`,
            data.result,
        ].join('\n');
        this.#resultRef.innerHTML += '\n';
        this.#resultRef.scrollTop = this.#resultRef.scrollHeight;
    
        this.#commandInputRef.reset();
    
        this.#dirInputRef.value = data.dir;
    }
}