import ENV from 'pep/config/environment';
import { LanguageCode } from 'pep/constants/lang';
import { SearchTermId } from 'pep/constants/search';
import { WIDGET } from 'pep/constants/sidebar';
import { FontSizes, TextJustificationId } from 'pep/constants/text';
import { ThemeId } from 'pep/constants/themes';
import { SearchSort, SearchSorts } from 'pep/utils/sort';

import { SearchView, SearchViews } from './search';

export enum PreferenceKey {
    FAVORITES = 'favorites',
    LANG = 'lang',
    READ_LATER = 'readLater',
    SEARCH_LIMIT_IS_SHOWN = 'searchLimitIsShown',
    SEARCH_HIC_ENABLED = 'searchHICEnabled',
    SEARCH_HIC_LIMIT = 'searchHICLimit',
    SEARCH_PREVIEW_ENABLED = 'searchPreviewEnabled',
    SEARCH_TERM_FIELDS = 'searchTermFields',
    SEARCH_VIEW_TYPE = 'searchViewType',
    SEARCH_SORT_TYPE = 'searchSortType',
    THEME = 'theme',
    TOUR_ENABLED = 'tourEnabled',
    HELP_DESCRIPTIONS_ENABLED = 'helpDescriptionsEnabled',
    HELP_ICONS_ENABLED = 'helpIconsEnabled',
    FONT_SIZE = 'fontSize',
    VISIBLE_WIDGETS = 'visibleWidgets',
    TRANSLATION_CONCORDANCE = 'translationConcordanceEnabled',
    GLOSSARY_FORMATTING_ENABLED = 'glossaryFormattingEnabled',
    TEXT_JUSTIFICATION = 'textJustification'
}

export interface UserPreferences {
    favorites?: string[];
    lang: LanguageCode;
    preferencesVersion: string;
    readLater?: string[];
    searchLimitIsShown?: boolean;
    searchHICEnabled?: boolean;
    searchHICLimit?: number;
    searchTermFields?: SearchTermId[];
    searchViewType: SearchView;
    searchPreviewEnabled?: boolean;
    searchSortType: SearchSort;
    theme: ThemeId;
    tourEnabled: boolean;
    helpDescriptionsEnabled: boolean;
    helpIconsEnabled: boolean;
    fontSize: FontSizes;
    visibleWidgets: WIDGET[];
    translationConcordanceEnabled: boolean;
    glossaryFormattingEnabled: boolean;
    textJustification: TextJustificationId;
}

export type PreferenceChangeset = Partial<UserPreferences>;

export type PreferenceDocumentsKey = PreferenceKey.READ_LATER | PreferenceKey.FAVORITES;

export const USER_PREFERENCES_COOKIE_NAME = 'pepweb_user_prefs';
export const USER_PREFERENCES_LS_PREFIX = 'pepweb_user_prefs';

/**
 * IMPORTANT!!!
 * User preferences that are stored in a browser cookie which are accessible on the server-side/FastBoot.
 * Because of browsers' cookie size upper limit of ~4KB (shared between ALL cookies for the domain)
 * Only preferences the are ABSOLUTELY CRITICAL for FastBoot renders (or are extremely small values)
 * should be placed in here. Everything else should go in LOCALSTORAGE_PREFERENCES
 */
export const COOKIE_PREFERENCES: PreferenceKey[] = [
    PreferenceKey.LANG,
    PreferenceKey.SEARCH_LIMIT_IS_SHOWN,
    PreferenceKey.SEARCH_TERM_FIELDS,
    PreferenceKey.THEME,
    PreferenceKey.SEARCH_HIC_ENABLED,
    PreferenceKey.SEARCH_HIC_LIMIT,
    PreferenceKey.SEARCH_VIEW_TYPE,
    PreferenceKey.SEARCH_SORT_TYPE,
    PreferenceKey.HELP_DESCRIPTIONS_ENABLED,
    PreferenceKey.HELP_ICONS_ENABLED,
    PreferenceKey.FONT_SIZE,
    PreferenceKey.VISIBLE_WIDGETS
];

/**
 * All user preferences that are not stored in COOKIE_PREFERENCES must be stored in LocalStorage
 * Note that as LocalStorage is clientside-only, the user-set values for these prefs will not be
 * accessible in FastBoot (the default preference value will be returned if access is attempted)
 */
export const LOCALSTORAGE_PREFERENCES: PreferenceKey[] = [
    PreferenceKey.FAVORITES,
    PreferenceKey.READ_LATER,
    PreferenceKey.SEARCH_PREVIEW_ENABLED,
    PreferenceKey.TOUR_ENABLED,
    PreferenceKey.TRANSLATION_CONCORDANCE
];

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
    favorites: [],
    preferencesVersion: ENV.userPreferencesVersion,
    lang: LanguageCode.EnUS,
    searchPreviewEnabled: true,
    searchHICEnabled: true,
    searchHICLimit: 1,
    readLater: [],
    theme: ThemeId.DEFAULT,
    searchViewType: SearchViews[0],
    searchSortType: SearchSorts[0],
    tourEnabled: true,
    helpDescriptionsEnabled: true,
    helpIconsEnabled: true,
    fontSize: FontSizes.DEFAULT,
    visibleWidgets: Object.values(WIDGET).filter((value) => typeof value === 'string'),
    translationConcordanceEnabled: true,
    glossaryFormattingEnabled: true,
    textJustification: TextJustificationId.LEFT
};
