import { elementFromHtml, clamp } from "./Helpers";

export default class ContextMenu {
    
    #menuRef = null;

    #trigger = null;

    #menuItems = [];

    #options = {};

    constructor(trigger, menuItems, options = {}) {
        this.#trigger = trigger;
        this.#menuItems = menuItems;
        this.#options = {
            event: 'contextmenu',
            ...options,
        }

        document.addEventListener('click', () => this.close(), {passive: true});
        document.addEventListener('wheel', () => this.close(), {passive: true});
        document.addEventListener('contextmenu', () => this.close(), {passive: true});

        this.#trigger.addEventListener(this.#options.event, event => {
            event.preventDefault();
            event.stopPropagation();

            this.open({x: event.clientX, y: event.clientY});
        });
    }

    open(position) {
        this.close();

        this.#menuRef = elementFromHtml(`<nav class="context-menu"></nav>`);

        for(let itemOptions of this.#menuItems) {
            const item = elementFromHtml(`
                <button type="button">
                    <i class="${itemOptions.icon}"></i>
                    <span>${itemOptions.text}</span>
                </button>
            `);

            item.addEventListener('click', () => {
                if(typeof itemOptions.click !== 'undefined') itemOptions.click();
            });
            
            this.#menuRef.append(item);
        }

        document.body.append(this.#menuRef);

        const menuRect = this.#menuRef.getBoundingClientRect();
        const windowRect = document.body.getBoundingClientRect();
        const x = clamp(position.x, 0, windowRect.width - menuRect.width);
        const y = position.y + menuRect.height > windowRect.height ? position.y - menuRect.height : position.y;

        this.#menuRef.style.left = `${x}px`;
        this.#menuRef.style.top = `${y}px`;
    }
    
    close() {
        if(this.#menuRef !== null) this.#menuRef.remove();

        this.#menuRef = null;
    }
}