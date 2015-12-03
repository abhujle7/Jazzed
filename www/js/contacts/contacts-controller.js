app.controller('ContactsCtrl', function($scope, $cordovaContacts, AuthFactory, $firebaseArray){
		
	$scope.contacts = ['here we go'];
		
		document.addEventListener("deviceready", onDeviceReady, false)

		
		function onDeviceReady () {
			function onSuccess(contacts) {
			    alert('Found ' + contacts.length + ' contacts.');
			    for (var i = 0; i<contacts.length; i++) {
			    	$scope.contacts.push(contacts[i]);
			    }
			};

			function onError(contactError) {
			    alert('onError!');
			};

			var options      = new ContactFindOptions();
			options.filter   = "";
			options.multiple = true;
			options.desiredFields = [navigator.contacts.fieldType.id];
			options.hasPhoneNumber = true; //android only
			var fields       = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];
			navigator.contacts.find(fields, onSuccess, onError, options)
     		
     		// return $scope.contacts;
     	}
	
		$scope.getContacts = function () {
			return $scope.contacts;
		}


     });









