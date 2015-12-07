app.controller('YelprCtrl', function($scope, YelpFactory, ApiFactory, $state) {
	$scope.results = YelpFactory.businesses().businesses;

	$scope.apiEvent = function(a, b, c) {
		ApiFactory.set(a, b, c)
		$state.go('app.tab.apiEvent')
	}
})