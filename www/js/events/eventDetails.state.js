app.config(function($stateProvider) {
	$stateProvider
	.state('tab.eventDetails', {
		url: '/event/:eventId',
		views: {
			'eventsView': {
				templateUrl: 'js/events/eventDetails.html',
				controller: 'EventDetailCtrl'
			}
		},
		resolve: {
			eventDetails: function($stateParams, EventFactory) {
				return EventFactory.get($stateParams.eventId);
			}
		}
	})
})
