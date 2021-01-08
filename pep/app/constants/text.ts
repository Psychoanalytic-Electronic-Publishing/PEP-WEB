export enum FontSize {
    XS = 'xs',
    SMALL = 'small',
    DEFAULT = 'default',
    LARGE = 'large',
    XLARGE = 'xlarge'
}

export interface FontSizeItem {
    id: FontSize;
    label: string;
    class: string;
}

export const FONT_SIZE_XS: FontSizeItem = {
    id: FontSize.XS,
    label: 'text.sizes.xs',
    class: 'font-xs'
};

export const FONT_SIZE_SMALL: FontSizeItem = {
    id: FontSize.SMALL,
    label: 'text.sizes.sm',
    class: 'font-sm'
};

export const FONT_SIZE_DEFAULT: FontSizeItem = {
    id: FontSize.DEFAULT,
    label: 'text.sizes.default',
    class: ''
};

export const FONT_SIZE_LARGE: FontSizeItem = {
    id: FontSize.LARGE,
    label: 'text.sizes.lg',
    class: 'font-lg'
};

export const FONT_SIZE_XLARGE: FontSizeItem = {
    id: FontSize.XLARGE,
    label: 'text.sizes.xlarge',
    class: 'font-xlarge'
};

export const AvailableFontSizes = [FONT_SIZE_XS, FONT_SIZE_SMALL, FONT_SIZE_DEFAULT, FONT_SIZE_LARGE, FONT_SIZE_XLARGE];

export enum TextJustificationId {
    LEFT = 'left',
    CENTER = 'center',
    RIGHT = 'right'
}
export interface TextJustification {
    id: TextJustificationId;
    label: string;
    class: string;
}

export const TEXT_LEFT: TextJustification = {
    id: TextJustificationId.LEFT,
    label: 'text.justification.left',
    class: 'text-left'
};

export const TEXT_CENTER: TextJustification = {
    id: TextJustificationId.CENTER,
    label: 'text.justification.center',
    class: 'text-center'
};

export const TEXT_RIGHT: TextJustification = {
    id: TextJustificationId.RIGHT,
    label: 'text.justification.right',
    class: 'text-right'
};

export const TextJustifications = [TEXT_LEFT, TEXT_CENTER, TEXT_RIGHT];
