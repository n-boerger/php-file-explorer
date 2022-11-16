import Editor from "./Editor";
import Navigation from "./Navigation";
import { elementFromHtml, getFileExtension } from "./Helpers";
import Terminal from "./Terminal";
import API from "./API";

export default class Application {

    #api = null;

    #doc = {
        fileExplorerNav: document.querySelector('.file-explorer-nav'),
        fileList: document.querySelector('.file-list'),
        previews: document.querySelector('.file-previews'),
        previewNav: document.querySelector('.file-previews-nav'),
        terminal: document.querySelector('.terminal'),
        terminalResult: document.querySelector('.terminal-result'),
        terminalInput: document.querySelector('.terminal-input'),
    }

    #navigation = null;

    #terminal = null;

    #editors = [];

    constructor() {
        this.#api = new API();
        this.#navigation = new Navigation(this.#doc.fileExplorerNav, this.#doc.fileList);
        this.#terminal = new Terminal(this.#doc.terminal, this.#doc.terminalResult, this.#doc.terminalInput);
        
        this.#navigation.on('read-file', file => this.#readFile(file));
        this.#navigation.on('toggle-terminal', () => this.#terminal.toggle());

        document.addEventListener('keydown', event => {
            if((window.navigator.platform.match('Mac') ? event.metaKey : event.ctrlKey) && event.keyCode == 83) {
                event.preventDefault();

                this.#saveCurrentEditor();
            }
        }, false);

        this.#displayEmptyEditorPreviewState();
    }

    async #readFile(file) {
        const data = await this.#api.get('/file', { file: file });

        if(!data) return; // error handling

        this.#createEditor(data.path, data.content);
    }

    #createEditor(path, content) {
        let recentFiles = JSON.parse(localStorage.recentFiles) || [];
        recentFiles = recentFiles.filter(recent => recent !== path).slice(0, 4);
        localStorage.recentFiles = JSON.stringify([path, ...recentFiles]);

        const existingEditor = this.#editors.find(editor => editor.file() === path);
        if(typeof existingEditor !== 'undefined') return this.#showEditor(path);

        const emptyState = this.#doc.previews.querySelector('.empty-state');
        if(emptyState) emptyState.remove();

        const editor = new Editor(this.#doc.previews, this.#doc.previewNav, path, content);

        editor.on('remove', () => this.#removeEditor(editor));

        this.#editors.push(editor);

        this.#showEditor(path);
    }

    #showEditor(path) {
        for(let editor of this.#editors) {
            const isActive = editor.file() === path;
    
            if(isActive) {
                editor.show();
            } else {
                editor.hide();
            }
        }
    }

    #saveCurrentEditor() {
        for(let editor of this.#editors) {
            if(editor.isActive()) editor.save();
        }
    }

    #removeEditor(editorToRemove) {
        this.#editors = this.#editors.filter(editor => {
            return editor.file() !== editorToRemove.file();
        });
        
        if(this.#editors.length !== 0) this.#showEditor(this.#editors[this.#editors.length - 1].file());
        if(this.#editors.length === 0) this.#displayEmptyEditorPreviewState();
    }

    #displayEmptyEditorPreviewState() {
        this.#doc.previews.innerHTML = `
            <div class="empty-state">
                <div class="header">
                    <h1>File Explorer</h1>
                </div>
                <div class="distributor">
                    <h3>Start</h3>
                    <ul>
                        <li><button type="button" data-action="new-file"><i class="bi bi-file-plus"></i> New file...</button></li>
                        <li><button type="button" data-action="new-folder"><i class="bi bi-folder-plus"></i> New folder...</button></li>
                    </ul>
                </div>
                <div class="distributor">
                    <h3>Recent</h3>
                    <ul class="recents-list">
                        <li>No recent files opened...</li>
                    </ul>
                </div>
            </div>
        `;
    
        const recentsList = this.#doc.previews.querySelector('.recents-list');
        const recentFiles = JSON.parse(localStorage.recentFiles) || [];
    
        if(recentFiles.length) recentsList.innerHTML = '';
    
        for(let file of recentFiles) {
            const listItem = elementFromHtml(`
                <li>
                    <button type="button">
                        <i class="fiv-hct fiv-icon-${getFileExtension(file)}"></i> ${file}
                    </button>
                </li>
            `);
    
            listItem.querySelector('button').addEventListener('click', () => {
                this.#readFile(file);
            });
    
            recentsList.append(listItem);
        }
    }
}