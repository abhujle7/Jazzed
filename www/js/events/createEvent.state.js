app.config(function($stateProvider) {
	$stateProvider
	.state('app.tab.createNewEvent', {
		url: '/createNewEvent',
		cache: false,
		views: {
			'eventsView': {
				cache: false,
				templateUrl: 'js/events/createNewEvent.html',
				controller: 'EventsCtrl'
			}
		}
	})
})