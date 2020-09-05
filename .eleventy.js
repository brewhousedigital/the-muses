const { DateTime } = require("luxon");
const fs = require("fs");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");


// Custom additions
const MinifyCSS = require("clean-css");
const { minify } = require("terser");
const slugify = require("slugify");


module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginSyntaxHighlight);
    eleventyConfig.addPlugin(pluginNavigation);

    eleventyConfig.setDataDeepMerge(true);

    eleventyConfig.addLayoutAlias("post", "layouts/post.njk");

    eleventyConfig.addFilter("readableDate", dateObj => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("LLL dd, yyyy");
    });

    // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    eleventyConfig.addFilter('htmlDateString', (dateObj) => {
        return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
    });

    // Get the first `n` elements of a collection.
    eleventyConfig.addFilter("head", (array, n) => {
        if( n < 0 ) {
            return array.slice(n);
        }

        return array.slice(0, n);
    });




    // Custom
    eleventyConfig.addFilter("minifyCSS", function(code) {
        return new MinifyCSS({}).minify(code).styles;
    });

    eleventyConfig.addFilter("slugURL", function(urlString) {
        return slugify(urlString, {
            replacement: '-',
            remove: undefined,
            lower: true,
            strict: true
        });
    });

    eleventyConfig.addNunjucksAsyncFilter("minifyJS", async function (code, callback) {
        try {
            const minified = await minify(code);
            callback(null, minified.code);
        } catch (error) {
            console.error("Terser error: ", error);
            // Fail gracefully.
            callback(null, code);
        }
    });

    eleventyConfig.addShortcode("embedYoutube", function(videoURL) {
        return "<div class='embed-container'><iframe src='" + videoURL + "' allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture' allowfullscreen></iframe></div>";
    });

    eleventyConfig.addFilter("readableDateString", dateObj => {
        return DateTime.fromISO(dateObj, {zone: 'utc'}).toFormat("LLL dd, yyyy");
    });

    // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    eleventyConfig.addFilter('htmlDateStringString', (dateObj) => {
        return DateTime.fromISO(dateObj, {zone: 'utc'}).toFormat('yyyy-LL-dd');
    });





    eleventyConfig.addCollection("tagList", function(collection) {
        let tagSet = new Set();
        collection.getAll().forEach(function(item) {
            if( "tags" in item.data ) {
                let tags = item.data.tags;

                tags = tags.filter(function(item) {
                    switch(item) {
                        // this list should match the `filter` list in tags.njk
                        case "all":
                        case "nav":
                        case "post":
                        case "posts":
                            return false;
                    }

                    return true;
                });

                for (const tag of tags) {
                    tagSet.add(tag);
                }
            }
        });

        // returning an array in addCollection works in Eleventy 0.5.3
        return [...tagSet];
    });

    eleventyConfig.addCollection("tagListCloud", function(collection) {
        let tagSet = new Set();
        collection.getAll().forEach(function(item) {
            if( "tags" in item.data ) {
                let tags = item.data.tags;

                tags = tags.filter(function(item) {
                    switch(item) {
                        // this list should match the `filter` list in tags.njk
                        case "all":
                        case "nav":
                        case "post":
                        case "posts":

                        // Authors
                        case "damon":
                        case "steve":
                        case "zach":
                            return false;
                    }

                    return true;
                });

                for (const tag of tags) {
                    tagSet.add(tag);
                }
            }
        });

        // returning an array in addCollection works in Eleventy 0.5.3
        // Arrays and sets are not the same. have to convert to an array
        tagSet = Array.from(tagSet).sort();
        return tagSet;
    });

    eleventyConfig.addCollection("tagListAuthors", function(collection) {
        let tagSet = new Set();

        collection.getAll().forEach(function(item) {
            if( "tags" in item.data ) {
                let tags = item.data.tags;

                tags = tags.filter(function(item) {
                    switch(item) {
                        // this list should match the `filter` list in tags.njk
                        case "damon":
                        case "steve":
                        case "zach":
                            return true;
                    }

                    return false;
                });

                for (const tag of tags) {
                    tagSet.add(tag);
                }
            }
        });

        // returning an array in addCollection works in Eleventy 0.5.3
        // Arrays and sets are not the same. have to convert to an array
        tagSet = Array.from(tagSet).sort();
        return tagSet;
    });

    eleventyConfig.addPassthroughCopy("img");
    eleventyConfig.addPassthroughCopy("css");

    /* Markdown Overrides */
    let markdownLibrary = markdownIt({
        html: true,
        breaks: true,
        linkify: true
    }).use(markdownItAnchor, {
        permalink: true,
        permalinkClass: "direct-link",
        permalinkSymbol: "#"
    });
    eleventyConfig.setLibrary("md", markdownLibrary);

    // Browsersync Overrides
    eleventyConfig.setBrowserSyncConfig({
        callbacks: {
            ready: function(err, browserSync) {
                const content_404 = fs.readFileSync('_site/404.html');

                browserSync.addMiddleware("*", (req, res) => {
                    // Provides the 404 content without redirect.
                    res.write(content_404);
                    res.end();
                });
            },
        },
        ui: false,
        ghostMode: false
    });

    return {
        templateFormats: [
            "md",
            "njk",
            "html",
            "liquid"
        ],

        // If your site lives in a different subdirectory, change this.
        // Leading or trailing slashes are all normalized away, so don’t worry about those.

        // If you don’t have a subdirectory, use "" or "/" (they do the same thing)
        // This is only used for link URLs (it does not affect your file structure)
        // Best paired with the `url` filter: https://www.11ty.dev/docs/filters/url/

        // You can also pass this in on the command line using `--pathprefix`
        // pathPrefix: "/",

        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "njk",
        dataTemplateEngine: "njk",

        // These are all optional, defaults are shown:
        dir: {
            input: ".",
            includes: "_includes",
            data: "_data",
            output: "_site"
        }
    };
};
