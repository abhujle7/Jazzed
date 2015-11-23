app.config(function($stateProvider) {
	$stateProvider
		.state('tab', {
		url: '/tab',
		abstract: true,
		templateUrl: 'templates/tabs.html'
		})
})