import API from "./API";
import EventBus from "./EventBus";
import { elementFromHtml, getFileExtension, getBaseName } from "./Helpers";

export default class Editor extends EventBus {

    #containerRef = null;

    #navbarRef = null;

    #editorRef = null;

    #navigatorRef = null;

    #monaco = null;

    #file = '';

    #api = '';

    constructor(container, navbar, file, content) {
        super();

        this.#containerRef = container;
        this.#navbarRef = navbar;
        this.#file = file;
        this.#api = new API();
        
        this.#createEditor(this.#file, content);
        this.#createNavigator(this.#file);
    }

    #createEditor(file, content) {
        this.#editorRef = elementFromHtml(`<div class="file-editor"></div>`);

        this.#containerRef.append(this.#editorRef);
        
        this.#monaco = monaco.editor.create(this.#editorRef, {
            theme: 'vs-dark',
            value: content,
            language: this.#getLanguageByExtension(getFileExtension(file)),
            automaticLayout: true,
        });
    }

    #createNavigator(file) {
        this.#navigatorRef = elementFromHtml(`
            <div class="navigator">
                <button type="button" title="${file}" data-action="show"><i class="fiv-hct fiv-icon-${getFileExtension(file)}"></i> <span>${getBaseName(file)}</span></button>

                <button type="button" data-action="close"><i class="bi bi-x"></i></button>
            </div>
        `);
        this.#navigatorRef.querySelector('[data-action="show"]').addEventListener('click', () => this.show());
        this.#navigatorRef.querySelector('[data-action="show"]').addEventListener('mousedown', event => event.preventDefault());
        this.#navigatorRef.querySelector('[data-action="show"]').addEventListener('pointerdown', event => event.preventDefault());
        this.#navigatorRef.querySelector('[data-action="show"]').addEventListener('auxclick', event => {
            if(event.button !== 1) return;

            event.preventDefault();
            
            this.remove();
        });

        this.#navigatorRef.querySelector('[data-action="close"]').addEventListener('click', () => this.remove());

        this.#navbarRef.append(this.#navigatorRef);
    }

    file() {
        return this.#file;
    }

    isActive() {
        return this.#navigatorRef.classList.contains('active');
    }

    async save() {
        const data = await this.#api.put('/file', {
            file: this.#file,
            content: this.#monaco.getValue(),
        });
    
        console.log(data);
    }

    remove() {
        this.#editorRef.remove();
        this.#navigatorRef.remove();

        this.emit('remove', this);
    }

    show() {
        this.#editorRef.classList.remove('hidden');
        this.#navigatorRef.classList.add('active');
    }

    hide() {
        this.#editorRef.classList.add('hidden');
        this.#navigatorRef.classList.remove('active');
    }

    #getLanguageByExtension(extension) {
        const language = monaco.languages.getLanguages().find(language => language.extensions.includes(`.${extension}`));
    
        if(typeof language === 'undefined') return 'plaintext';
    
        return language.id;
    };

    #getLanguageMimeTypeByExtension(extension) {
        const language = monaco.languages.getLanguages().find(language => language.extensions.includes(`.${extension}`));
    
        if(typeof language === 'undefined') return 'text/plain';
    
        return language.mimetypes[0];
    };
}