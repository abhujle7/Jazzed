app.controller('ResultsCtrl', function($scope, SportsFactory, ApiFactory, $state) {

	function change() {
		SportsFactory.result().forEach(function(event) {
			event.datetime_local = moment(event.datetime_local).format('llll')
		})
		return SportsFactory.result()
	}
	$scope.results = change()

	$scope.apiEvent = function(a, b, c) {
		ApiFactory.set(a, b, c)
		$state.go('app.tab.apiEvent')
	}

})