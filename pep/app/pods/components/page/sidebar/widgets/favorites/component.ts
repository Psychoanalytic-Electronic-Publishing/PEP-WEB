import Component from '@glimmer/component';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import { inject as service } from '@ember/service';
import CurrentUserService from 'pep/services/current-user';
import { action } from '@ember/object';
import Document from 'pep/pods/document/model';
import { tracked } from '@glimmer/tracking';
import { PreferenceKey } from 'pep/constants/preferences';
import { SearchFacetId } from 'pep/constants/search';
import { buildSearchQueryParams } from 'pep/utils/search';
import { restartableTask } from 'ember-concurrency-decorators';
import DS from 'ember-data';
import { taskFor } from 'ember-concurrency-ts';

interface PageSidebarWidgetsFavoritesArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsFavorites extends Component<PageSidebarWidgetsFavoritesArgs> {
    @service store!: DS.Store;
    @service currentUser!: CurrentUserService;

    @tracked results?: Document[];

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.FAVORITES;

    /**
     * Load the documents that have been favorited by the user from local storage
     * TODO: We need to be smarter about this and try to pull from cache
     *
     * @memberof PageSidebarWidgetsFavorites
     */
    @restartableTask
    *loadFromUserPreferences() {
        const ids = this.currentUser.getPreferenceDocuments(PreferenceKey.FAVORITES);
        if (ids.length) {
            const queryItems = ids.map((id) => {
                return {
                    id: SearchFacetId.ART_ID,
                    value: id
                };
            });
            const params = buildSearchQueryParams({ facetValues: queryItems });
            const results = yield this.store.query('document', params);
            this.results = results.toArray();
        } else {
            this.results = [];
        }
    }

    /**
     * Load the widget results on render or update
     * TODO: This updates when the user changes their theme, or any change to the preferences object
     * since its immutable. We should eventually look at how to improve that
     *
     * @memberof PageSidebarWidgetsFavorites
     */
    @action
    onElementChange() {
        taskFor(this.loadFromUserPreferences).perform();
    }

    /**
     * Add or remove favorites
     *
     * @param {Document} document
     * @memberof SearchItem
     */
    @action
    removeFavorite(document: Document) {
        this.currentUser.removePreferenceDocument(PreferenceKey.FAVORITES, document.id);
    }
}