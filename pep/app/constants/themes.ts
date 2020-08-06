export interface Theme {
    id: string;
    cssPath: string;
    label: string;
}

export const THEME_DEFAULT: Theme = {
    id: 'default',
    cssPath: '/assets/pep.css',
    label: 'Navy (default)'
};

export const THEME_TOMATO: Theme = {
    id: 'tomato',
    cssPath: '/assets/themes/tomato.css',
    label: 'Tomato'
};

export default [THEME_DEFAULT, THEME_TOMATO];
