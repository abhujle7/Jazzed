app.controller('ContactsCtrl', function($scope, contacts, ContactsFactory, AuthFactory, currentRoomId, RoomsFactory, ChatFactory){
	document.addEventListener("deviceready", ContactsFactory.onDeviceReady, false)
	var userContacts = contacts;
	var phoneToUserHash = AuthFactory.phoneToUser();
	var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users')
	function parsePhone(number) {
		var digits = number.replace(/\D/g, "");
		if (digits[0] == '1') {
			digits = digits.slice(1)
		}
		return digits
	}
	$scope.contacts = (function() {
		var arr = [];
		for (var i = 0; i < userContacts.length; i++) {
			var number = parsePhone(userContacts[i])
			if (phoneToUserHash[number]) {
				var uid = phoneToUserHash[number];
				userRef.child(uid).on("value", function(snapshot) {
					var name = snapshot.val().name
					var phone = number
					var photo = snapshot.val().photo
					arr.push({
						name: name,
						phone: phone,
						photo: photo,
						uid: uid
					})
				})
			}
		}
		return arr
		.filter(function(member) {
			return !isContactMember(member.uid)
		})
	})()

	$scope.addMember = function(id) {
		return RoomsFactory.addMember(id, currentRoomId)
	}

	// $scope.isContactMember = function(uid) {
	// 	if (ChatFactory.getMembers().indexOf(uid) > -1) {
	// 		return true
	// 	}
	// 	else {
	// 		return false
	// 	}
	// }

});









