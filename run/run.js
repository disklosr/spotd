"use strict";
exports.__esModule = true;
var readDirFiles = require('read-dir-files');
var fs = require('fs');
var extractor_1 = require("../src/extractor");
var sourceDir = 'src';
var destinationDir = 'dst';
var encoding = 'utf8';
var transform = function (content) { return extractor_1.extract(content); };
readDirFiles.list('run/' + sourceDir, function (err, filenames) {
    if (err)
        return console.dir(err);
    filenames.slice(1, filenames.length - 1).forEach(function (fileName) {
        var content = fs.readFileSync(fileName, encoding);
        var newFileName = fileName.replace('TEXT', 'SIG');
        fs.writeFileSync(newFileName, transform(content), encoding);
    });
});
