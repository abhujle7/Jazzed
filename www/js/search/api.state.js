app.config(function($stateProvider) {
	$stateProvider
		.state('app.tab.apiEvent',  {
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