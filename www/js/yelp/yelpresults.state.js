app.config(function($stateProvider) {
	$stateProvider
		.state('app.tab.yresults', {
			url: '/yresults',
			views: {
				'roomsView': {
					templateUrl: 'js/yelp/yelpresults.html',
					controller: 'YelprCtrl'
				}
			}
		})
})