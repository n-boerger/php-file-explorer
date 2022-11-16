export default class API {

    #baseUrl = '';

    constructor() {
        this.#baseUrl = `${location.origin}${location.pathname}`;
    }

    async get(route, params) {
        const searchParams = new URLSearchParams({ ...params, route });

        try {
            const response = await fetch(`${this.#baseUrl}?${searchParams.toString()}`, {
                method: 'GET',
            });

            return await response.json();
        } catch(exception) {
            console.error(exception);
        }
    }

    async put(route, params) {
        const searchParams = new URLSearchParams({ route });

        try {
            const response = await fetch(`${this.#baseUrl}?${searchParams.toString()}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            return await response.json();
        } catch(exception) {
            console.error(exception);
        }
    }

    async post(route, params) {
        const searchParams = new URLSearchParams({ route });

        try {
            const response = await fetch(`${this.#baseUrl}?${searchParams.toString()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            return await response.json();
        } catch(exception) {
            console.error(exception);
        }
    }

    download(route, params) {
        const link = document.createElement('a');

        const searchParams = new URLSearchParams({ ...params, route });
        
        link.href = `${this.#baseUrl}?${searchParams.toString()}`;
        link.download = true;
    
        document.body.append(link);
    
        link.click();
    
        setTimeout(link.remove, 1);
    }

    openInBrowser(route, params) {
        const link = document.createElement('a');

        const searchParams = new URLSearchParams({ ...params, route });
        
        link.href = `${this.#baseUrl}?${searchParams.toString()}`;
        link.target = '_blank';
    
        document.body.append(link);
    
        link.click();
    
        setTimeout(link.remove, 1);
    }
}