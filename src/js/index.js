import Application from "./Application";

require.config({
    paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.29.1/min/vs',
    },
});

try {
    JSON.parse(localStorage.recentFiles);
} catch(error) {
    localStorage.recentFiles = JSON.stringify([]);
}

require(['vs/editor/editor.main'], () => {});

new Application();