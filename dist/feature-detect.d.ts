export declare enum Features {
    EMPTY_LINE = "EMPTY_LINE",
    PHONE = "PHONE",
    EMAIL = "EMAIL",
    LINK = "LINK",
    LONG_LINE = "LONG_LINE",
    FULL_NAME = "FULL_NAME",
    SENTENCE = "SENTENCE",
    NO_STOP_WORDS = "NO_STOP_WORDS",
    CAPITAL_CASE = "CAPITAL_CASE",
    DOUBLE_DASH = "DOUBLE_DASH",
    ENDS_WITH_PUNCTUATION = "ENDS_WITH_PUNCTUATION",
}
export declare const suppotedFeatures: {
    name: Features;
    test: (line: string) => boolean;
}[];
export declare const detectFeaturesInText: (lineOfText: string, language: string) => Features[];
