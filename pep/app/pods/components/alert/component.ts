import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

// import { fadeTransition } from 'pep/utils/animation';
import fade from 'ember-animated/transitions/fade';

import ScrollableService from 'pep/services/scrollable';

interface AlertArgs {
    isShown: boolean;
    type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    message?: string;
    icon?: string;
    scrollableNamespace?: string;
    animateInitialInsert?: boolean;
}

export default class Alert extends Component<AlertArgs> {
    @service scrollable!: ScrollableService;

    animateDuration = 300;
    animateTransition = fade;

    get animateInitialInsert() {
        return this.args.animateInitialInsert ?? true;
    }

    /**
     * Recalculates the alert's parent <Scrollable>'s scroll height on show/hide
     * if a scrollable namespace is provided
     */
    @action
    onIsShownUpdate() {
        if (this.args.scrollableNamespace) {
            later(() => this.scrollable.recalculate(this.args.scrollableNamespace), this.animateDuration);
        }
    }
}
