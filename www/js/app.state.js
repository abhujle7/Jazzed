app.config(function($stateProvider) {
	$stateProvider
		.state('app', {
		url: '/app',
		abstract: true,
		cache: false,
		templateUrl: 'js/app.html'
		})
})