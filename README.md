# Metalsmith UnCSS

A [metalsmith](http://metalsmith.io) plugin based on Giacomo Martino's [uncss](https://github.com/giakki/uncss)

- [Installation](#installation)
- [Usage](#usage)
	- [Options](#options)


## <a name="installation"></a>Installation

1. Install the package with [npm](http://npmjs.org)

```sh
npm install --save metalsmith-uncss
```

2. Include `metalsmith-uncss` in your Metalsmith project dependencies

```js
var uncss = require('metalsmith-uncss');
```

## <a name="usage"></a>Usage

Add `uncss` to your Metalsmith pipeline

```js
var Metalsmith = require('metalsmith');
var uncss = require('metalsmith-uncss');

Metalsmith(__dirname)
	.source('./src')
	.destination('./dest')
	.use(uncss({
		css: ['bootstrap.css','app.css'],	// CSS files to run through UnCSS
		html: ['index.html','test.html'],	// HTML files to test the CSS files against
		output: 'uncss-output.css',			// output CSS filename
		basepath: 'styles',					// optional base path where all your css files are stored
		removeOriginal: true,				// remove original CSS files from the build
		uncss: {							// uncss options - passed directly to UnCSS
			ignore: ['.added-at-runtime','#do-not-remove']
		}
	}))
	.build();
```


### <a name="options"></a>Options

#### css <a name="optionsCss"></a>

`String | Array` *required*

A string or array of CSS files to check against the input HTML files. Files will be concatenated by UnCSS in the order that they are supplied.

**This is a required option**

*UnCSS usually works by detecting CSS files linked in the header of the supplied HTML files. However, because at this stage of the process the CSS files only exist as part of Metalsmith's build pipeline, UnCSS won't be able to find them. To get around this, it's necessary to override the default behaviour and manually pass the file contents through to UnCSS as the `raw` option.*


#### html  <a name="optionsHtml"></a>

`String | Array` *optional*

The HTML files that UnCSS will check CSS files against. If not specified, this defaults to every HTML file currently in the project build pipeline. These are passed to UnCSS as the `files` argument.

#### output

`String` *required*

The name of the output file.

#### basepath <a name="optionsBasepath"></a>

`String` *optional*

Optional base path that will be prepended to all css files (i.e. those supplied by `css` and `output` options).

For example:

```js
// Without basepath
.use(uncss({
	css: ['styles/bootstrap.css','styles/app.css'],
	output: 'styles/uncss-output.css'
}))

// With basepath
.use(uncss({
	css: ['bootstrap.css','app.css'],
	output: 'uncss-output.css',
	basepath: 'styles'
}))

```

#### removeOriginal <a name="optionsOriginal"></a>

`Boolean` *optional*

Remove the original CSS files (i.e. those supplied by `css`) from the build pipeline. Defaults to `true`.

#### uncss <a name="optionsUncss"></a>

`Object` *optional*

Object of options to pass to UnCSS as the `options` argument. Supports all options except for `raw`, which `metalsmith-uncss` uses to feed in css files from its `css` option ([see above](#optionsCss)).

