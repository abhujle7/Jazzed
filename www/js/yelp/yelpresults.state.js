app.config(function($stateProvider) {
	$stateProvider
		.state('tab.yresults', {
			url: '/yresults',
			views: {
				'roomsView': {
					templateUrl: 'js/yelp/yelpresults.html',
					controller: 'YelprCtrl'
				}
			}
		})
})