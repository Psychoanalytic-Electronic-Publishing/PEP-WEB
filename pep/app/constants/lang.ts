export enum LanguageCode {
    EnUS = 'en-us',
    FrFR = 'fr-fr'
}

export interface Language {
    code: LanguageCode;
    label: string;
    path: string;
}

export const LANG_EN_US: Language = {
    code: LanguageCode.EnUS,
    label: 'language.codes.enUS',
    path: '/translations/en-us.json'
};

export const LANG_FR_FR: Language = {
    code: LanguageCode.FrFR,
    label: 'language.codes.frFR',
    path: '/translations/fr-fr.json'
};

export const Languages = [LANG_EN_US, LANG_FR_FR];
