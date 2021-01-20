import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { next, scheduleOnce } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ModalService from '@gavant/ember-modals/services/modal';
import NotificationService from 'ember-cli-notifications/services/notifications';
import { DS } from 'ember-data';
import IntlService from 'ember-intl/services/intl';

import animateScrollTo from 'animated-scroll-to';
import ENV from 'pep/config/environment';
import { DOCUMENT_IMG_BASE_URL, DocumentLinkTypes } from 'pep/constants/documents';
import { NON_DIGIT_REGEX } from 'pep/constants/regex';
import {
    HIT_MARKER_END, HIT_MARKER_END_OUTPUT_HTML, HIT_MARKER_START, HIT_MARKER_START_OUTPUT_HTML, SEARCH_HIT_MARKER_REGEX,
    SearchTermId
} from 'pep/constants/search';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Document from 'pep/pods/document/model';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import AjaxService from 'pep/services/ajax';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import ThemeService from 'pep/services/theme';
import { buildJumpToHitsHTML, loadXSLT, parseXML } from 'pep/utils/dom';
import { reject } from 'rsvp';
import tippy, { Instance, Props } from 'tippy.js';

interface DocumentTextArgs {
    document: Document;
    target?: 'abstract' | 'document';
    offsetForScroll?: number;
    readQueryParams: {
        q: string;
        searchTerms: string | null;
        facets: string | null;
        matchSynonyms: boolean;
    };
    page?: string;
    searchHitNumber?: number;
    onGlossaryItemClick: (term: string, termResults: GlossaryTerm[]) => void;
    viewSearch: (searchTerms: string) => void;
    documentRendered: () => void;
}

/**
 * The selectors for attaching tooltips
 *
 * @export
 * @enum {number}
 */
export enum DocumentTooltipSelectors {
    BIBLIOGRAPHY = '.bibtip',
    BIBLIOGRAPHY_RELATED_INFO = '.bibx-related-info',
    NEW_AUTHOR = '.newauthortip',
    H_AUTHOR_TIP = '.hauthortip',
    FOOTNOTE = '.ftnx',
    TRANSLATION = '.translation'
}

export type DocumentTippyInstance = Instance & {
    _isFetching: boolean;
    _loaded: boolean;
};
export default class DocumentText extends Component<DocumentTextArgs> {
    @service store!: DS.Store;
    @service loadingBar!: LoadingBarService;
    @service modal!: ModalService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service theme!: ThemeService;
    @service router!: RouterService;
    @service currentUser!: CurrentUserService;
    @service('pep-session') session!: PepSessionService;
    @service ajax!: AjaxService;

    @tracked xml?: XMLDocument;

    containerElement?: HTMLElement;
    scrollableElement?: Element | null;
    defaultOffsetForScroll = -85;

    tippyOptions = {
        theme: 'light',
        allowHTML: true,
        interactive: true,
        hideOnClick: false,
        trigger: 'mouseenter focus click',
        onClickOutside(instance: Instance<Props>) {
            instance.hide();
        }
    };

    constructor(owner: unknown, args: DocumentTextArgs) {
        super(owner, args);
        const target = args.target ?? (args.document.accessLimited ? 'abstract' : 'document');
        const text = args.document[target];
        this.generateDocument(text);
    }

    private get scrollOffset() {
        return this.args.offsetForScroll ?? this.defaultOffsetForScroll;
    }

    @dontRunInFastboot
    async generateDocument(text: string) {
        const document = await this.parseDocumentText(text);
        if (document) {
            this.xml = document;
            if (this.args.documentRendered) {
                next(this, this.args.documentRendered);
            }
        }
    }

    /**
     * Parse the document text to transform it to an xml document
     *
     * @param {string} text
     * @memberof DocumentText
     */

