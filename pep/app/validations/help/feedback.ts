import { validateFormat, validatePresence } from 'ember-changeset-validations/validators';

const FEEDBACK_VALIDATIONS = {
    description: [validatePresence({ presence: true, ignoreBlank: true })],
    reporterName: [validatePresence({ presence: true, ignoreBlank: true, description: 'Full Name' })],
    reporterEmail: [
        validatePresence({ presence: true, ignoreBlank: true, description: 'Email Address' }),
        validateFormat({ type: 'email', description: 'Email Address' })
    ],
    subject: [validatePresence({ presence: true, ignoreBlank: true })],
    url: [validatePresence({ presence: true, ignoreBlank: true, description: 'URL' })]
};

export default FEEDBACK_VALIDATIONS;
