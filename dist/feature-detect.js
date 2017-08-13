var nlp = require('compromise');
var natural = require('natural');
var languageDetector = new (require('languagedetect'));
var tokenizer = new natural.WordTokenizer();
var stopwords = {
    french: require('./stopwords-fr.json'),
    english: require('./stopwords-en.json')
};
var selectedStopWords = stopwords.english;
var maxLengthOfSignatureLine = 60;
var digitsRegex = /\d+/;
var phoneRegex = /\+?\(?\d*\)? ?\(?\d+\)?\d*([\s.\-]\d{2,})+/g;
var emailRegex = /\b[a-z0-9-_.]+@[a-z0-9-_.]+(\.[a-z0-9]+)+/i;
var urlRegex = new RegExp(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/, 'gi');
export var Features;
(function (Features) {
    Features["EMPTY_LINE"] = "EMPTY_LINE";
    Features["PHONE"] = "PHONE";
    Features["EMAIL"] = "EMAIL";
    Features["LINK"] = "LINK";
    Features["LONG_LINE"] = "LONG_LINE";
    Features["FULL_NAME"] = "FULL_NAME";
    Features["SENTENCE"] = "SENTENCE";
    Features["NO_STOP_WORDS"] = "NO_STOP_WORDS";
    Features["CAPITAL_CASE"] = "CAPITAL_CASE";
    Features["DOUBLE_DASH"] = "DOUBLE_DASH";
    Features["ENDS_WITH_PUNCTUATION"] = "ENDS_WITH_PUNCTUATION";
})(Features = Features || (Features = {}));
var FEATURE_EMPTY_LINE = {
    name: Features.EMPTY_LINE,
    test: function (line) { return !line.trim(); }
};
var FEATURE_PHONE = {
    name: Features.PHONE,
    test: function (line) { return phoneRegex.test(line); }
};
var FEATURE_EMAIL = {
    name: Features.EMAIL,
    test: function (line) { return emailRegex.test(line); }
};
var FEATURE_LINK = {
    name: Features.LINK,
    test: function (line) { return urlRegex.test(line); }
};
var FEATURE_LONG_LINE = {
    name: Features.LONG_LINE,
    test: function (line) { return line.length > maxLengthOfSignatureLine; }
};
var FEATURE_FULL_NAME = {
    name: Features.FULL_NAME,
    test: function (line) {
        //Workaround tokenizer that splits a word containing an accent
        //If a line contains just one word, it's probably not a name 
        if (!/\s/.test(line))
            return false;
        var foundName = nlp(line).people().out('array');
        var foundNameViaNlp = foundName.length > 0;
        if (foundNameViaNlp)
            return true;
        var tokens = tokenizer.tokenize(line).filter(function (token) { return !digitsRegex.test(token); });
        if (tokens.length < 2)
            return false;
        var lastToken = tokens[tokens.length - 1];
        return lastToken.toUpperCase() == lastToken;
    }
};
var ENDS_WITH_PUNCTUATION = {
    name: Features.ENDS_WITH_PUNCTUATION,
    test: function (line) {
        return /[,!:]$/.test(line);
    }
};
var FEATURE_DOUBLE_DASH = {
    name: Features.DOUBLE_DASH,
    test: function (line) {
        return line.trim() == '--';
    }
};
var FEATURE_SENTENCE = {
    name: Features.SENTENCE,
    test: function (line) {
        var tokens = tokenizer.tokenize(line);
        var tokensWithoutStopWords = tokens.filter(function (token) { return selectedStopWords.indexOf(token.toLowerCase()) < 0; });
        return tokens.length - tokensWithoutStopWords.length > 3;
    }
};
var FEATURE_CAPITAL_CASE = {
    name: Features.CAPITAL_CASE,
    test: function (line) {
        var words = tokenizer.tokenize(line).filter(function (token) { return !digitsRegex.test(token); });
        var tokensWithoutStopWords = words.filter(function (token) { return selectedStopWords.indexOf(token.toLowerCase()) < 0; });
        if (words.length < 3)
            return false;
        var firstLetters = tokensWithoutStopWords.map(function (token) { return token[0]; }).join('');
        return firstLetters.toUpperCase() == firstLetters;
    }
};
var FEATURE_NO_STOP_WORDS = {
    name: Features.NO_STOP_WORDS,
    test: function (line) {
        var tokens = tokenizer.tokenize(line).filter(function (token) { return !digitsRegex.test(token); });
        ;
        if (tokens.length < 3)
            return false;
        var tokensWithoutStopWords = tokens.filter(function (token) { return selectedStopWords.indexOf(token.toLowerCase()) < 0; });
        return tokens.length == tokensWithoutStopWords.length;
    }
};
export var suppotedFeatures = [
    FEATURE_EMPTY_LINE,
    FEATURE_PHONE,
    FEATURE_EMAIL,
    FEATURE_LINK,
    FEATURE_LONG_LINE,
    FEATURE_FULL_NAME,
    FEATURE_SENTENCE,
    FEATURE_NO_STOP_WORDS,
    FEATURE_CAPITAL_CASE,
    FEATURE_DOUBLE_DASH,
    ENDS_WITH_PUNCTUATION
];
export var detectFeaturesInText = function (lineOfText, language) {
    var detectedLanguages = languageDetector.detect(lineOfText);
    var detectedLang = detectedLanguages.length > 0
        ? detectedLanguages[0][0]
        : language;
    if (detectedLang && stopwords[detectedLang] != null) {
        selectedStopWords = stopwords[detectedLang];
    }
    else {
        console.log('warning: No stop words are defined for language ' + detectedLang);
    }
    var detectedFeatures = [];
    lineOfText = lineOfText.trim();
    suppotedFeatures.forEach(function (feature) {
        if (feature.test(lineOfText))
            detectedFeatures.push(feature.name);
    });
    return detectedFeatures.sort();
};
