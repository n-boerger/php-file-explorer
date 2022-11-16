export const clamp = (val, min, max) => {
    return Math.min(Math.max(val, min), max);
};

export const elementFromHtml = html => {
    const div = document.createElement('div');
    div.innerHTML = html.trim();

    return div.firstElementChild;
};

export const getFileExtension = path => {
    let pieces = path.split('.');

    return pieces[pieces.length - 1].toLowerCase();
};

export const getBaseName = path => {
    let pieces = path.split('/');

    return pieces[pieces.length - 1];
};