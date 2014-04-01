    (function() {

        var debug = true;

        var config = {
            containerElement: 'script',
            // containerClass: 'ad'
        };

        var counter = 0,
            startTime = new Date().getTime(),
            hasjQuery = (window.jQuery || window.Zepto) ? true : false;

        window.LazyAds = LazyAds = {};

        console.time("lazyAds");

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

        LazyAds.find = function(tagName, className, context) {
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
        }

        LazyAds.findAdContainers = function(root) {
            var containers = LazyAds.find(config.containerElement, config.containerClass),
                node,
                isLazyAd,
                results = [];

            for (var i = 0; i < containers.length; i++) {
                node = containers[i];
                isLazyAd = (node.getAttribute('data-lazyad') !== null);
                if (isLazyAd) results.push(node);
            }

            return results;
        }

        LazyAds.findAdScripts = function(root) {
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

        LazyAds.stripCommentBlock = function(str) {
            // trim whitespace
            str = str.replace(/^\s+|\s+$/g, '');
            return str.replace('<!--', '').replace('-->', '');
        }

        LazyAds.adReplace = function(el, text) {
            var node, target;

            log('Injecting lazy-loaded Ad', el);

            text = LazyAds.stripCommentBlock(text);

            // create & append injected node
            node = document.createElement('div');
            node.className = 'lazy-ad-injected';
            target = el.parentNode.appendChild(node);

            debugger;

            // async js
            postscribe(target, text);
            counter++;
        }

        LazyAds.processAll = function(adContainers) {

            var el,
                parentEl,
                lazyAdEl,
                lazyAdElType,
                elWidth,
                elHeight,
                reqAdWidth,
                reqAdHeight,
                mq,
                sizeReqFulfilled;
            debugger
            for (var x = 0; x < adContainers.length; x++) {

                el = adContainers[x];
                parentEl = el.parentNode;
                mq = el.getAttribute('data-matchmedia') || false;
                reqAdWidth = parseInt(el.getAttribute('data-adwidth')) || false;
                reqAdHeight = parseInt(el.getAttribute('data-adheight')) || false;
                // adScripts = findAdScripts(el);


                // for (var i = 0; i < adScripts.length; i++) {
                lazyAdEl = el;

                if (reqAdWidth || reqAdHeight) {
                    elWidth = parentEl.offsetWidth;
                    elHeight = parentEl.offsetHeight;
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

                LazyAds.adReplace(el, lazyAdEl.innerHTML);

                // }

            }
        }

        LazyAds.init = function() {
            log('Lazyad init. Using jQuery/Zepto: ' + hasjQuery);

            var adContainers,
                timeToComplete;

            // find all lazyads
            adContainers = LazyAds.findAdContainers();

            if (adContainers && adContainers.length) {
                LazyAds.processAll(adContainers);
            }

            timeToComplete = (new Date().getTime() - startTime);
            timeToComplete = '~' + timeToComplete + 'ms';

            // finished
            log('Lazy-loaded count: ', counter, timeToComplete);
            console.timeEnd("lazyAds");
        }

        // dependency on ready.js
        domready(function() {
            LazyAds.init();
        });

    })();