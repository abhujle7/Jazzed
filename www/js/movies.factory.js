app.factory('MoviesFactory', function($http) {
	var data;
	return {
		get: function(zip) {
			return $http.get('/api/movies/' + zip)
				.then(function(movies) {
					data = movies
					return movies
				})
		},

		result: function() {
			return data;
		}
	}
})