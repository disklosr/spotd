import { debug } from '../src/extractor';

var readDirFiles = require('read-dir-files');
var fs = require('fs');


const sourceDir = 'src';
const destinationDir = 'dst';
const encoding = 'utf8';


const transform = (content: string) => debug(content);


process.chdir('./test');
readDirFiles.list(sourceDir, (err: object, filenames: Array<string>) => {
  if (err) 
    return console.log(err);
  
  filenames.slice(1, filenames.length - 1).forEach((fileName: string) => {
    let content = fs.readFileSync(fileName, encoding);
    let newFileName = fileName.replace(sourceDir, destinationDir);
    fs.writeFileSync(newFileName, transform(content), encoding);
  });
});