app.controller('MoviesCtrl', function($scope, $state, MoviesFactory) {
	$scope.search = function(data) {
		data.date = moment(data.date)
		var now = moment(Date.now());
		var movieDate = data.date.diff(now, "days") + 1;
		return MoviesFactory.get(zip)
		 	.then(function(movies) {
				$state.go('tab.mvresults')
		 	})
	}
})