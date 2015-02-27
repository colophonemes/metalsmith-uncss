var uncss = require('uncss');
var minimatch = require('minimatch');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');

module.exports = function plugin(options) {
  options = options || {};
  options.pattern = options.pattern ? options.pattern : '**/*.html';
  options.files = options.files ? options.files : [];
  options.uncss = options.uncss ? options.uncss : {};
  /**
   *
   * @param {Object} files
   * @param {Metalsmith} metalsmith
   * @param {Function} done
   */
  return function(files, metalsmith, done) {
	var tempPath = metalsmith.path(),
		tempFile = path.join(tempPath,'__uncsstemp.css');

	if(!options.css){
		console.log('metalsmith-uncss error: option "css" not set');
		return false;
	}
	if(!files.hasOwnProperty(options.css)){
		console.log('metalsmith-uncss error: could not find CSS file '+ options.css);
		return;
	}
	// build temporary css file
	fs.writeFileSync(tempFile, files[options.css].contents);
	options.uncss.stylesheets = [tempFile];
	// find html files
	_.each(files,function(file,key){
		if(minimatch(key,options.pattern)){
			options.files.push(files[key].contents.toString());
		}
	});
	uncss(options.files,options.uncss,function(error,output){
		if(error){
			console.log(error);
		} else {
			files[options.css].contents = output;
			fs.unlink(tempFile);
			done();
		}
	});
  };
};