app.controller('YelpCtrl', function($scope, YelpFactory, $state) {

	$scope.search = function(data) {
		return YelpFactory.get(data)
			.then(function(results) {
				$state.go('tab.yresults')
			})
	}
})