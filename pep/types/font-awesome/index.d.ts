import Component, { ArgsFor } from '@glint/environment-ember-loose/ember-component';

import {
    FlipProp, IconName, IconPrefix, PullProp, RotateProp, SizeProp, Transform
} from '@fortawesome/fontawesome-svg-core';

export interface FaIconComponentSignature {
    Element: SVGElement;
    Args: {
        icon: IconName;
        prefix?: IconPrefix;
        size?: SizeProp;
        rotation?: RotateProp;
        pull?: PullProp;
        pulse?: boolean;
        border?: boolean;
        flip?: FlipProp;
        fixedWidth?: boolean;
        transform?: Transform;
        symbol?: boolean;
    };
}

export interface FaIconComponent extends ArgsFor<FaIconComponentSignature> {}
export declare class FaIconComponent extends Component<FaIconComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        FaIcon: typeof FaIconComponent;
    }
}
