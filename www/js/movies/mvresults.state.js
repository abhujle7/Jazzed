app.config(function($stateProvider) {
	$stateProvider
		.state('app.tab.mvresults', {
			cache: false,
			url: '/mvresults',
			views: {
				'roomsView': {
					templateUrl: 'js/movies/mvresults.html',
					controller: 'MvCtrl'
				}
			}
		})
})