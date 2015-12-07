app.config(function($stateProvider) {
	$stateProvider
		.state('app.tab.mvresults', {
			url: '/mvresults',
			views: {
				'roomsView': {
					templateUrl: 'js/movies/mvresults.html',
					controller: 'MvCtrl'
				}
			}
		})
})