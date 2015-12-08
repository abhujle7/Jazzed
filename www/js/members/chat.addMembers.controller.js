app.controller('AddMembersCtrl', function($scope, AuthFactory, $firebaseObject, RoomsFactory, currentRoomId){
    var userContacts = []
    var phoneToUserHash = AuthFactory.phoneToUser();
    var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users')
    function parsePhone(number) {
        var digits = number.replace(/\D/g, "");
        if (digits[0] == '1') {
            digits = digits.slice(1)
        }
        return digits
    }
    $scope.contacts;
    document.addEventListener("deviceready", onDeviceReady, false)
	function onDeviceReady () {
	    function onSuccess(contacts) {
	        userContacts = _(contacts)
	            .pluck('phoneNumbers')
	            .flatten()
	            .pluck('value')
	            .value();
	        $scope.contacts = (function() {
		        var arr = [];
		        for (var i = 0; i < userContacts.length; i++) {
		        	if (userContacts[i]) {
			            var number = parsePhone(userContacts[i])
			            if (phoneToUserHash[number]) {
			                var uid = phoneToUserHash[number];
			                userRef.child(uid).on("value", function(snapshot) {
			                    var name = snapshot.val().name
			                    var phone = snapshot.val().phone
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
		        }
		        return arr
		    })()
	    }

	    function onError(contactError) {
	        alert('onError!');
	    }

	    var options      = new ContactFindOptions();
	    options.filter   = "";
	    options.multiple = true;
	    options.desiredFields = ['phoneNumbers', 'displayName', 'name']
	    // options.hasPhoneNumber = true; //android only
	    var fields       = ['displayName', 'phoneNumbers'];
	    navigator.contacts.find(fields, onSuccess, onError, options)
	 }

	$scope.addMember = function(id) {
		return RoomsFactory.addMember(id, currentRoomId)
	}

});