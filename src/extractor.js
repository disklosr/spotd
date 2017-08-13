"use strict";
exports.__esModule = true;
var feature_detect_1 = require("./feature-detect");
var AsciiTable = require('cli-table');
var languageDetector = new (require('languagedetect'));
var defaultLanguage = '   ';
/** Score affected to each feature detected. The higher the score the higher the chance the line is a part of email signature and vice-versa */
var featureScoreMap = new Map([
    [feature_detect_1.Features.EMPTY_LINE, 0],
    [feature_detect_1.Features.PHONE, 5],
    [feature_detect_1.Features.EMAIL, 5],
    [feature_detect_1.Features.LINK, 5],
    [feature_detect_1.Features.LONG_LINE, -10],
    [feature_detect_1.Features.FULL_NAME, 10],
    [feature_detect_1.Features.SENTENCE, -2],
    [feature_detect_1.Features.NO_STOP_WORDS, 2],
    [feature_detect_1.Features.CAPITAL_CASE, 2],
    [feature_detect_1.Features.DOUBLE_DASH, -50],
    [feature_detect_1.Features.ENDS_WITH_PUNCTUATION, -10]
]);
/** Main routine to calculate score of each line based on detected feaures */
var calculateLineScore = function (features) {
    var lineScore = features.map(function (feature) { return featureScoreMap.get(feature); }).reduce(function (prev, curr) { return prev + curr; }, 0);
    return lineScore == 0 ? -1 : lineScore;
};
/** Calculates sum of subarray elements given a start and end indices */
var sumOfSub = function (array, start, end) {
    var sum = 0;
    for (var i = start; i < end; i++) {
        sum += array[i];
    }
    return sum;
};
/** A js implementation of Kadane's algorithm to find max sum of contiguous subarray within a given array */
exports.findMaxSumOfContiguousSubArray = function optimalSolution(arrIntegers) {
    var max = 0, result = { startIndex: -1, endIndex: -1 };
    console.log("Array received: " + arrIntegers);
    if (arrIntegers.length === 0) {
        return result;
    }
    result.startIndex = result.endIndex = 0;
    console.log(arrIntegers);
    for (var i = 1; i < arrIntegers.length; i++) {
        for (var j = 0; j < arrIntegers.length - i + 1; j++) {
            var potentialMax = sumOfSub(arrIntegers, j, j + i);
            if (potentialMax > max) {
                max = potentialMax;
                result.startIndex = j;
                result.endIndex = i + j - 1;
            }
        }
    }
    console.log({ sum: max, start: result.startIndex, end: result.endIndex });
    return result;
};
/** Extracts a possible signature block from an arbitrary text block */
function extract(text) {
    text = text.replace(/(^[ \t]*\n){2,}/gm, "\n");
    var detectedLanguage = languageDetector.detect(text)[0][0] || defaultLanguage;
    var featuresPerLine = text.split("\n").map(function (line) { return feature_detect_1.detectFeaturesInText(line, detectedLanguage); });
    var scorePerLineArray = featuresPerLine.map(function (features) { return calculateLineScore(features); });
    var _a = exports.findMaxSumOfContiguousSubArray(scorePerLineArray), startIndex = _a.startIndex, endIndex = _a.endIndex;
    return text.split("\n").slice(startIndex, endIndex + 1).join("\n");
}
exports.extract = extract;
function debug(text) {
    text = text.replace(/(^[ \t]*\n){2,}/gm, "\n");
    var detectedLanguage = languageDetector.detect(text)[0][0] || defaultLanguage;
    var featuresPerLine = text.split("\n").map(function (line) { return feature_detect_1.detectFeaturesInText(line, detectedLanguage); });
    var scorePerLineArray = featuresPerLine.map(function (features) { return calculateLineScore(features); });
    var _a = exports.findMaxSumOfContiguousSubArray(scorePerLineArray), startIndex = _a.startIndex, endIndex = _a.endIndex;
    var header = ['#', 'SCR', 'TXT'];
    for (var item in feature_detect_1.Features) {
        header.push(item);
    }
    var table = new AsciiTable({
        head: header
    });
    //let table: string[][] = [header];
    text.split("\n").forEach(function (line, index) {
        var row = [index.toString(), scorePerLineArray[index].toString(), line.slice(0, 20)];
        for (var item in feature_detect_1.Features) {
            if (featuresPerLine[index].map(function (feature) { return feature_detect_1.Features[feature]; }).indexOf(item) != -1)
                row.push('X');
            else
                row.push('');
        }
        table.push(row);
    });
    var returnValue = detectedLanguage + '\n' + table.toString() + '\n' + 'start: ' + startIndex + '    end: ' + endIndex;
    console.log(returnValue);
    return returnValue;
}
exports.debug = debug;
