import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import createChangeset from '@gavant/ember-validations/utilities/create-changeset';

import { BASE_CONFIG_NAME, DEFAULT_BASE_CONFIGURATION } from 'pep/constants/configuration';
import AdminCommonController from 'pep/pods/admin/common/controller';
import Configuration from 'pep/pods/configuration/model';
import Validations from 'pep/validations/configuration/common';

export default class AdminCommon extends Route {
    /**
     * Load the base config
     *
     * @return {*}  {Promise<Configuration>}
     * @memberof AdminCommon
     */
    model(): Promise<Configuration> {
        return this.store.queryRecord('configuration', { configname: BASE_CONFIG_NAME });
    }

    /**
     * Create the changeset and set it as a property on the controller
     *
     * @param {AdminCommonController} controller
     * @param {Configuration} model
     * @param {Transition} transition
     * @memberof AdminCommon
     */
    setupController(controller: AdminCommonController, model: Configuration, transition: Transition): void {
        super.setupController(controller, model, transition);
        model.configSettings = Object.assign({}, DEFAULT_BASE_CONFIGURATION, model.configSettings);
        controller.changeset = createChangeset(model, Validations);
    }
}
