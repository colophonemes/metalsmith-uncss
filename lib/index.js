var uncss = require('uncss');
var minimatch = require('minimatch');
var _ = require('lodash');
var path = require('path');

module.exports = function plugin(options) {
  // set up default options
  options = options || {};
  if(!options.output){
  	throw new Error('metalsmith-uncss requires the "output" to be set.');
  }
  options.html = options.html ? (typeof options.html === 'string' ? [options.html] : options.html) : [];
  options.css = options.css ? (typeof options.css === 'string' ? [options.css] : options.css) : [];
  options.removeOriginal = options.removeOriginal ? options.removeOriginal : true;
  options.uncss = options.uncss ? options.uncss : {};
  if(options.basepath){
  	// add basepath to all css files
	if(options.css.length>0){
  		_.each(options.css,function (key,i){
  			options.css[i] = path.join(options.basepath,key);
  		});
  	}
  	// add basepath to output file
  	options.output = path.join(options.basepath,options.output);
  }
  // Set a dummy stylesheet to stop UnCSS trying 
  // to parse the CSS referenced in our HTML files
  // (which so far only exists as a Buffer in the
  //  Metalsmith object)
  options.uncss.stylesheets = [path.join(__dirname,'dummy.css')];  
  

  /**
   *
   * @param {Object} files
   * @param {Metalsmith} metalsmith
   * @param {Function} done
   */
  return function (files, metalsmith, done) {
	var html = [];

	// find CSS files if we don't have any already
	if(options.css.length===0){
		_.each(files,function (file,key){
			if( minimatch(key,'**/*.css')){
				options.css.push(key);
			}
		});
	}
	// get raw CSS from the file list
	options.uncss.raw = [];
	_.each(options.css, function(file){
		var contents = files[file].contents.toString();
		if(contents && contents !== 'undefined'){
			options.uncss.raw.push(contents);
		}
	});
	if(options.uncss.raw.length === 0){
		throw new Error('No CSS to import');
	}
	options.uncss.raw = options.uncss.raw.join('\n\n');
	// get HTML files if we don't have them already
	if(options.html.length===0){
		_.each(files,function (file,key){
			if( minimatch(key,'**/*.+(html|htm)')){
				options.html.push(key);
			}
		});
	}
	// get HTML file contents
	_.each(options.html,function (key){
		if(files[key].contents.toString()){
			html.push( files[key].contents.toString() );
		} else {
			console.warn('metalsmith-uncss — Warning, empty HTML file was excluded: ' + key);
		}
	});
	// run UnCSS on our files!
	uncss(html,options.uncss,function(error,output){
		if(error){
			// On UNCSS error, log to the console, and cancel the build
			console.log(error);
			return;
		} else {
			// delete original input files
			if(options.removeOriginal){
				_.each(options.css,function(file){
					delete(files[file]);
				});
			}
			// push our css back into the main Metalsmith object
			files[options.output] = {
				// remove filename comment for our dummy CSS file
				contents : output.substr(0,4) === '/***' ? output.split("\n").slice(1).join("\n") : output 
			};
			// hand control back to Metalsmith
			done();
		}
	});
  };
};