    async parseDocumentText(text: string, options?: { translationEnabled?: boolean }) {
        const xml = parseXML(text);

        if (!(xml instanceof Error)) {
            const xslt = await loadXSLT();

            if (xslt && document.implementation && document.implementation.createDocument) {
                const processor = new XSLTProcessor();
                if (this.session.isAuthenticated) {
                    processor.setParameter('', 'sessionId', this.session.data.authenticated.SessionId);
                }
                processor.setParameter(
                    '',
                    'translationConcordanceEnabled',
                    options?.translationEnabled ?? this.currentUser.preferences?.translationConcordanceEnabled
                );
                processor.setParameter('', 'clientId', ENV.clientId);
                processor.setParameter('', 'journalName', this.args.document.sourceTitle);
                processor.setParameter('', 'imageUrl', DOCUMENT_IMG_BASE_URL);
                processor.importStylesheet(xslt);
                const transformedDocument = (processor.transformToFragment(xml, document) as unknown) as XMLDocument;
                return transformedDocument;
            }
            return reject(this.notifications.error(this.intl.t('document.text.error')));
        } else {
            return reject(this.notifications.error(this.intl.t('document.text.error')));
        }
    }

    /**
     * Convert the xml doc back to a string for display
     *
     * @readonly
     * @memberof DocumentText
     */
    get text() {
        if (this.xml) {
            var s = new XMLSerializer();
            return this.replaceHitMarkerText(s.serializeToString(this.xml));
        } else {
            return '';
        }
    }

    /**
     * Find and replace all search hit marker text with the correct html
     *
     * @param {string} text
     * @return {string}
     * @memberof DocumentText
     */
    replaceHitMarkerText(text: string) {
        let anchorCount = 0;
        let regex = SEARCH_HIT_MARKER_REGEX;
        let totalAnchorCount = text.match(new RegExp(HIT_MARKER_START, 'g'))?.length ?? 1;
        return text.replace(regex, (match: string) => {
            const { previous, next } = buildJumpToHitsHTML(anchorCount);
            if (match === HIT_MARKER_START) {
                anchorCount += 1;
                if (anchorCount > 1) {
                    return `<span data-hit-number='${anchorCount}' class='hit'>${previous}${HIT_MARKER_START_OUTPUT_HTML}`;
                } else if (anchorCount <= 1) {
                    return `<span data-hit-number='${anchorCount}' class='hit'>${HIT_MARKER_START_OUTPUT_HTML}`;
                } else {
                    return '';
                }
            } else if (match === HIT_MARKER_END) {
                return `${HIT_MARKER_END_OUTPUT_HTML}${anchorCount < totalAnchorCount ? next : ''}</span>`;
            } else {
                return match;
            }
        });
    }

