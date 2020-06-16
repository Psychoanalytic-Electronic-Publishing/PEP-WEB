import Controller from '@ember/controller';
import { action, setProperties, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import ControllerPagination from '@gavant/ember-pagination/mixins/controller-pagination';
import AjaxService from 'pep/services/ajax';
import { SEARCH_TYPE_EVERYWHERE } from 'pep/constants/search';
import { removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';
import { serializeQueryParams } from 'pep/utils/serialize-query-params';

export default class Search extends ControllerPagination(Controller) {
    @service ajax!: AjaxService;

    queryParams = ['q', { _searchTerms: 'searchTerms' }, 'matchSynonyms'];
    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;

    @tracked currentSmartSearchTerm: string = '';
    @tracked currentSearchTerms = [];
    @tracked currentMatchSynonyms: boolean = false;

    @tracked previewedResult = null;
    @tracked previewIsExpanded = false;

    //TODO will be removed once proper pagination is hooked up
    @tracked metadata = {};

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    @tracked _searchTerms = JSON.stringify([
        { type: 'everywhere', term: '' },
        { type: 'title', term: '' },
        { type: 'author', term: '' }
    ]);
    get searchTerms() {
        if (!this._searchTerms) {
            return [];
        } else {
            return JSON.parse(this._searchTerms);
        }
    }
    set searchTerms(array) {
        if (Array.isArray(array) && array.length > 0) {
            this._searchTerms = JSON.stringify(array);
        } else {
            this._searchTerms = null;
        }
    }

    @computed('q,searchTerms.@each.term')
    get hasSubmittedSearch() {
        return this.q || this.searchTerms.filter((t) => !!t.term).length > 0;
    }

    get noResults() {
        return !this.isLoadingPage && (!this.hasSubmittedSearch || !this.model.length);
    }

    //TODO TBD - overrides ControllerPagination, will not be needed once api is integrated w/ember-data
    async fetchModels(params) {
        const queryParams = removeEmptyQueryParams(params);
        const queryStr = serializeQueryParams(queryParams);
        const result = await this.ajax.request(`Database/Search?${queryStr}`);
        return {
            toArray: () => result.documentList.responseSet,
            data: result.documentList.responseSet,
            meta: result.documentList.responseInfo
        };
    }

    @action
    submitSearch() {
        //update query params
        const searchTerms = this.currentSearchTerms.filter((t) => !!t.term);

        this.q = this.currentSmartSearchTerm;
        this.searchTerms = !isEmpty(searchTerms) ? searchTerms : null;
        this.matchSynonyms = this.currentMatchSynonyms;
        //perform search
        return this.filter();
    }

    @action
    clearSearch() {
        this.currentSmartSearchTerm = '';
        this.currentMatchSynonyms = false;
        this.currentSearchTerms = [{ type: 'everywhere', term: '' }];
    }

    @action
    addSearchTerm(newSearchTerm) {
        this.currentSearchTerms = this.currentSearchTerms.concat([newSearchTerm]);
    }

    @action
    removeSearchTerm(removedSearchTerm) {
        const searchTerms = this.currentSearchTerms.concat([]);
        searchTerms.removeObject(removedSearchTerm);

        if (searchTerms.length === 0) {
            searchTerms.pushObject({ type: SEARCH_TYPE_EVERYWHERE.id, term: '' });
        }

        this.currentSearchTerms = searchTerms;
    }

    @action
    updateSearchTerm(oldTerm, newTerm) {
        const searchTerms = this.currentSearchTerms.concat([]);
        //workaround to retain the same term object, instead of splicing in
        //a brand new one like we normally would, so that it doesnt trigger an insert animation
        setProperties(oldTerm, newTerm);
        this.currentSearchTerms = searchTerms;
    }

    @action
    updateMatchSynonyms(isChecked: boolean) {
        this.currentMatchSynonyms = isChecked;
    }

    @action
    openResultPreview(result, event) {
        event.preventDefault();
        this.previewedResult = result;
    }

    @action
    closeResultPreview() {
        this.previewedResult = null;
        this.previewIsExpanded = false;
    }

    @action
    togglePreviewExpanded() {
        this.previewIsExpanded = !this.previewIsExpanded;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        search: Search;
    }
}
