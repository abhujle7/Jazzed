app.factory('ApiFactory', function() {
	var event = {};
	return {
		set: function(name, location, time) {
			event.name = name;
			event.location = location;
			if (time) {
				event.date = moment(time).format('ll hh:mm a')
			}
			else {
				event.date = null;
				event.time = null;
			}
		},
		get: function() {
			return event;
		}
	}
})