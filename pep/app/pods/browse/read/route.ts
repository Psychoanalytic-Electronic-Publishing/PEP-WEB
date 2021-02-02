import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { SearchFacetId } from 'pep/constants/search';
import { WIDGET } from 'pep/constants/sidebar';
import { PageNav } from 'pep/mixins/page-layout';
import BrowseReadController from 'pep/pods/browse/read/controller';
import Document from 'pep/pods/document/model';
import SearchDocument from 'pep/pods/search-document/model';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService, { VIEW_DOCUMENT_FROM } from 'pep/services/current-user';
import SidebarService from 'pep/services/sidebar';
import { buildBrowseRelatedDocumentsParams, buildSearchQueryParams } from 'pep/utils/search';

export interface BrowseReadParams {
    document_id: string;
}

export default class BrowseRead extends PageNav(Route) {
    @service configuration!: ConfigurationService;
    @service sidebar!: SidebarService;
    @service currentUser!: CurrentUserService;

    navController = 'browse.read';
    relatedDocuments?: Document[];
    relatedDocumentsMeta?: any;

    /**
     * Fetch the requested document
     * @param {ReadDocumentParams} params
     */
    model(params: BrowseReadParams) {
        return this.store.findRecord('document', params.document_id, {
            reload: true
        });
    }

    /**
     * Fetch the search results for the document sidebar
     * @param {Object} model
     * @param {Transition} transition
     */
    async afterModel(model: Document, transition: Transition) {
        super.afterModel(model, transition);
        this.sidebar.update({
            [WIDGET.RELATED_DOCUMENTS]: model,
            [WIDGET.MORE_LIKE_THESE]: model,
            [WIDGET.GLOSSARY_TERMS]: model?.meta?.facetCounts.facet_fields.glossary_group_terms,
            [WIDGET.PUBLISHER_INFO]: model
        });

        const controller = this.controllerFor(this.routeName) as BrowseReadController;

        const params = buildBrowseRelatedDocumentsParams(model.id);
        const searchParams = buildSearchQueryParams(params);

        const queryParams = buildQueryParams({
            context: controller,
            pagingRootKey: null,
            filterRootKey: null,
            sorts:
                controller.selectedView.id === controller.tableView
                    ? ['']
                    : [this.currentUser.preferences?.searchSortType.id ?? ''],

            processQueryParams: (params) => ({ ...params, ...searchParams })
        });
        const response = (await this.store.query('search-document', queryParams)) as RecordArrayWithMeta<
            SearchDocument
        >;
        const results = response.toArray();
        const resultsMeta = response.meta;

        this.relatedDocuments = results;
        this.relatedDocumentsMeta = resultsMeta;
    }

    /**
     * Set the search results data on the controller
     * @param {SearchReadController} controller
     * @param {object} model
     */
    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    setupController(controller: BrowseReadController, model: Document) {
        super.setupController(controller, model);

        controller.paginator = usePagination<Document, any>({
            context: controller,
            modelName: 'search-document',
            models: this.relatedDocuments ?? [],
            metadata: this.relatedDocumentsMeta,
            sorts:
                controller.selectedView.id === controller.tableView
                    ? ['']
                    : [this.currentUser.preferences?.searchSortType.id ?? ''],
            pagingRootKey: null,
            filterRootKey: null,
            processQueryParams: controller.processQueryParams,
            onChangeSorting: controller.onChangeSorting,
            limit: 20
        });
        this.currentUser.lastViewedDocumentId = model.id;
        this.currentUser.lastViewedDocumentFrom = VIEW_DOCUMENT_FROM.OTHER;
        controller.document = model;
    }
}