    /**
     * Document click handler. There are many things you can do with a document on click so we decipher what element the user is clicking on and
     * based upon a data attribute type we do the correct thing.
     *
     * TODO - try to improve this method and split up into helper functions
     *
     * @param {Event} event
     * @memberof DocumentText
     */
    @action
    onDocumentClick(event: Event) {
        const target = event.target as HTMLElement;
        const attributes = target.attributes;
        const type = this.getNodeType(target);
        if (target.tagName !== 'SUMMARY' && type !== DocumentLinkTypes.WEB && type !== DocumentLinkTypes.DOI) {
            event.preventDefault();
        }
        if (type === DocumentLinkTypes.GLOSSARY_TERM) {
            this.viewGlossaryTermFromElement(target);
        } else if (type === DocumentLinkTypes.BIBLIOGRAPHY) {
            const id = attributes.getNamedItem('data-document-id')?.nodeValue;
            if (id) {
                this.router.transitionTo('browse.read', id, {
                    queryParams: this.args.readQueryParams
                });
            }
        } else if (type === DocumentLinkTypes.DOCUMENT) {
            const id = attributes.getNamedItem('data-document-id')?.nodeValue;
            if (id) {
                this.router.transitionTo('browse.read', id, {
                    queryParams: this.args.readQueryParams
                });
            }
        } else if (type === DocumentLinkTypes.PAGE) {
            let documentId = null;
            let pageOrTarget = null;
            const reference = attributes.getNamedItem('data-r')?.nodeValue;
            // If reference does not include a period, its a local link inside that document
            // Otherwise it must include some sort of document ID and a possible page
            if (!reference?.includes('.')) {
                documentId = this.args.document.id;
                pageOrTarget = reference;
            } else {
                const referenceArray = reference?.split(/\.(?=[^\.]+$)/) ?? [];
                documentId = referenceArray[0];
                pageOrTarget = referenceArray[1];
            }

            if (documentId === this.args.document.id && pageOrTarget) {
                //scroll to page number
                this.scrollToPageOrTarget(pageOrTarget);
            } else if (documentId) {
                //transition to a different document with a specific page
                this.router.transitionTo('browse.read', documentId, {
                    queryParams: {
                        page: pageOrTarget
                    }
                });
            }
        } else if (type === DocumentLinkTypes.FIGURE || type === DocumentLinkTypes.TABLE_FIGURE) {
            const url = target?.getAttribute('src');
            const parent = target.parentElement?.parentElement;
            const caption = parent?.querySelector('.caption')?.innerHTML;
            this.modal.open('document/image', {
                url,
                caption
            });
        } else if (type === DocumentLinkTypes.FIGURE_WITH_ID) {
            const figureId = attributes.getNamedItem('data-figure-id')?.nodeValue;
            const figure = this.containerElement?.querySelector(`#${figureId}`);
            const image = figure?.querySelector('img');
            const url = image?.getAttribute('src');
            const caption = figure?.querySelector('.caption')?.innerHTML;
            this.modal.open('document/image', {
                url,
                caption,
                id: parseInt(figureId?.substring(1) ?? '', 10)
            });
        } else if (type === DocumentLinkTypes.AUTHOR_SEARCH) {
            const firstName = target?.querySelector('.nfirst')?.innerHTML;
            const lastName = target?.querySelector('.nlast')?.innerHTML;
            const name = `${firstName} ${lastName}`;
            this.args.viewSearch(JSON.stringify([{ term: name, type: SearchTermId.AUTHOR, value: name }]));
        } else if (type === DocumentLinkTypes.SEARCH_HIT_TEXT) {
            const possibleTermNode = target.parentElement?.parentElement;
            if (possibleTermNode) {
                const type = this.getNodeType(possibleTermNode);
                if (type === DocumentLinkTypes.GLOSSARY_TERM) {
                    this.viewGlossaryTermFromElement(possibleTermNode);
                }
            }
        } else if (type === DocumentLinkTypes.SEARCH_HIT_ARROW) {
            const selectedNode = this.containerElement?.querySelector(`.search-hit-selected`);
            if (selectedNode) {
                selectedNode?.classList.remove('search-hit-selected');
            }
            const targetSearchHit = attributes.getNamedItem('data-target-search-hit')?.nodeValue;
            if (targetSearchHit) {
                this.scrollToSearchHit(targetSearchHit);
            }
        } else if (type === DocumentLinkTypes.BANNER) {
            const parent = target.parentElement;
            if (parent) {
                const sourceCode = parent.getAttribute('data-journal-code');
                if (sourceCode) {
                    this.router.transitionTo('browse.journal', sourceCode);
                }
            }
        } else if (type === DocumentLinkTypes.TITLE) {
            const parent = target.parentElement;
            if (parent) {
                const sourceCode = parent.getAttribute('data-journal-code');
                const volume = parent.getAttribute('data-volume');

                if (sourceCode && volume) {
                    this.router.transitionTo('browse.journal.volume', sourceCode, volume);
                }
            }
        }
    }

    /**
     * Try to get the target nodes type from either `type` or `data-type`
     *
     * @param {HTMLElement} target
     * @return {*}
     * @memberof DocumentText
     */
    getNodeType(target: HTMLElement) {
        const attributes = target.attributes;
        const type =
            (attributes.getNamedItem('type')?.nodeValue as DocumentLinkTypes) ||
            (attributes.getNamedItem('data-type')?.nodeValue as DocumentLinkTypes);
        return type;
    }

