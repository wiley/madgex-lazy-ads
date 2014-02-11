(function() {

    var debug = true;

    var config = {
        containerElement: 'div',
        containerClass: 'ad'
    };

    var counter = 0,
        hasjQuery = (window.jQuery || window.jQuery) ? true : false;


    function log() {
        if (debug === true && window.console) {
            // Only run on the first time through - reset this function to the appropriate console.log helper
            if (Function.prototype.bind) {
                log = Function.prototype.bind.call(console.log, console);
            } else {
                log = function() {
                    Function.prototype.apply.call(console.log, console, arguments);
                };
            }

            log.apply(this, arguments);
        }
    }

    function find(tagName, className, context) {
        var results = [],
            selector, node, i, isLazyAd,
            context = context || document,
            classListSupported = 'classList' in document.createElement("_"),
            querySelectorSupported = 'querySelectorAll' in document;


        if (querySelectorSupported) {
            selector = tagName;
            selector += className ? '.' + className : '';
            results = context.querySelectorAll(selector);

        } else {
            q = context.getElementsByTagName(tagName);

            for (i = 0; i < q.length; i++) {
                node = q[i];
                if (className === false) {
                    results.push(node);
                } else {
                    if (classListSupported) {
                        if (node.classList.contains(className)) {
                            results.push(node);
                        }
                    } else {
                        if (node.className && node.className.split(/\s/).indexOf(className) !== -1) {
                            results.push(node);
                        }
                    }
                }
            }
        }

        return results;
    }

    function findAdContainers(root) {
        var containers = find(config.containerElement, config.containerClass),
            node,
            results = [];

        for (var i = 0; i < containers.length; i++) {
            node = containers[i];
            isLazyAd = (node.getAttribute('data-lazyad') !== null);
            if (isLazyAd) results.push(node);
        }

        return results;
    }

    function findAdScripts(root) {
        var ads = find('script', false, root),
            node,
            type,
            results = [];

        for (var i = 0; i < ads.length; i++) {
            node = ads[i];
            type = node.getAttribute('type');
            if (type && type === 'text/lazyad') {
                results.push(node);
            }
        }

        return results;
    }

    function stripCommentBlock(str) {
        return str.replace('<!--', '').replace('-->', '');
    }

    function adReplace(el, text) {
        log('Injecting lazy-loaded Ad', el);
        postscribe(el, stripCommentBlock(text));
        counter++;
    }

    function processAll(adContainers) {

        var el,
            lazyAdEl,
            lazyAdElType,
            elWidth,
            elHeight,
            reqAdWidth,
            reqAdHeight,
            mq,
            sizeReqFulfilled;

        for (var x = 0; x < adContainers.length; x++) {

            el = adContainers[x];
            mq = el.getAttribute('data-matchmedia') || false;
            reqAdWidth = parseInt(el.getAttribute('data-adwidth')) || false;
            reqAdHeight = parseInt(el.getAttribute('data-adheight')) || false;
            adScripts = findAdScripts(el);


            for (var i = 0; i < adScripts.length; i++) {
                lazyAdEl = adScripts[i];

                if (reqAdWidth || reqAdHeight) {
                    elWidth = el.offsetWidth;
                    elHeight = el.offsetHeight;
                    sizeReqFulfilled = true;

                    if (reqAdWidth && (reqAdWidth > elWidth)) sizeReqFulfilled = false;
                    if (reqAdHeight && (reqAdHeight > elHeight)) sizeReqFulfilled = false;

                    if (sizeReqFulfilled === false) {
                        log('Lazy-loaded container dimensions fulfilment not met.', reqAdWidth, reqAdHeight, elWidth, elHeight, el, lazyAdEl);
                        break;
                    }
                }

                if (mq !== false && matchMedia(mq).matches === false) {
                    log('Lazy-loaded Ad media-query fulfilment not met.', el, lazyAdEl);
                    break;
                }

                adReplace(el, lazyAdEl.innerHTML);

            }

        }
    }

    function init() {
        log('Lazyad init. Using jQuery/Zepto: ' + hasjQuery);

        var adContainers;

        // find all lazyads
        adContainers = findAdContainers();

        if (adContainers && adContainers.length > 0) {
            processAll(adContainers);
        }

        // finished
        log('Lazy-loaded count: ', counter);
    }

    // dependency on ready.js
    domready(function() {
        init();
    });

})();