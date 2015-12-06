app.factory('YelpFactory', function($http) {
	var results;
	return {
		get: function(data) {
			return $http.get('/api/yelp/?area=' + data.location + '&query=' + data.query) 
			.then(function(response) {
				return response.data
			})
		},
		businesses: function() {
			return results;
		}
	}
})