import { debug, extract } from '../src/extractor';
import * as fs from 'fs';


const encoding = 'utf8';

const startFile = 1
const lastFile = 20;
const sourceFolder = './test/src/';
const destFolder = './test/dst/';


const buildSrcFileName = (index: number) => sourceFolder + index + '.txt';
const buildDstFileName = (index: number) => destFolder + index + '.txt';

for (var i = startFile; i <= lastFile; i++) {
    console.log('#' + i)
    let content = fs.readFileSync(buildSrcFileName(i), encoding);
    let signature = extract(content);
    let debugInfo = debug(content);
    console.log(debugInfo);
    fs.writeFileSync(buildDstFileName(i), signature + '\n##################\n' + debugInfo, {encoding: 'utf8'});
}