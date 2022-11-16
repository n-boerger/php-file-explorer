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
    output: [
        {
            path: 'dist/file-explorer.debug.php',
            minify: false,
        },
        {
            path: 'dist/file-explorer.php',
            minify: true,
        },
    ],
}