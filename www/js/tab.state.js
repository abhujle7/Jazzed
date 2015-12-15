app.config(function($stateProvider) {
	$stateProvider
		.state('app.tab', {
		url: '/tab',
		abstract: true,
		cache: false,
		views: {
            'menu-content': {
                templateUrl: 'js/tabs.html'
            },
            'menu-left': {
                templateUrl: 'js/sidemenu.html'
            }
		}
	})
})