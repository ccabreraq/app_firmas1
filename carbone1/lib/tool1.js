var path = require('path');
var params = require('./params');
var file = require('./file');
var parser = require('./parser');
var helper = require('./helper');

var nbOccurencies = 0;
var datos_var = []
var tool1 = {
  findMarkers : function (templatePath, callback){
    //var _files = helper.walkDirSync(process.cwd(), params.extensionParsed);
	var _files = [templatePath];
    walkReports(_files, 0, "", function () {
      //console.log(nbOccurencies + ' results in '+_files.length + ' files');
      console.log('The end! ');
	  return calback(null,datos_var);
    });
  }
};

module.exports = tool1;


function walkReports (reports, currentIndex, strToFind, callback) {
  if (currentIndex >= reports.length) {
	  //console.log(datos_var);
    return callback(null)
  }
  var _filename = reports[currentIndex];
  file.openTemplate(_filename, function (err, template) {
    // console.log('filename ' + _filename);
    walkReportFiles(template, 0, strToFind, function () {
      return walkReports(reports, ++currentIndex, strToFind, callback);
    });
  });
}

function walkReportFiles (template, currentIndex, strToFind, callback1) {
  if (currentIndex >= template.files.length) {
	 //console.log(datos_var) 
    return callback1(null);
  }
  var _file = template.files[currentIndex];

  parser.findVariables(_file.data, [], function (err, xmlWithoutVariable, variables) {
    if (err) {
      console.log('error when finding variables in ' + template.filename + err);
    }
    parser.findMarkers(xmlWithoutVariable, function (err, xmlWithoutMarkers, markers) {
      if (err) {
        console.log('error when finding markers in ' + template.filename + err);
      }
      var _allMarkers = Array.prototype.concat(variables, markers);
        if (_allMarkers.length > 0) {
			datos_var[nbOccurencies] = _allMarkers
          nbOccurencies++;		  
        }	  
      return walkReportFiles(template, ++currentIndex, strToFind, callback1);
    });
  });
}

