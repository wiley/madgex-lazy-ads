// simple time helper
function currTime() {
    var d = new Date();
    return d.toLocaleTimeString();
}

// simple indicator of viewport width
function updatePlaceHolder() {
    var placeholder = document.getElementById('windowDimensions'),
        width = window.document.documentElement.clientWidth,
        height = window.document.documentElement.clientHeight;

    placeholder.innerHTML = width + ' px';
}

window.addEventListener('resize', updatePlaceHolder);

window.addEventListener('load', updatePlaceHolder);