app.controller('ResultsCtrl', function($scope, SportsFactory) {

	function change() {
		SportsFactory.result().forEach(function(event) {
			event.datetime_local = moment(event.datetime_local).format('llll')
		})
		return SportsFactory.result()
	}
	$scope.results = change()

})