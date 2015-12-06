app.controller('MvCtrl', function($scope, MoviesFactory) {
	$scope.results = MoviesFactory.result()
	$scope.currentTheater;

	$scope.showFull = function(index) {
		$scope.currentTheater = index;
	}

	$scope.show = function(index) {
		return $scope.currentTheater === index;
	}
})