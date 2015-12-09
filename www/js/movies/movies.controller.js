app.controller('MoviesCtrl', function($scope, $state, MoviesFactory, $stateParams) {
	$scope.search = function(data) {
		var days;
		data.date = moment(data.date)
		var now = moment((new Date()).setHours(0, 0, 0, 0));
		var movieDays = data.date.diff(now, "days");
		return MoviesFactory.get(data.zipcode, movieDays)
		 	.then(function(movies) {
		 		$scope.data;
				$state.go('app.tab.mvresults', {id: $stateParams.id})
		 	})
	}
})