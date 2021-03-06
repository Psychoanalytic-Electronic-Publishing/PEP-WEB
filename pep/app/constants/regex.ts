// TODO: we need to come up with a more robust way of cleaning/extracting html
// or just switch to XML content versions which would give us more control
export const HTML_BODY_REGEX = /^.*?<body[^>]*>(.*?)<\/body>.*?$/i;
export const INVALID_ABSTRACT_TAGS = /(<\!DOCTYPE html>|<\/?html>|<\/?body>|<head>.*<\/head>)/gim;
export const INVALID_ABSTRACT_PREVIEW_TAGS = /(<\!DOCTYPE html>|<\/?html>|<\/?body>|<head>.*<\/head>|<img[^>]*>|<arttitle>.*<\/arttitle>)/gim;
export const QUOTED_VALUE_REGEX = /^"(.*)"$/;
export const TITLE_REGEX = /^.*?<arttitle[^>]*>(.*?)<\/arttitle>.*?$/i;
export const SORT_DASH_REGEX = /-/g;
export const PARENTHESIS_REGEX = /\((.*)\)/;
export const NON_DIGIT_REGEX = /\D/g;
export const SEARCH_STRING_REGEX = /\(([^()]+)\)/g;
export const SEARCH_STRING_TERMS_REGEX = /[^a-zA-Z\s-]+/g;
export const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
export const MEDIA_FILE_EXTENSION_REGEX = /\.[^/.]+$/;
export const BOOLEAN_OPERATOR_REGEX = /\sOR\s|\sAND\s|\s\|\|\s|\s&&\s/i;
