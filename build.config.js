export default {
    input: {
        css: [
            'src/css/main.css',
        ],
        js: [
            'src/js/index.js',
        ],
        php: [
            'src/php/index.php',
        ],
        html: [
            'src/templates/file-explorer.ejs',
        ],
    },
    output: {
        directory: 'dist',
        minify: true,
    },
}