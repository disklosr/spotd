var readDirFiles = require('read-dir-files');
var fs = require('fs');

import { extract } from '../src/extractor';

const sourceDir = 'src';
const destinationDir = 'dst';
const encoding = 'utf8';


const transform = (content: string) => extract(content);


readDirFiles.list('run/' + sourceDir, (err, filenames: Array<string>) => {
  if (err) 
    return console.dir(err);
  
  filenames.slice(1, filenames.length - 1).forEach((fileName: string) => {
    let content = fs.readFileSync(fileName, encoding);
    let newFileName = fileName.replace('TEXT', 'SIG');
    fs.writeFileSync(newFileName, transform(content), encoding);
  });
});