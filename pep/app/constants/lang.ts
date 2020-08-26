export enum LanguageCode {
    enUS = 'en-us',
    esES = 'es-es'
}

export interface Language {
    code: LanguageCode;
    label: string;
}

export const LANG_EN_US: Language = {
    code: LanguageCode.enUS,
    label: 'language.codes.enUS'
};

export const LANG_ES_ES: Language = {
    code: LanguageCode.esES,
    label: 'language.codes.esES'
};

export default [LANG_EN_US, LANG_ES_ES];