app.config(function($stateProvider) {
	$stateProvider
		.state('app.tab.mvresults', {
			cache: false,
			url: '/mvresults/:id',
			views: {
				'roomsView': {
					templateUrl: 'js/movies/mvresults.html',
					controller: 'MvCtrl'
				}
			}
		})
})