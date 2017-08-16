import { detectFeaturesInText, Features } from './feature-detect';
var AsciiTable = require('cli-table');

let languageDetector = new (require('languagedetect'));

const defaultLanguage = '   ';

/** Score affected to each feature detected. The higher the score the higher the chance the line is a part of email signature and vice-versa */

const featureScoreMap = new Map([
    [Features.EMPTY_LINE, 0],
    [Features.PHONE, 5],
    [Features.EMAIL, 5],
    [Features.LINK, 5],
    [Features.LONG_LINE, -10],
    [Features.FULL_NAME, 10],
    [Features.SENTENCE, -2],
    [Features.NO_STOP_WORDS, 2],
    [Features.CAPITAL_CASE, 2],
    [Features.DOUBLE_DASH, -50],
    [Features.ENDS_WITH_PUNCTUATION, -10]
]);


/** Main routine to calculate score of each line based on detected feaures */
const calculateLineScore = function (features: Array<Features>): number {
    let lineScore = features.map(feature => featureScoreMap.get(feature) as number).reduce((prev, curr) => prev + curr, 0);
    return lineScore == 0 ? -1 : lineScore;
}

/** Calculates sum of subarray elements given a start and end indices */
const sumOfSub = function (array: Array<number>, start: number, end: number): number {
    let sum = 0;
    for (let i = start; i < end; i++) {
        sum += array[i];
    }
    return sum;
}


/** A js implementation of Kadane's algorithm to find max sum of contiguous subarray within a given array */
export const findMaxSumOfContiguousSubArray = function optimalSolution(arrIntegers: Array<number>): { startIndex: number, endIndex: number } {

    let max = 1,
        result = { startIndex: -1, endIndex: -1 };

    //console.log("Array received: " + arrIntegers)

    if (arrIntegers.length === 0) {
        return result;
    }

    //console.log(arrIntegers)

    for (let i = 1; i < arrIntegers.length; i++) {
        for (let j = 0; j < arrIntegers.length - i + 1; j++) {
            let potentialMax = sumOfSub(arrIntegers, j, j + i)
            if (potentialMax >= max) {
                max = potentialMax;
                result.startIndex = j;
                result.endIndex = i + j - 1;
            }
        }
    }
    //console.log({ sum: max, start: result.startIndex, end: result.endIndex });
    return result;
}

const updateScoresBasedOnLinePosition = (scorePerLine: Array<number>): Array<number> => {
    return scorePerLine;
}


/** Extracts a possible signature block from an arbitrary text block */
export function extract(text: string): string {
    text = text.replace(/(^[ \t]*\n){2,}/gm, "\n");
    let detectedLanguage = languageDetector.detect(text)[0][0] || defaultLanguage;
    let featuresPerLine = text.split("\n").map(line => detectFeaturesInText(line, detectedLanguage));
    let scorePerLineArray = featuresPerLine.map(features => calculateLineScore(features));
    scorePerLineArray = updateScoresBasedOnLinePosition(scorePerLineArray);
    let { startIndex, endIndex } = findMaxSumOfContiguousSubArray(scorePerLineArray);

    if(startIndex == -1 && endIndex == -1)
        return '';
    
    return text.split("\n").slice(startIndex, endIndex + 1).join("\n")
}

export function debug(text: string): string {
    text = text.replace(/(^[ \t]*\n){2,}/gm, "\n");
    let detectedLanguage = languageDetector.detect(text)[0][0] || defaultLanguage;
    let featuresPerLine = text.split("\n").map(line => detectFeaturesInText(line, detectedLanguage));
    let scorePerLineArray = featuresPerLine.map(features => calculateLineScore(features));
    scorePerLineArray = updateScoresBasedOnLinePosition(scorePerLineArray);
    let { startIndex, endIndex } = findMaxSumOfContiguousSubArray(scorePerLineArray);

    let header = ['#', 'SCR', 'TXT'];
    for(let item in Features){
        header.push(item);
    }

    let table = new AsciiTable({
        head: header
    });

    text.split("\n").forEach((line, index) => {
        let row = [index.toString(), scorePerLineArray[index].toString(), line.slice(0, 20)];
        for(let item in Features){
            if(featuresPerLine[index].map(feature => Features[feature]).indexOf(item) != -1)
                row.push('X')
            else row.push('')
        }
        table.push(row);
    })

    let returnValue = 
    `
Language: ${detectedLanguage}
startIndex: ${startIndex}
endIndex: ${endIndex}
${table}
    `;
    
    //console.log(returnValue);
    return returnValue;
}