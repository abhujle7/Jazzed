app.config(function($stateProvider) {
	$stateProvider
	.state('app.tab.createNewEvent', {
		url: '/createNewEvent',
		views: {
			'eventsView': {
				cache: false,
				templateUrl: 'js/events/createNewEvent.html',
				controller: 'EventsCtrl'
			}
		}
	})
})