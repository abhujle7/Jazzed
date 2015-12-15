app.factory('YelpFactory', function($http) {
	var results;
	return {
		get: function(data) {
			return $http.get('/api/yelp/?area=' + data.location + '&query=' + data.query) 
			.then(function(response) {
				response.data.businesses.forEach(function(business) {
					business.location.display_address = business.location.display_address[0] + ", " + business.location.display_address[1] + " " + business.location.display_address[2]
				})
				results = response.data
				return response.data
			})
		},
		businesses: function() {
			return results;
		}
	}
})