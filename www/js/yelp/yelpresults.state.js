app.config(function($stateProvider) {
	$stateProvider
		.state('app.tab.yresults', {
			cache: false,
			url: '/yresults/:id',
			views: {
				'roomsView': {
					templateUrl: 'js/yelp/yelpresults.html',
					controller: 'YelprCtrl'
				}
			}
		})
})