(function() {

    var debug = true;

    var config = {
        containerElement: 'div',
        containerClass: 'ad'
    };

    var counter,
        startTime,
        eventsBound = false,
        hasjQuery = (window.jQuery || window.Zepto) ? true : false;



    // Global object
    window.LazyAds = LazyAds = {};

    // Utility functions
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

    ''.trim || (String.prototype.trim = // Use the native method if available, otherwise define a polyfill:
        function() { // trim returns a new string (which replace supports)
            return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '') // trim the left and right sides of the string
        });

    function debounce(func, wait) {
        // we need to save these in the closure
        var timeout, args, context, timestamp;

        return function() {

            // save details of latest call
            context = this;
            args = [].slice.call(arguments, 0);
            timestamp = new Date();

            // this is where the magic happens
            var later = function() {

                // how long ago was the last call
                var last = (new Date()) - timestamp;

                // if the latest call was less that the wait period ago
                // then we reset the timeout to wait for the difference
                if (last < wait) {
                    timeout = setTimeout(later, wait - last);

                    // or if not we can null out the timer and run the latest
                } else {
                    timeout = null;
                    func.apply(context, args);
                }
            };

            // we only need to set the timer now if one isn't already running
            if (!timeout) {
                timeout = setTimeout(later, wait);
            }
        }
    }

    function addEvent(evnt, elem, func) {
        if (elem.addEventListener) // W3C DOM
            elem.addEventListener(evnt, func, false);
        else if (elem.attachEvent) { // IE DOM
            elem.attachEvent("on" + evnt, func);
        } else { // No much to do
            elem["on" + evnt] = func;
        }
    }


    // Internals
    var find = function(tagName, className, context) {
        var results = [],
            selector, node, i, isLazyAd, classListSupported, querySelectorSupported,
            context = context || document;

        if (hasjQuery === true) {
            log('Using jquery')
            return $(context).find(tagname + '.' + className);
        }

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
    };

    var findAdContainers = function(root) {
        var containers = find(config.containerElement, config.containerClass),
            node,
            isLazyAd = false,
            isLoaded = false,
            results = [];

        for (var i = 0; i < containers.length; i++) {
            node = containers[i];
            isLazyAd = (node.getAttribute('data-lazyad') !== null);
            isLoaded = (node.getAttribute('data-lazyad-loaded') === "true");
            if (isLazyAd && isLoaded === false) {
                results.push(node);
            }
        }

        return results;
    };

    var findAdScripts = function(root) {
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
    };

    var stripCommentBlock = function(str) {
        // trim whitespace
        str = str.replace(/^\s+|\s+$/g, '');
        return str.replace('<!--', '').replace('-->', '').trim();
    };

    var adReplace = function(el, text) {
        var node, target;

        log('Injecting lazy-loaded Ad', el);

        text = stripCommentBlock(text);
        setTimeout(function() {
            postscribe(el, text);
        }, 0);

        // set the loaded flag
        el.setAttribute('data-lazyad-loaded', true);
        counter++;
    };

    var processAll = function(adContainers) {

        var el,
            adScripts,
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
            reqAdWidth = parseInt(el.getAttribute('data-adwidth'), 0) || false;
            reqAdHeight = parseInt(el.getAttribute('data-adheight'), 0) || false;
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
                        // log('Lazy-loaded container dimensions fulfilment not met.', reqAdWidth, reqAdHeight, elWidth, elHeight, el, lazyAdEl);
                        break;
                    }
                }

                if (mq !== false && matchMedia(mq).matches === false) {
                    // log('Lazy-loaded Ad media-query fulfilment not met.', el, lazyAdEl);
                    break;
                }

                adReplace(el, lazyAdEl.innerHTML);

            }

        }
    };

    // Expose init method
    LazyAds.init = function() {
        var adContainers,
            timeToComplete;

        // reset replaced nodes counter
        counter = 0;

        // reset timer
        startTime = new Date().getTime();

        log('Lazyad init. Using jQuery/Zepto: ' + hasjQuery);

        if (eventsBound === false) {
            // watch the resize event
            addEvent('resize', window, debounce(function(e) {
                LazyAds.init();
            }, 250));
            eventsBound = true;
        }

        // find all lazyads
        adContainers = findAdContainers();

        if (adContainers && adContainers.length > 0) {
            processAll(adContainers);
        }

        timeToComplete = (new Date().getTime() - startTime);
        timeToComplete = '~' + timeToComplete + 'ms';

        // finished
        log('Lazy-loaded count: ', counter, timeToComplete);
    };

    // dependency on ready.js
    domready(function() {
        LazyAds.init();
    });

})();