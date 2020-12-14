import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ModalService from '@gavant/ember-modals/services/modal';
import { DS } from 'ember-data';

import Abstract from 'pep/pods/abstract/model';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import FastbootMediaService from 'pep/services/fastboot-media';
import PepSessionService from 'pep/services/pep-session';
import SidebarService from 'pep/services/sidebar';
import { buildSearchQueryParams } from 'pep/utils/search';

interface HomeArgs {}

export default class Home extends Component<HomeArgs> {
    @service sidebar!: SidebarService;
    @service modal!: ModalService;
    @service fastbootMedia!: FastbootMediaService;
    @service configuration!: ConfigurationService;
    @service auth!: AuthService;
    @service('pep-session') session!: PepSessionService;
    @service store!: DS.Store;
    @service router!: RouterService;

    @tracked model?: Abstract;

    get intro() {
        return this.configuration.content.home.intro;
    }

    get expertPick() {
        const expertPicks = this.configuration.base.home.expertPicks;
        return expertPicks[expertPicks.length - 1];
    }

    /**
     * Open the search form sidebar
     * @returns {void}
     */
    @action
    showSearch() {
        return this.sidebar.toggleLeftSidebar(true);
    }

    /**
     * Opens login modal (if user is not logged in already)
     * and then transitions to the document read page
     * @returns {void | Promise<void>}
     */
    @action
    readExpertPick() {
        if (!this.session.isAuthenticated) {
            return this.auth.openLoginModal(true, {
                actions: {
                    onAuthenticated: this.transitionToExpertPick
                }
            });
        } else {
            return this.transitionToExpertPick();
        }
    }

    /**
     * /**
     * Opens login modal (if user is not logged in already)
     * and then transitions to the document read page
     * @returns {void | Promise<void>}
     */
    @action
    readImageDocument() {
        if (!this.session.isAuthenticated) {
            return this.auth.openLoginModal(true, {
                actions: {
                    onAuthenticated: this.transitionToImageDocument
                }
            });
        } else {
            return this.transitionToImageDocument();
        }
    }

    /**
     * Load the `Document` that contains the expert image
     * of the day.
     * Transition to this document's read page.
     */
    @action
    async transitionToImageDocument() {
        try {
            const queryParams = buildSearchQueryParams({
                smartSearchTerm: `art_graphic_list: ${this.expertPick.imageId}`
            });
            const results = await this.store.query('search-document', queryParams);
            const matchingDocument = results.toArray()[0];
            return this.router.transitionTo('read.document', matchingDocument.id);
        } catch (errors) {
            throw errors;
        }
    }

    /**
     * Load the expert pick article once the user is logged in
     * @returns {Promise<void>}
     */
    @action
    async transitionToExpertPick() {
        return this.router.transitionTo('read.document', this.expertPick.articleId);
    }

    /**
     * Returns the expert pick of the day abstract
     */
    @action
    async loadModel() {
        const expertPicks = this.configuration.base.home.expertPicks;
        const result = await this.store.findRecord('abstract', expertPicks[expertPicks.length - 1].articleId);
        this.model = result;
    }

    /**
     * Open the glossary modal to view the term
     *
     * @param {string} term
     * @param {GlossaryTerm} results
     * @memberof ReadDocument
     */
    @action
    viewGlossaryTerm(term: string, results: GlossaryTerm) {
        this.modal.open('glossary', {
            results,
            term
        });
    }
}
