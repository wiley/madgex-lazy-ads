Lazy Ads
========

Deliver synchronous ads asynchronously without modifying the ad code. Conditionally load ads for responsive layouts using the ad container's dimensions, or a media query.


## The problem
Ads have long been the elephant in the room in regards to Responsive Web Design, with few providers supporting the fluid, flexible layouts that define responsive websites. Here at [Madgex](http://madgex.com/) we deal with over 30 ad providers and many show no signs of supporting responsive layouts.

##### Approach 1 - Hide the ad container using CSS
It's trivially simple to hide the ad using CSS if a media query condition is met. However, this doesn't prevent the ad code from executing. An ad impression is still recorded, even if the ad isn't actually visible. Furthermore, potentially pointless network round-trips to load the ad content would still take place. This is detrimental to the site's speed and performance, especially on a mobile device.

##### Approach 2 - Force the ads to be flexible
Forcing images or flash objects to be flexible quickly creates illegible ads on small screened devices. Furthermore, some ad providers wrap ads in multiple layers of unsemantic, inline pixel width defined elements. These can be difficult (or highly brittle, or outright impossible) to make flexible.

##### Approach 3 - Wait for ad providers
Seeing as most ad providers are still using the 90's-web `document.write` as a delivery technique, we're not holding our breath.

## Our proposed approach
Leave ads scripts intact, but wrap them to prevent inline execution. Place load criteria on the element wrapping the ad, either using dimensions, or a media query. On DOMready, [lazily](http://en.wikipedia.org/wiki/Lazy_loading) inject the ads if the criteria is met.

#### Putting it all together
The lazy ads loader sits on top of a couple of polyfills & tried and tested open source projects:
* [PostScribe](https://github.com/krux/postscribe/) by Krux Digital, Inc. overrides document.write to provide async support.
* [indexof polyfill](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf) for indexOf support on older browsers (via MDN)
* [Media.match](https://github.com/weblinc/media-match) media queries polyfill for older browsers.
* [domReady](https://github.com/ded/domready) a tiny, sturdy DOMReady implementaiton for older browsers.

Once minified & gzipped the script weighs in at ~6.5KB.

## An additional benefit - performance
This asynchronous approach to loading ads also provides a fair performance boost for the page content as `document.write` is no longer blocking rendering. This performance bottleneck has been [widely documented](http://www.stevesouders.com/blog/2012/04/10/dont-docwrite-scripts/), yet ad providers continue to use the technique.


## Basic usage
Load the script.
``` html
  <script src="../path_to/lazyad-loader.min.js" async></script>
```

Wrap the ad script to prevent it from running inline. The `data-lazyad` attribute is a required hook.

``` html
  <!-- wrap all ad scripts in a lazyad div & lazyad script  -->
  <div class="ad" data-lazyad>
    <script type="text/lazyad">
      <!--
        ADSCRIPT (including wrapping <script> tag)
      -->
    </script>
  </div>
```

**Note: the HTML comments wrapping the ad script are required to prevent the ads closing `</script>` tag from closing our `text/lazyad` wrapper prematurely.**

## Adding conditions
#### Container dimensions 
This ad will only load if the div container is at least 728px x 90px (leaderboard) on load.
``` html
  <!-- wrap all ad scripts in a lazyad div & lazyad script  -->
  <div class="ad" data-lazyad data-adwidth="728" data-adheight="90">
    <script type="text/lazyad">
      <!--
        ADSCRIPT (including wrapping <script> tag)
      -->
    </script>
  </div>
```

#### Media Query 
This ad will only load if the viewport is a screen & at least 800px wide on load.
``` html
  <!-- wrap all ad scripts in a lazyad div & lazyad script  -->
  <div class="ad" data-lazyad data-matchmedia="only screen and (min-width: 800px)">
    <script type="text/lazyad">
      <!--
        ADSCRIPT (including wrapping <script> tag)
      -->
    </script>
  </div>
```

## Support
IE7 and up, and modern browsers (Chrome, FF, Opera etc).

## How to build
You need to have [Node.js](http://nodejs.org/download/) & NPM installed before you start.

If you don't have the Grunt command line interface, install it as a global package
```bash
npm install -g grunt-cli
```
Clone the lazy-ads repo
```bash
git clone https://github.com/madgex/lazy-ads.git
```
CD into the directory
```bash
cd lazy-ads
```
Run `grunt` to create the distribution packages in the `dist/` directory
```bash
grunt
```


## Feedback
Although we've had initial success in this approach we're keen to hear your [feedback](https://github.com/madgex/lazy-ads/issues/new).

## MIT license
Lazy Ads is released under the [MIT license](https://github.com/madgex/lazy-ads/blob/master/LICENSE).
