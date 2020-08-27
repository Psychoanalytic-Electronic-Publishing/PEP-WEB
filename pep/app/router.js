import EmberRouter from '@ember/routing/router';

import config from 'pep/config/environment';

export default class Router extends EmberRouter {
    location = config.locationType;
    //@see https://blog.emberjs.com/2016/04/28/baseurl ("Configuring the Router" section)
    rootURL = config.routerRootURL;
}

Router.map(function() {
    this.route('login');
    this.route('search');
    this.route('browse');
    this.route('read', function() {
        this.route('document', { path: '/:document_id' });
    });

    this.route('most-cited');
    this.route('most-viewed');

    //make sure these routes are always defined last!
    this.route('five-hundred', { path: '/500' });
    this.route('four-oh-three', { path: '/403' });
    this.route('four-oh-four', { path: '/*path' });
});
