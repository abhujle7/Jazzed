app.controller('MvCtrl', function($scope, MoviesFactory, ApiFactory, $state) {
	$scope.results = MoviesFactory.result()
	$scope.currentTheater;

	$scope.showFull = function(index) {
		$scope.currentTheater = index;
	}

	$scope.show = function(index) {
		return $scope.currentTheater === index;
	}

	$scope.apiEvent = function(a, b, c) {
		ApiFactory.set(a, b, c)
		$state.go('app.tab.apiEvent')
	}
})