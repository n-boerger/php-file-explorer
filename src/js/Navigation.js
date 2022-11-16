import History from "./History";
import { elementFromHtml, getFileExtension } from "./Helpers";
import EventBus from "./EventBus";
import ContextMenu from "./ContextMenu";
import API from "./API";

export default class Navigation extends EventBus {

    #paths = {
        home: `<?= __DIR__ ?>`,
        current: `<?= __DIR__ ?>`,
    }

    #navbarRef = null;

    #listRef = null;

    #api = null;

    #history = null;
    
    constructor(navbar, list) {
        super();

        this.#navbarRef = navbar;
        this.#listRef = list;
        this.#api = new API();
        this.#history = new History(this.#navbarRef);

        this.#navbarRef.querySelector('[data-action="home"]').addEventListener('click', () => {
            this.readFolder(this.#paths.home);
        });
        this.#navbarRef.querySelector('[data-action="reload"]').addEventListener('click', () => {
            this.readFolder(this.#paths.current, true);
        });

        this.#history.on('change', path => this.readFolder(path, true));

        new ContextMenu(this.#listRef, [
            {text: 'New file'},
            {text: 'New folder'},
        ]);

        new ContextMenu(this.#navbarRef.querySelector('[data-action="menu"]'), [
            {text: 'Show / hide terminal', click: () => this.emit('toggle-terminal')},
        ], {
            event: 'click',
        });

        this.readFolder(this.#paths.current);
    }

    async readFolder(path, ignoreHistory) {
        const data = await this.#api.get('/folder', { folder: path });
    
        if(!data) return; // error handling
    
        this.#paths.current = data.path;

        if(!ignoreHistory) this.#history.push(data.path);
    
        this.#listRef.innerHTML = '';
        
        const files = data.contents;
    
        for(let file of files) {
            const fileElement = elementFromHtml(`
                <button type="button" title="${file.name}" class="file-list-item type-${file.type}"><span>${file.name}</span></button>
            `);
            let options;
    
            if(file.type === 'file') {
                fileElement.prepend(elementFromHtml(`<i class="fiv-hct fiv-icon-${getFileExtension(file.name)}"></i>`));
    
                fileElement.addEventListener('click', () => {
                    this.emit('read-file', `${data.path}${file.name}`);
                });
    
                options = [
                    { text: 'Open', click: () => fileElement.click() },
                    { text: 'Open with browser', click: () => this.#api.openInBrowser('/file/download', { file: `${data.path}${file.name}` }) },
                    { text: 'Download', click: () => this.#api.download('/file/download', { file: `${data.path}${file.name}` }) },
                    { text: 'Rename' },
                    { text: 'Delete' },
                ];
            } else if(file.type === 'folder') {
                if(file.name === '..') {
                    fileElement.prepend(elementFromHtml(`<i class="bi bi-arrow-90deg-up"></i>`));
                } else {
                    fileElement.prepend(elementFromHtml(`<i class="bi bi-folder2"></i>`));
                }
                
                fileElement.addEventListener('click', () => {
                    this.readFolder(`${data.path}${file.name}`);
                });
    
                options = [
                    { text: 'Open', click: () => fileElement.click() },
                    { text: 'Download as zip' },
                    { text: 'Rename' },
                    { text: 'Delete' },
                ];
            }
    
            new ContextMenu(fileElement, options);
    
            this.#listRef.append(fileElement);
        }
    }
}