    /**
     * Hanlder for passing in an element and viewing a glossary term
     *
     * @param {HTMLElement} element
     * @memberof DocumentText
     */
    viewGlossaryTermFromElement(element: HTMLElement) {
        const attributes = element.attributes;
        const docId = attributes.getNamedItem('data-doc-id')?.nodeValue;
        const groupName = attributes.getNamedItem('data-grpname')?.nodeValue;
        if (docId) {
            const id = docId.split('.');
            this.viewGlossaryTerm(element.innerText, id[id.length - 1]);
        } else if (groupName) {
            this.viewGlossaryTerm(groupName);
        }
    }

    /**
     * Scroll to a specific search hit in the document
     *
     * @param {number} page
     * @memberof DocumentText
     */
    @action
    async scrollToSearchHit(hitNumber: string) {
        const element = this.containerElement?.querySelector(`[data-hit-number='${hitNumber}']`);
        await this.animateScrollToElement(element);
        element?.classList.add('search-hit-selected');
    }

    /**
     * Scroll to a specific page in the document (by scrolling to a specific page element)
     *
     * @param {number} pageOrTarget
     * @memberof DocumentText
     */
    scrollToPageOrTarget(pageOrTarget: string) {
        const element =
            this.containerElement?.querySelector(`[data-page-start='${pageOrTarget}']`) ??
            this.containerElement?.querySelector(`#${pageOrTarget}`);
        if (element) {
            this.animateScrollToElement(element);
        }
    }

    /**
     * Animated the scroll to an element using a specified vertical offset
     *
     * @param {(Element | null)} [element]
     * @memberof DocumentText
     */
    //@ts-ignore: Ignore 'not all code paths return values'
    animateScrollToElement(element?: Element | null) {
        const container = this.scrollableElement;
        if (element && container) {
            return animateScrollTo(element, {
                verticalOffset: this.scrollOffset,
                elementToScroll: container
            });
        }
    }

    /**
     * Open the glossary modal to view the term definition and information
     *
     * @param {string} term
     * @memberof PageSidebarWidgetsGlossaryTerms
     */
    @action
    async viewGlossaryTerm(term: string, id?: string) {
        try {
            this.loadingBar.show();
            const parsedTerm = term.split(';');
            const results = await this.store.query('glossary-term', {
                termidtype: id ? 'ID' : 'Name',
                termIdentifier: id ? id : parsedTerm[0]
            });
            this.args.onGlossaryItemClick(parsedTerm[0], [...new Set(results.toArray())]);
        } catch (error) {
            throw error;
        } finally {
            this.loadingBar.hide();
        }
    }

    /**
     * Parse the document on change of the text
     *
     * @memberof DocumentText
     */
    @action
    parseDocument() {
        const target = this.args.target ?? (this.args.document.accessLimited ? 'abstract' : 'document');
        const text = this.args.document[target];
        this.generateDocument(text);
    }

    /**
     * set up the tooltips and if we get passed in a page number - scroll to it
     *
     * @param {HTMLElement} element
     * @memberof DocumentText
     */
    @action
    setupListeners(element: HTMLElement) {
        this.containerElement = element;
        this.scrollableElement = this.containerElement?.closest('.page-content-inner');
        scheduleOnce('afterRender', this, this.attachTooltips);
        if (this.args.page) {
            this.scrollToPageOrTarget(parseInt(this.args.page, 10));
        }
    }

    /**
     * Attach the tooltips to the elements and provide what text/html they will show
     *
     * @memberof DocumentText
     */
    attachTooltips() {
        const elements = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.BIBLIOGRAPHY);
        elements?.forEach((item) => {
            const id = item.attributes.getNamedItem('data-element')?.nodeValue;
            const node = this.containerElement?.querySelector(`#${id}`);
            if (node) {
                tippy(item, {
                    content: node.innerHTML,
                    ...this.tippyOptions
                });
            }
        });

