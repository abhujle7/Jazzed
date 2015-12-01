app.config(function($stateProvider) {
	$stateProvider
	.state('tab.createNewEvent', {
		url: '/createNewEvent',
		views: {
			'eventsView': {
				templateUrl: 'js/events/createNewEvent.html',
				controller: 'EventsCtrl'
			}
		}
	})
})