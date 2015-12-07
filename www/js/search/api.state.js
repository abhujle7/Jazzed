app.config(function($stateProvider) {
	$stateProvider
		.state('app.tab.apiEvent',  {
			cache: false,
			url: '/apiEvent',
			views: {
				'roomsView': {
					templateUrl: 'js/api-event/api.event.html',
					controller: 'ApiCtrl'
				}
			}
		}
	)
})