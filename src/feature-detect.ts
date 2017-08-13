let nlp = require('compromise');
let natural = require('natural');
let languageDetector = new (require('languagedetect'));

let tokenizer = new natural.WordTokenizer();

const stopwords = {
    french: require('./lang/stopwords-fr.json'),
    english: require('./lang/stopwords-en.json')
}

let selectedStopWords = stopwords.english;

const maxLengthOfSignatureLine = 60;

const digitsRegex = /\d+/;
const phoneRegex = /\+?\(?\d*\)? ?\(?\d+\)?\d*([\s.\-]\d{2,})+/g;
const emailRegex = /\b[a-z0-9-_.]+@[a-z0-9-_.]+(\.[a-z0-9]+)+/i;
const urlRegex = new RegExp(/(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/, 'gi')

export enum Features {
    EMPTY_LINE = 'EMPTY_LINE',
    PHONE = 'PHONE',
    EMAIL = 'EMAIL',
    LINK = 'LINK', 
    LONG_LINE = 'LONG_LINE',
    FULL_NAME = 'FULL_NAME',
    SENTENCE = 'SENTENCE',
    NO_STOP_WORDS = 'NO_STOP_WORDS',
    CAPITAL_CASE = 'CAPITAL_CASE',
    DOUBLE_DASH = 'DOUBLE_DASH',
    ENDS_WITH_PUNCTUATION = 'ENDS_WITH_PUNCTUATION'
}

const FEATURE_EMPTY_LINE = { 
    name: Features.EMPTY_LINE,
    test: (line: string) => !line.trim() 
};

const FEATURE_PHONE = { 
    name: Features.PHONE, 
    test: (line: string) => phoneRegex.test(line) 
};

const FEATURE_EMAIL = { 
    name: Features.EMAIL, 
    test: (line: string) => emailRegex.test(line) 
};

const FEATURE_LINK = { 
    name: Features.LINK, 
    test: (line: string) => urlRegex.test(line) 
};

const FEATURE_LONG_LINE = { 
    name: Features.LONG_LINE, 
    test: (line: string) => line.length > maxLengthOfSignatureLine 
};

const FEATURE_FULL_NAME = {
    name: Features.FULL_NAME, 
    test: (line: string) => {

        //Workaround tokenizer that splits a word containing an accent
        //If a line contains just one word, it's probably not a name 
        if(!/\s/.test(line)) return false;

        let foundName = nlp(line).people().out('array');
        let foundNameViaNlp = foundName.length > 0;

        if(foundNameViaNlp) 
            return true;

        let tokens = tokenizer.tokenize(line).filter((token: string) => !digitsRegex.test(token));
        if(tokens.length < 2)
            return false;
        let lastToken = tokens[tokens.length - 1];
        return lastToken.toUpperCase() == lastToken;
    }
};

const ENDS_WITH_PUNCTUATION = {
    name: Features.ENDS_WITH_PUNCTUATION, 
    test: (line: string) => {
        return /[,!:]$/.test(line);
    }
};

const FEATURE_DOUBLE_DASH = {
    name: Features.DOUBLE_DASH, 
    test: (line: string) => {
        return line.trim() == '--';
    }
};

const FEATURE_SENTENCE = {
    name: Features.SENTENCE, 
    test: (line: string) => {
        let tokens = tokenizer.tokenize(line);
        let tokensWithoutStopWords = tokens.filter((token: string) => { return selectedStopWords.indexOf(token.toLowerCase()) < 0 });
        return tokens.length - tokensWithoutStopWords.length > 3;
    }
};

const FEATURE_CAPITAL_CASE = {
    name: Features.CAPITAL_CASE, 
    test: (line: string) => {
        let words: Array<string> = tokenizer.tokenize(line).filter((token: string) => !digitsRegex.test(token));
        let tokensWithoutStopWords = words.filter((token: string) => { return selectedStopWords.indexOf(token.toLowerCase()) < 0 });

        if(words.length < 3)
            return false;
        let firstLetters = tokensWithoutStopWords.map(token => token[0]).join('');
        return firstLetters.toUpperCase() == firstLetters;
    }
};

const FEATURE_NO_STOP_WORDS = {
    name: Features.NO_STOP_WORDS, 
    test: (line: string) => {
        let tokens = tokenizer.tokenize(line).filter((token: string) => !digitsRegex.test(token));;
        if(tokens.length < 3) 
            return false;
        let tokensWithoutStopWords = tokens.filter((token: string) => { return selectedStopWords.indexOf(token.toLowerCase()) < 0 });
        return tokens.length == tokensWithoutStopWords.length;
    }
};



export const suppotedFeatures = [
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
]

const detectLanguageOrDefault = (lineOfText: string, defaultLanguage: string) => {
    let detectedLanguages = languageDetector.detect(lineOfText);
    return detectedLanguages.length > 0
        ? detectedLanguages[0][0]
        : defaultLanguage;
}

const setSelectedStopWords = (languageOfCurrentLine: string, languageOfWholeEmail: string) => {
    if (languageOfCurrentLine && stopwords[languageOfCurrentLine] != null)
        selectedStopWords = stopwords[languageOfCurrentLine];

    else if (languageOfWholeEmail && stopwords[languageOfWholeEmail] != null)
        selectedStopWords = stopwords[languageOfWholeEmail];
    
    else
        console.log(`warning: detected ${languageOfCurrentLine} lang for current line and ${languageOfWholeEmail} for the full email but found no stop words for these`);
}

export const detectFeaturesInText = function (lineOfText: string, language: string): Array<Features> {
    let detectedLangForCurrentLine = detectLanguageOrDefault(lineOfText, language);
    setSelectedStopWords(detectedLangForCurrentLine, language);

    let detectedFeatures: Array<Features> = [];
    lineOfText = lineOfText.trim();

    suppotedFeatures.forEach(feature => {
        if(feature.test(lineOfText))
            detectedFeatures.push(feature.name);
    })

    return detectedFeatures.sort();
}