        const newAuthorTooltips = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.NEW_AUTHOR);
        newAuthorTooltips?.forEach((item) => {
            const node = this.containerElement?.querySelector(`.peppopuptext`);
            if (node) {
                tippy(item, {
                    content: node.innerHTML,
                    placement: 'right',
                    ...this.tippyOptions
                });
            }
        });

        const hAuthorTooltips = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.H_AUTHOR_TIP);
        hAuthorTooltips?.forEach((item) => {
            const node = this.containerElement?.querySelector(`.hautcontent`);
            if (node) {
                tippy(item, {
                    content: node.innerHTML,
                    placement: 'right',
                    ...this.tippyOptions
                });
            }
        });

        const relatedBibliographies = this.containerElement?.querySelectorAll(
            DocumentTooltipSelectors.BIBLIOGRAPHY_RELATED_INFO
        );
        relatedBibliographies?.forEach((item) => {
            tippy(item, {
                content: this.intl.t('document.text.relatedBibliography'),
                ...this.tippyOptions
            });
        });

        const footnotes = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.FOOTNOTE);
        footnotes?.forEach((item) => {
            const id = item.attributes.getNamedItem('data-r')?.nodeValue;
            const node = this.containerElement?.querySelector(`#${id}`);
            const supParent = item.parentElement?.parentElement;
            if (node && supParent) {
                tippy(item, {
                    appendTo: supParent,
                    content: node.innerHTML,
                    ...this.tippyOptions
                });
            }
        });

        if (this.currentUser.preferences?.translationConcordanceEnabled) {
            const translations = this.containerElement?.querySelectorAll(DocumentTooltipSelectors.TRANSLATION);
            const loadingTranslation = this.intl.t('common.loading');
            translations?.forEach((item) => {
                const paraLangId = item.attributes.getNamedItem('data-lgrid')?.nodeValue;
                const paraLangRx = item.attributes.getNamedItem('data-lgrx')?.nodeValue;

                const paragraph = item.parentElement;
                if ((paraLangId || paraLangRx) && paragraph) {
                    tippy(item, {
                        appendTo: paragraph,
                        content: loadingTranslation,
                        ...this.tippyOptions,
                        onCreate(instance: DocumentTippyInstance) {
                            // Setup our own custom state properties - from DOCS
                            instance._isFetching = false;
                            instance._loaded = false;
                        },
                        onShow: (instance: DocumentTippyInstance) => {
                            if (instance._isFetching || instance._loaded) {
                                return;
                            }

                            this.loadTranslation?.(paraLangId, paraLangRx)
                                .then(async (text: string) => {
                                    const xml = await this.parseDocumentText(text, {
                                        translationEnabled: false
                                    });
                                    if (xml) {
                                        var s = new XMLSerializer();
                                        const html = this.replaceHitMarkerText(s.serializeToString(xml));
                                        instance._loaded = true;
                                        instance.setContent(html);
                                    }
                                })
                                .finally(() => {
                                    instance._isFetching = false;
                                });
                        },
                        onHidden(instance: DocumentTippyInstance) {
                            instance.setContent(loadingTranslation);
                            instance._loaded = false;
                        }
                    });
                }
            });
        }
    }

    /**
     *
     *
     * @param {string} paraLangId
     * @param {string} paraLangRx
     * @return {*}
     * @memberof DocumentText
     */
    @action
    async loadTranslation(paraLangId?: string | null, paraLangRx?: string | null) {
        let url = `Documents/Concordance?return_format=XML`;
        if (paraLangId) {
            url += `&paralangid=${paraLangId}`;
        }
        if (paraLangRx) {
            url += `&paralangrx=${paraLangRx}`;
        }
        const results = await this.ajax.request<{
            documents?: { responseSet?: Document[] };
        }>(url, {
            appendTrailingSlash: false
        });
        return results.documents?.responseSet?.[0].document;
    }
}
