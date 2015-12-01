'use strict';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
window.app = angular.module('starter', ['ionic', "firebase", "ui.router"])

 
 
app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

app.config(function($urlRouterProvider) {
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});

app.factory("AuthFactory", function($firebaseObject, $firebaseAuth, $firebaseArray) {
    var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')
    var auth = $firebaseAuth(ref);
    var users = ref.child('users')
    return {
      signUp: function(credentials) {
        return auth.$createUser({email: credentials.email, password: credentials.password})
        .then(function(user) {
          user.name = credentials.name;
          user.phone = credentials.phone;
          user.email = credentials.email;
          users.child(user.uid).set({
            name: user.name,
            phone: user.phone,
            email: user.email
          })
          return user
        })
        .then(function() {
          var email = credentials.email;
          var password = credentials.password;
          return auth.$authWithPassword({
            email: email,
            password: password
          })
        })
        .catch(console.error)
      },
      getCurrentUser: function() {
        return ref.getAuth()
      },
      signIn: function(credentials) {
        var email = credentials.email;
        var password = credentials.password;
        return auth.$authWithPassword({
          email: email,
          password: password
        })
        .catch(console.error)
      }
    }
  });
app.factory('ChatFactory', function($firebase, RoomsFactory) {

  var selectedRoomId;
  var chats;
  var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.$remove(chat)
      .then(function (ref) {
        ref.key() === chat.$id;
      });
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    },
    getSelectedRoomName: function () {
      var selectedRoom;
      if (selectedRoomId && selectedRoomId != null) {
          selectedRoom = RoomsFactory.get(selectedRoomId);
          if (selectedRoom)
              return selectedRoom.name;
          else
              return null;
      } else
          return null;
    },
    selectRoom: function (roomId) {
        console.log("selecting the room with id: " + roomId);
        selectedRoomId = roomId;
        if (!isNaN(roomId)) {
            chats = $firebaseArray(ref.child('rooms').child(selectedRoomId).child('chats'));
        }
    },
    send: function (from, message) {
        console.log("sending message from :" + from.displayName + " & message is " + message);
        if (from && message) {
            var chatMessage = {
                from: from.displayName,
                message: message,
                createdAt: Firebase.ServerValue.TIMESTAMP
            };
            chats.$add(chatMessage).then(function (data) {
                console.log("message added");
            });
        }
    }
  };
});
app.config(function($stateProvider) {
	$stateProvider
		.state('tab', {
		url: '/tab',
		abstract: true,
		cache: false,
		templateUrl: 'js/tabs.html'
		})
})
// angular.module('starter.controllers', [])

app.controller('AccountCtrl', function($scope, $state) {


var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')

  $scope.settings = {
    enableFriends: true
  };
  
  $scope.places = function() {
  	yelp.search({ term: 'mexican', location: 'Brooklyn' })
.then(function (data) {
  console.log(data);
})
  }

});

app.controller('ChatCtrl', function($scope, ChatFactory, $state) {

  $scope.IM = {
    textMessage: ""
  };

  ChatFactory.selectRoom($state.params.roomId);

  var roomName = ChatFactory.getSelectedRoomName();

  if (roomName) {
      $scope.roomName = " - " + roomName;
      $scope.chats = ChatFactory.all();
  }

  $scope.sendMessage = function (msg) {
      console.log(msg);
      ChatFactory.send($scope.displayName, msg);
      $scope.IM.textMessage = "";
  }

  $scope.remove = function (chat) {
      ChatFactory.remove(chat);
  }

    // $scope.sendChat = function (chat){
    //   if ($rootScope.user) {
    //     // console.log('this is user', $rootScope.user)
    //     $scope.chats.$add({
    //       user: $rootScope.user,
    //       message: chat.message
    //     });
    //   chat.message = "";
    //   }
    // }
 })


app.config(function($stateProvider) {

  $stateProvider
  .state('tab.chat', {
    url: '/chat',
    views: {
      'roomsView': {
        templateUrl: 'js/chat/chat.html',
        controller: 'ChatCtrl'
      }
    }
  })
});
// angular.module('starter.controllers', [])

app.controller('DashCtrl', function($scope, $state) {
	$state.go('tab.chats')
})
app.config(function($stateProvider) {
	$stateProvider
	.state('tab.createNewEvent', {
		url: '/createNewEvent',
		views: {
			'eventsView': {
				templateUrl: 'js/events/createNewEvent.html',
				controller: 'EventsCtrl'
			}
		}
	})
})
app.factory('EventFactory', function($firebase, $firebaseArray, AuthFactory) {
	
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com');
	var events = $firebaseArray(ref.child('events'));
	var fixedEvents = $firebaseArray(ref.child('events').child('fixed'));
	var locationChild = $firebaseArray(ref.child('events').child('fixed').child('location'));
	var currentUser = AuthFactory.getCurrentUser();

	return {
		all: function() {
			console.log(events);
		},
		addEvent: function(eventName, eventTime, eventLocation, locationName) {
			fixedEvents.$add({
				name: eventName,
				time: eventTime,
				location: {
					name: locationName,
					coordinates: eventLocation
				}
			})
		}
	}
})

/*
-----To-do list----
Switch name or event._id

*/


 //----------------------------------------
      // "events": {
      //   "fixed": {
      // 	".write": "auth !== null",
      //     "$event_id": {
      //       ".validate": "(newData.child('name').exists()) && (newData.exists() && newData.hasChildren(['time', 'location']))",
      //       "name": {
      //         ".validate": "newData.val().length < 20 && newData.val().length > 0"
      //       },
      //       "time": {
      //         ".validate": "newData.val() <= now"
      //       },
      //       "location": {
      //         ".validate": "newData.hasChildren(['name', 'coordinates'])",
      //         "name": {".validate": "newData.isString() && newData.val().length < 20"},
      //         "coordinates": {
      //			".validate": "newData.val().length < 20 && newData.val().length > 0"
      //         } 
      //       }
      //     }
      //   },
app.controller('EventsCtrl', function($scope, $state, EventFactory) {

	$scope.events = [{
		name: "foodie",
		time: 123445,
		location: "My house"
	},{
		name: "games",
		time: 345543,
		location: "your house"
	},{
		name: "dance off",
		time: 23234,
		location: "white house"
	}];

	$scope.data = {};

	$scope.createEvent = function() {
		$state.go('tab.createNewEvent');
	}

	$scope.submitEvent = function() {
		EventFactory.addEvent($scope.data.name, $scope.data.time, $scope.data.location, $scope.data.locationName);
		EventFactory.all();
	}
 })

//needs to talk to the back
app.config(function($stateProvider) {
  $stateProvider
  .state('tab.events', {
    url: '/events',
    views: {
      'eventsView': {
        templateUrl: 'js/events/events.html',
        controller: 'EventsCtrl'
      }
    }
  })
});
app.controller('LoginCtrl', function($scope) {
  $scope.contacts = ["person1", "person2", "person3"];
  $scope.chats = ["bart", "whiskey", "lloo"];
})

app.config(function($stateProvider) {
  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: 'js/login/login.html', 
    controller: 'RegisterCtrl'
  })
});
app.config(function($stateProvider) {
  $stateProvider
  .state('tab.createNewRoom', {
    url: '/createNewRoom',
    views: {
      'roomsView': {
        templateUrl: 'js/rooms/createNewRoom.html',
        controller: 'RoomsCtrl'
      }
    }
  })
});
app.controller('RoomsCtrl', function($scope, RoomsFactory, ChatFactory, $state) {

    // $ionicModal.fromTemplateUrl('js/login/login.html', {
    //     scope: $scope,
    //     animation: 'slide-in-up'
    // })
    // .then(function (modal) {
    // $scope.modal = modal;
    // });

    $scope.rooms = RoomsFactory.all();

    $scope.createRoom = function () {
        $state.go('tab.createNewRoom');
    }

    $scope.openRoom = function (roomId) {
      console.log('this is roomid', roomId)
      $state.go('tab.chat', {
        roomId: roomId
      });
    }

    $scope.addContact = function () {
        //add to firebase array in roomsfactory
    }

    $scope.saveNewRoom = function (roomObj) {
        console.log('this is the roomobj', roomObj)
        return RoomsFactory.add(roomObj).then(function(id) {
            console.log('this is the id', id)
        })

        
        //add to firebase array in roomsfactory
    }

    // $scope.sendChat = function (chat){
    //   if ($rootScope.user) {
    //     // console.log('this is user', $rootScope.user)
    //     $scope.chats.$add({
    //       user: $rootScope.user,
    //       message: chat.message
    //     });
    //   chat.message = "";
    //   }
    // }
 })

app.factory('RoomsFactory', function($firebaseArray) {

  var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')
  var rooms = $firebaseArray(ref.child('groups'));

  return {

    all: function() {
      return rooms;
    },
   
    get: function(roomId) {
      return rooms.$getRecord(roomId);
    },

    add: function(roomObj) {
      console.log('this is roomobj in fac', roomObj)
      rooms.$add(roomObj)
      .then(function (ref) {
        console.log('this is the ref', ref)
        var id = ref.key();
        console.log('this is the id', id)
        return id;
        // console.log('added record with id' + id);
        // return rooms.$indexFor(id);
        //state.go to chat detail with new id
      })

    }
  };
});

app.config(function($stateProvider) {
  $stateProvider
  .state('tab.rooms', {
    url: '/rooms',
    views: {
      'roomsView': {
        templateUrl: 'js/rooms/rooms.html',
        controller: 'RoomsCtrl'
      }
    }
    // resolve: {
    //     "currentAuth": ["Auth",
    //         function (Auth) {
    //             return Auth.$waitForAuth();
    // }]}
  })
});
// angular.module('starter.controllers', [])

app.controller('SettingsCtrl', function($scope, currentUser, $state) {

var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')

  $scope.user = currentUser;

   $scope.logout = function() {
  	ref.unauth();
  	$state.go('login')
  }

});

app.config(function($urlRouterProvider, $stateProvider) {
  $stateProvider
  .state('tab.settings', {
    url: '/settings/:uid',
    views: {
      'settingsView': {
        templateUrl: 'js/settings/userInfo.html',
        controller: 'SettingsCtrl'
      }
    },
    resolve: {
      currentUser: function($stateParams, $firebaseObject) {
        var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + $stateParams.uid)
        var user = $firebaseObject(ref)
        return user
      }
    }
  })
});
app.controller('RegisterCtrl', function($scope, $firebaseAuth, AuthFactory, $state, $rootScope, $ionicModal) {
    
    // $ionicModal.fromTemplateUrl('js/login/login.html', {
    // scope: $scope })
    // .then(function (modal) {
    // $scope.modal = modal;
    // });


    $scope.signUp = function(credentials) {
        AuthFactory.signUp(credentials)
        .then(function(user) {
            $rootScope.user = user;
            $state.go('tab.rooms', {uid: user.uid})
        })
    }
    $scope.signIn = function(credentials) {
        AuthFactory.signIn(credentials)
        .then(function(user) {
            $rootScope.user = user;
            $state.go('tab.rooms', {uid: user.uid})
        })
    }
})
app.controller('UserCtrl', ["$scope", "$firebase", "$firebaseAuth", function($scope, $firebase, $firebaseAuth) {
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')
	
}])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguZmFjdG9yeS5qcyIsImNoYXQuZmFjdG9yeS5qcyIsInRhYlN0YXRlLmpzIiwiYWNjb3VudC9hY2NvdW50LmNvbnRyb2xsZXIuanMiLCJjaGF0L2NoYXQuY29udHJvbGxlci5qcyIsImNoYXQvdGFiLmNoYXQuc3RhdGUuanMiLCJkYXNoL2Rhc2guY29udHJvbGxlci5qcyIsImV2ZW50cy9jcmVhdGVFdmVudC5zdGF0ZS5qcyIsImV2ZW50cy9ldmVudC5mYWN0b3J5LmpzIiwiZXZlbnRzL2V2ZW50cy5jb250cm9sbGVyLmpzIiwiZXZlbnRzL2V2ZW50cy5zdGF0ZS5qcyIsImxvZ2luL2xvZ2luLmNvbnRyb2xsZXIuanMiLCJsb2dpbi9sb2dpbi5zdGF0ZS5qcyIsInJvb21zL2NyZWF0ZU5ld1Jvb20uc3RhdGUuanMiLCJyb29tcy9yb29tcy5jb250cm9sbGVyLmpzIiwicm9vbXMvcm9vbXMuZmFjdG9yeS5qcyIsInJvb21zL3Jvb21zLnN0YXRlLmpzIiwic2V0dGluZ3Mvc2V0dGluZ3MuY29udHJvbGxlci5qcyIsInNldHRpbmdzL3NldHRpbmdzLnN0YXRlLmpzIiwiY29udHJvbGxlcnMvcmVnaXN0ZXIuY29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL3VzZXIuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLy8gSW9uaWMgU3RhcnRlciBBcHBcblxuLy8gYW5ndWxhci5tb2R1bGUgaXMgYSBnbG9iYWwgcGxhY2UgZm9yIGNyZWF0aW5nLCByZWdpc3RlcmluZyBhbmQgcmV0cmlldmluZyBBbmd1bGFyIG1vZHVsZXNcbi8vICdzdGFydGVyJyBpcyB0aGUgbmFtZSBvZiB0aGlzIGFuZ3VsYXIgbW9kdWxlIGV4YW1wbGUgKGFsc28gc2V0IGluIGEgPGJvZHk+IGF0dHJpYnV0ZSBpbiBpbmRleC5odG1sKVxuLy8gdGhlIDJuZCBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2YgJ3JlcXVpcmVzJ1xuLy8gJ3N0YXJ0ZXIuc2VydmljZXMnIGlzIGZvdW5kIGluIHNlcnZpY2VzLmpzXG4vLyAnc3RhcnRlci5jb250cm9sbGVycycgaXMgZm91bmQgaW4gY29udHJvbGxlcnMuanNcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlcicsIFsnaW9uaWMnLCBcImZpcmViYXNlXCIsIFwidWkucm91dGVyXCJdKVxuXG4gXG4gXG5hcHAucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgaWYgKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuXG4gICAgfVxuICAgIGlmICh3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICAvLyBvcmcuYXBhY2hlLmNvcmRvdmEuc3RhdHVzYmFyIHJlcXVpcmVkXG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG4gICAgfVxuICB9KTtcbn0pXG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gIC8vIGlmIG5vbmUgb2YgdGhlIGFib3ZlIHN0YXRlcyBhcmUgbWF0Y2hlZCwgdXNlIHRoaXMgYXMgdGhlIGZhbGxiYWNrXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9sb2dpbicpO1xufSk7XG4iLCJhcHAuZmFjdG9yeShcIkF1dGhGYWN0b3J5XCIsIGZ1bmN0aW9uKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgocmVmKTtcbiAgICB2YXIgdXNlcnMgPSByZWYuY2hpbGQoJ3VzZXJzJylcbiAgICByZXR1cm4ge1xuICAgICAgc2lnblVwOiBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICByZXR1cm4gYXV0aC4kY3JlYXRlVXNlcih7ZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsLCBwYXNzd29yZDogY3JlZGVudGlhbHMucGFzc3dvcmR9KVxuICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgdXNlci5uYW1lID0gY3JlZGVudGlhbHMubmFtZTtcbiAgICAgICAgICB1c2VyLnBob25lID0gY3JlZGVudGlhbHMucGhvbmU7XG4gICAgICAgICAgdXNlci5lbWFpbCA9IGNyZWRlbnRpYWxzLmVtYWlsO1xuICAgICAgICAgIHVzZXJzLmNoaWxkKHVzZXIudWlkKS5zZXQoe1xuICAgICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxuICAgICAgICAgICAgcGhvbmU6IHVzZXIucGhvbmUsXG4gICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbFxuICAgICAgICAgIH0pXG4gICAgICAgICAgcmV0dXJuIHVzZXJcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGVtYWlsID0gY3JlZGVudGlhbHMuZW1haWw7XG4gICAgICAgICAgdmFyIHBhc3N3b3JkID0gY3JlZGVudGlhbHMucGFzc3dvcmQ7XG4gICAgICAgICAgcmV0dXJuIGF1dGguJGF1dGhXaXRoUGFzc3dvcmQoe1xuICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGNvbnNvbGUuZXJyb3IpXG4gICAgICB9LFxuICAgICAgZ2V0Q3VycmVudFVzZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcmVmLmdldEF1dGgoKVxuICAgICAgfSxcbiAgICAgIHNpZ25JbjogZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgdmFyIGVtYWlsID0gY3JlZGVudGlhbHMuZW1haWw7XG4gICAgICAgIHZhciBwYXNzd29yZCA9IGNyZWRlbnRpYWxzLnBhc3N3b3JkO1xuICAgICAgICByZXR1cm4gYXV0aC4kYXV0aFdpdGhQYXNzd29yZCh7XG4gICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goY29uc29sZS5lcnJvcilcbiAgICAgIH1cbiAgICB9XG4gIH0pOyIsImFwcC5mYWN0b3J5KCdDaGF0RmFjdG9yeScsIGZ1bmN0aW9uKCRmaXJlYmFzZSwgUm9vbXNGYWN0b3J5KSB7XG5cbiAgdmFyIHNlbGVjdGVkUm9vbUlkO1xuICB2YXIgY2hhdHM7XG4gIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuXG4gIHJldHVybiB7XG4gICAgYWxsOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjaGF0cztcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24oY2hhdCkge1xuICAgICAgY2hhdHMuJHJlbW92ZShjaGF0KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICByZWYua2V5KCkgPT09IGNoYXQuJGlkO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGNoYXRJZCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGF0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY2hhdHNbaV0uaWQgPT09IHBhcnNlSW50KGNoYXRJZCkpIHtcbiAgICAgICAgICByZXR1cm4gY2hhdHNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgZ2V0U2VsZWN0ZWRSb29tTmFtZTogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHNlbGVjdGVkUm9vbTtcbiAgICAgIGlmIChzZWxlY3RlZFJvb21JZCAmJiBzZWxlY3RlZFJvb21JZCAhPSBudWxsKSB7XG4gICAgICAgICAgc2VsZWN0ZWRSb29tID0gUm9vbXNGYWN0b3J5LmdldChzZWxlY3RlZFJvb21JZCk7XG4gICAgICAgICAgaWYgKHNlbGVjdGVkUm9vbSlcbiAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGVkUm9vbS5uYW1lO1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2VcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIHNlbGVjdFJvb206IGZ1bmN0aW9uIChyb29tSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZWxlY3RpbmcgdGhlIHJvb20gd2l0aCBpZDogXCIgKyByb29tSWQpO1xuICAgICAgICBzZWxlY3RlZFJvb21JZCA9IHJvb21JZDtcbiAgICAgICAgaWYgKCFpc05hTihyb29tSWQpKSB7XG4gICAgICAgICAgICBjaGF0cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgncm9vbXMnKS5jaGlsZChzZWxlY3RlZFJvb21JZCkuY2hpbGQoJ2NoYXRzJykpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBzZW5kOiBmdW5jdGlvbiAoZnJvbSwgbWVzc2FnZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRpbmcgbWVzc2FnZSBmcm9tIDpcIiArIGZyb20uZGlzcGxheU5hbWUgKyBcIiAmIG1lc3NhZ2UgaXMgXCIgKyBtZXNzYWdlKTtcbiAgICAgICAgaWYgKGZyb20gJiYgbWVzc2FnZSkge1xuICAgICAgICAgICAgdmFyIGNoYXRNZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgIGZyb206IGZyb20uZGlzcGxheU5hbWUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IEZpcmViYXNlLlNlcnZlclZhbHVlLlRJTUVTVEFNUFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNoYXRzLiRhZGQoY2hhdE1lc3NhZ2UpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1lc3NhZ2UgYWRkZWRcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgfTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXJcblx0XHQuc3RhdGUoJ3RhYicsIHtcblx0XHR1cmw6ICcvdGFiJyxcblx0XHRhYnN0cmFjdDogdHJ1ZSxcblx0XHRjYWNoZTogZmFsc2UsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy90YWJzLmh0bWwnXG5cdFx0fSlcbn0pIiwiLy8gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuY29udHJvbGxlcnMnLCBbXSlcblxuYXBwLmNvbnRyb2xsZXIoJ0FjY291bnRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUpIHtcblxuXG52YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcblxuICAkc2NvcGUuc2V0dGluZ3MgPSB7XG4gICAgZW5hYmxlRnJpZW5kczogdHJ1ZVxuICB9O1xuICBcbiAgJHNjb3BlLnBsYWNlcyA9IGZ1bmN0aW9uKCkge1xuICBcdHllbHAuc2VhcmNoKHsgdGVybTogJ21leGljYW4nLCBsb2NhdGlvbjogJ0Jyb29rbHluJyB9KVxuLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgY29uc29sZS5sb2coZGF0YSk7XG59KVxuICB9XG5cbn0pO1xuIiwiYXBwLmNvbnRyb2xsZXIoJ0NoYXRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBDaGF0RmFjdG9yeSwgJHN0YXRlKSB7XG5cbiAgJHNjb3BlLklNID0ge1xuICAgIHRleHRNZXNzYWdlOiBcIlwiXG4gIH07XG5cbiAgQ2hhdEZhY3Rvcnkuc2VsZWN0Um9vbSgkc3RhdGUucGFyYW1zLnJvb21JZCk7XG5cbiAgdmFyIHJvb21OYW1lID0gQ2hhdEZhY3RvcnkuZ2V0U2VsZWN0ZWRSb29tTmFtZSgpO1xuXG4gIGlmIChyb29tTmFtZSkge1xuICAgICAgJHNjb3BlLnJvb21OYW1lID0gXCIgLSBcIiArIHJvb21OYW1lO1xuICAgICAgJHNjb3BlLmNoYXRzID0gQ2hhdEZhY3RvcnkuYWxsKCk7XG4gIH1cblxuICAkc2NvcGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICBjb25zb2xlLmxvZyhtc2cpO1xuICAgICAgQ2hhdEZhY3Rvcnkuc2VuZCgkc2NvcGUuZGlzcGxheU5hbWUsIG1zZyk7XG4gICAgICAkc2NvcGUuSU0udGV4dE1lc3NhZ2UgPSBcIlwiO1xuICB9XG5cbiAgJHNjb3BlLnJlbW92ZSA9IGZ1bmN0aW9uIChjaGF0KSB7XG4gICAgICBDaGF0RmFjdG9yeS5yZW1vdmUoY2hhdCk7XG4gIH1cblxuICAgIC8vICRzY29wZS5zZW5kQ2hhdCA9IGZ1bmN0aW9uIChjaGF0KXtcbiAgICAvLyAgIGlmICgkcm9vdFNjb3BlLnVzZXIpIHtcbiAgICAvLyAgICAgLy8gY29uc29sZS5sb2coJ3RoaXMgaXMgdXNlcicsICRyb290U2NvcGUudXNlcilcbiAgICAvLyAgICAgJHNjb3BlLmNoYXRzLiRhZGQoe1xuICAgIC8vICAgICAgIHVzZXI6ICRyb290U2NvcGUudXNlcixcbiAgICAvLyAgICAgICBtZXNzYWdlOiBjaGF0Lm1lc3NhZ2VcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICBjaGF0Lm1lc3NhZ2UgPSBcIlwiO1xuICAgIC8vICAgfVxuICAgIC8vIH1cbiB9KVxuXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIuY2hhdCcsIHtcbiAgICB1cmw6ICcvY2hhdCcsXG4gICAgdmlld3M6IHtcbiAgICAgICdyb29tc1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY2hhdC9jaGF0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2hhdEN0cmwnXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiLy8gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuY29udHJvbGxlcnMnLCBbXSlcblxuYXBwLmNvbnRyb2xsZXIoJ0Rhc2hDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUpIHtcblx0JHN0YXRlLmdvKCd0YWIuY2hhdHMnKVxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyXG5cdC5zdGF0ZSgndGFiLmNyZWF0ZU5ld0V2ZW50Jywge1xuXHRcdHVybDogJy9jcmVhdGVOZXdFdmVudCcsXG5cdFx0dmlld3M6IHtcblx0XHRcdCdldmVudHNWaWV3Jzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2pzL2V2ZW50cy9jcmVhdGVOZXdFdmVudC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0V2ZW50c0N0cmwnXG5cdFx0XHR9XG5cdFx0fVxuXHR9KVxufSkiLCJhcHAuZmFjdG9yeSgnRXZlbnRGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlLCAkZmlyZWJhc2VBcnJheSwgQXV0aEZhY3RvcnkpIHtcblx0XG5cdHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKTtcblx0dmFyIGV2ZW50cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnZXZlbnRzJykpO1xuXHR2YXIgZml4ZWRFdmVudHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoJ2V2ZW50cycpLmNoaWxkKCdmaXhlZCcpKTtcblx0dmFyIGxvY2F0aW9uQ2hpbGQgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoJ2V2ZW50cycpLmNoaWxkKCdmaXhlZCcpLmNoaWxkKCdsb2NhdGlvbicpKTtcblx0dmFyIGN1cnJlbnRVc2VyID0gQXV0aEZhY3RvcnkuZ2V0Q3VycmVudFVzZXIoKTtcblxuXHRyZXR1cm4ge1xuXHRcdGFsbDogZnVuY3Rpb24oKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhldmVudHMpO1xuXHRcdH0sXG5cdFx0YWRkRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgZXZlbnRUaW1lLCBldmVudExvY2F0aW9uLCBsb2NhdGlvbk5hbWUpIHtcblx0XHRcdGZpeGVkRXZlbnRzLiRhZGQoe1xuXHRcdFx0XHRuYW1lOiBldmVudE5hbWUsXG5cdFx0XHRcdHRpbWU6IGV2ZW50VGltZSxcblx0XHRcdFx0bG9jYXRpb246IHtcblx0XHRcdFx0XHRuYW1lOiBsb2NhdGlvbk5hbWUsXG5cdFx0XHRcdFx0Y29vcmRpbmF0ZXM6IGV2ZW50TG9jYXRpb25cblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cbn0pXG5cbi8qXG4tLS0tLVRvLWRvIGxpc3QtLS0tXG5Td2l0Y2ggbmFtZSBvciBldmVudC5faWRcblxuKi9cblxuXG4gLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBcImV2ZW50c1wiOiB7XG4gICAgICAvLyAgIFwiZml4ZWRcIjoge1xuICAgICAgLy8gXHRcIi53cml0ZVwiOiBcImF1dGggIT09IG51bGxcIixcbiAgICAgIC8vICAgICBcIiRldmVudF9pZFwiOiB7XG4gICAgICAvLyAgICAgICBcIi52YWxpZGF0ZVwiOiBcIihuZXdEYXRhLmNoaWxkKCduYW1lJykuZXhpc3RzKCkpICYmIChuZXdEYXRhLmV4aXN0cygpICYmIG5ld0RhdGEuaGFzQ2hpbGRyZW4oWyd0aW1lJywgJ2xvY2F0aW9uJ10pKVwiLFxuICAgICAgLy8gICAgICAgXCJuYW1lXCI6IHtcbiAgICAgIC8vICAgICAgICAgXCIudmFsaWRhdGVcIjogXCJuZXdEYXRhLnZhbCgpLmxlbmd0aCA8IDIwICYmIG5ld0RhdGEudmFsKCkubGVuZ3RoID4gMFwiXG4gICAgICAvLyAgICAgICB9LFxuICAgICAgLy8gICAgICAgXCJ0aW1lXCI6IHtcbiAgICAgIC8vICAgICAgICAgXCIudmFsaWRhdGVcIjogXCJuZXdEYXRhLnZhbCgpIDw9IG5vd1wiXG4gICAgICAvLyAgICAgICB9LFxuICAgICAgLy8gICAgICAgXCJsb2NhdGlvblwiOiB7XG4gICAgICAvLyAgICAgICAgIFwiLnZhbGlkYXRlXCI6IFwibmV3RGF0YS5oYXNDaGlsZHJlbihbJ25hbWUnLCAnY29vcmRpbmF0ZXMnXSlcIixcbiAgICAgIC8vICAgICAgICAgXCJuYW1lXCI6IHtcIi52YWxpZGF0ZVwiOiBcIm5ld0RhdGEuaXNTdHJpbmcoKSAmJiBuZXdEYXRhLnZhbCgpLmxlbmd0aCA8IDIwXCJ9LFxuICAgICAgLy8gICAgICAgICBcImNvb3JkaW5hdGVzXCI6IHtcbiAgICAgIC8vXHRcdFx0XCIudmFsaWRhdGVcIjogXCJuZXdEYXRhLnZhbCgpLmxlbmd0aCA8IDIwICYmIG5ld0RhdGEudmFsKCkubGVuZ3RoID4gMFwiXG4gICAgICAvLyAgICAgICAgIH0gXG4gICAgICAvLyAgICAgICB9XG4gICAgICAvLyAgICAgfVxuICAgICAgLy8gICB9LCIsImFwcC5jb250cm9sbGVyKCdFdmVudHNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIEV2ZW50RmFjdG9yeSkge1xuXG5cdCRzY29wZS5ldmVudHMgPSBbe1xuXHRcdG5hbWU6IFwiZm9vZGllXCIsXG5cdFx0dGltZTogMTIzNDQ1LFxuXHRcdGxvY2F0aW9uOiBcIk15IGhvdXNlXCJcblx0fSx7XG5cdFx0bmFtZTogXCJnYW1lc1wiLFxuXHRcdHRpbWU6IDM0NTU0Myxcblx0XHRsb2NhdGlvbjogXCJ5b3VyIGhvdXNlXCJcblx0fSx7XG5cdFx0bmFtZTogXCJkYW5jZSBvZmZcIixcblx0XHR0aW1lOiAyMzIzNCxcblx0XHRsb2NhdGlvbjogXCJ3aGl0ZSBob3VzZVwiXG5cdH1dO1xuXG5cdCRzY29wZS5kYXRhID0ge307XG5cblx0JHNjb3BlLmNyZWF0ZUV2ZW50ID0gZnVuY3Rpb24oKSB7XG5cdFx0JHN0YXRlLmdvKCd0YWIuY3JlYXRlTmV3RXZlbnQnKTtcblx0fVxuXG5cdCRzY29wZS5zdWJtaXRFdmVudCA9IGZ1bmN0aW9uKCkge1xuXHRcdEV2ZW50RmFjdG9yeS5hZGRFdmVudCgkc2NvcGUuZGF0YS5uYW1lLCAkc2NvcGUuZGF0YS50aW1lLCAkc2NvcGUuZGF0YS5sb2NhdGlvbiwgJHNjb3BlLmRhdGEubG9jYXRpb25OYW1lKTtcblx0XHRFdmVudEZhY3RvcnkuYWxsKCk7XG5cdH1cbiB9KVxuXG4vL25lZWRzIHRvIHRhbGsgdG8gdGhlIGJhY2siLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLmV2ZW50cycsIHtcbiAgICB1cmw6ICcvZXZlbnRzJyxcbiAgICB2aWV3czoge1xuICAgICAgJ2V2ZW50c1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZXZlbnRzL2V2ZW50cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0V2ZW50c0N0cmwnXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAkc2NvcGUuY29udGFjdHMgPSBbXCJwZXJzb24xXCIsIFwicGVyc29uMlwiLCBcInBlcnNvbjNcIl07XG4gICRzY29wZS5jaGF0cyA9IFtcImJhcnRcIiwgXCJ3aGlza2V5XCIsIFwibGxvb1wiXTtcbn0pXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgnbG9naW4nLCB7XG4gICAgdXJsOiAnL2xvZ2luJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnUmVnaXN0ZXJDdHJsJ1xuICB9KVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5jcmVhdGVOZXdSb29tJywge1xuICAgIHVybDogJy9jcmVhdGVOZXdSb29tJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3Jvb21zVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9yb29tcy9jcmVhdGVOZXdSb29tLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUm9vbXNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsImFwcC5jb250cm9sbGVyKCdSb29tc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIFJvb21zRmFjdG9yeSwgQ2hhdEZhY3RvcnksICRzdGF0ZSkge1xuXG4gICAgLy8gJGlvbmljTW9kYWwuZnJvbVRlbXBsYXRlVXJsKCdqcy9sb2dpbi9sb2dpbi5odG1sJywge1xuICAgIC8vICAgICBzY29wZTogJHNjb3BlLFxuICAgIC8vICAgICBhbmltYXRpb246ICdzbGlkZS1pbi11cCdcbiAgICAvLyB9KVxuICAgIC8vIC50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgIC8vICRzY29wZS5tb2RhbCA9IG1vZGFsO1xuICAgIC8vIH0pO1xuXG4gICAgJHNjb3BlLnJvb21zID0gUm9vbXNGYWN0b3J5LmFsbCgpO1xuXG4gICAgJHNjb3BlLmNyZWF0ZVJvb20gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygndGFiLmNyZWF0ZU5ld1Jvb20nKTtcbiAgICB9XG5cbiAgICAkc2NvcGUub3BlblJvb20gPSBmdW5jdGlvbiAocm9vbUlkKSB7XG4gICAgICBjb25zb2xlLmxvZygndGhpcyBpcyByb29taWQnLCByb29tSWQpXG4gICAgICAkc3RhdGUuZ28oJ3RhYi5jaGF0Jywge1xuICAgICAgICByb29tSWQ6IHJvb21JZFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmFkZENvbnRhY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vYWRkIHRvIGZpcmViYXNlIGFycmF5IGluIHJvb21zZmFjdG9yeVxuICAgIH1cblxuICAgICRzY29wZS5zYXZlTmV3Um9vbSA9IGZ1bmN0aW9uIChyb29tT2JqKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSByb29tb2JqJywgcm9vbU9iailcbiAgICAgICAgcmV0dXJuIFJvb21zRmFjdG9yeS5hZGQocm9vbU9iaikudGhlbihmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIGlkJywgaWQpXG4gICAgICAgIH0pXG5cbiAgICAgICAgXG4gICAgICAgIC8vYWRkIHRvIGZpcmViYXNlIGFycmF5IGluIHJvb21zZmFjdG9yeVxuICAgIH1cblxuICAgIC8vICRzY29wZS5zZW5kQ2hhdCA9IGZ1bmN0aW9uIChjaGF0KXtcbiAgICAvLyAgIGlmICgkcm9vdFNjb3BlLnVzZXIpIHtcbiAgICAvLyAgICAgLy8gY29uc29sZS5sb2coJ3RoaXMgaXMgdXNlcicsICRyb290U2NvcGUudXNlcilcbiAgICAvLyAgICAgJHNjb3BlLmNoYXRzLiRhZGQoe1xuICAgIC8vICAgICAgIHVzZXI6ICRyb290U2NvcGUudXNlcixcbiAgICAvLyAgICAgICBtZXNzYWdlOiBjaGF0Lm1lc3NhZ2VcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICBjaGF0Lm1lc3NhZ2UgPSBcIlwiO1xuICAgIC8vICAgfVxuICAgIC8vIH1cbiB9KVxuIiwiYXBwLmZhY3RvcnkoJ1Jvb21zRmFjdG9yeScsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5KSB7XG5cbiAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG4gIHZhciByb29tcyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnZ3JvdXBzJykpO1xuXG4gIHJldHVybiB7XG5cbiAgICBhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0sXG4gICBcbiAgICBnZXQ6IGZ1bmN0aW9uKHJvb21JZCkge1xuICAgICAgcmV0dXJuIHJvb21zLiRnZXRSZWNvcmQocm9vbUlkKTtcbiAgICB9LFxuXG4gICAgYWRkOiBmdW5jdGlvbihyb29tT2JqKSB7XG4gICAgICBjb25zb2xlLmxvZygndGhpcyBpcyByb29tb2JqIGluIGZhYycsIHJvb21PYmopXG4gICAgICByb29tcy4kYWRkKHJvb21PYmopXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSByZWYnLCByZWYpXG4gICAgICAgIHZhciBpZCA9IHJlZi5rZXkoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIGlkJywgaWQpXG4gICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2FkZGVkIHJlY29yZCB3aXRoIGlkJyArIGlkKTtcbiAgICAgICAgLy8gcmV0dXJuIHJvb21zLiRpbmRleEZvcihpZCk7XG4gICAgICAgIC8vc3RhdGUuZ28gdG8gY2hhdCBkZXRhaWwgd2l0aCBuZXcgaWRcbiAgICAgIH0pXG5cbiAgICB9XG4gIH07XG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIucm9vbXMnLCB7XG4gICAgdXJsOiAnL3Jvb21zJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3Jvb21zVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9yb29tcy9yb29tcy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1Jvb21zQ3RybCdcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gcmVzb2x2ZToge1xuICAgIC8vICAgICBcImN1cnJlbnRBdXRoXCI6IFtcIkF1dGhcIixcbiAgICAvLyAgICAgICAgIGZ1bmN0aW9uIChBdXRoKSB7XG4gICAgLy8gICAgICAgICAgICAgcmV0dXJuIEF1dGguJHdhaXRGb3JBdXRoKCk7XG4gICAgLy8gfV19XG4gIH0pXG59KTsiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignU2V0dGluZ3NDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBjdXJyZW50VXNlciwgJHN0YXRlKSB7XG5cbnZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuXG4gICRzY29wZS51c2VyID0gY3VycmVudFVzZXI7XG5cbiAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgXHRyZWYudW5hdXRoKCk7XG4gIFx0JHN0YXRlLmdvKCdsb2dpbicpXG4gIH1cblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCR1cmxSb3V0ZXJQcm92aWRlciwgJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIuc2V0dGluZ3MnLCB7XG4gICAgdXJsOiAnL3NldHRpbmdzLzp1aWQnLFxuICAgIHZpZXdzOiB7XG4gICAgICAnc2V0dGluZ3NWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3NldHRpbmdzL3VzZXJJbmZvLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnU2V0dGluZ3NDdHJsJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgY3VycmVudFVzZXI6IGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgJGZpcmViYXNlT2JqZWN0KSB7XG4gICAgICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vdXNlcnMvJyArICRzdGF0ZVBhcmFtcy51aWQpXG4gICAgICAgIHZhciB1c2VyID0gJGZpcmViYXNlT2JqZWN0KHJlZilcbiAgICAgICAgcmV0dXJuIHVzZXJcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KTsiLCJhcHAuY29udHJvbGxlcignUmVnaXN0ZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkZmlyZWJhc2VBdXRoLCBBdXRoRmFjdG9yeSwgJHN0YXRlLCAkcm9vdFNjb3BlLCAkaW9uaWNNb2RhbCkge1xuICAgIFxuICAgIC8vICRpb25pY01vZGFsLmZyb21UZW1wbGF0ZVVybCgnanMvbG9naW4vbG9naW4uaHRtbCcsIHtcbiAgICAvLyBzY29wZTogJHNjb3BlIH0pXG4gICAgLy8gLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgLy8gJHNjb3BlLm1vZGFsID0gbW9kYWw7XG4gICAgLy8gfSk7XG5cblxuICAgICRzY29wZS5zaWduVXAgPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICBBdXRoRmFjdG9yeS5zaWduVXAoY3JlZGVudGlhbHMpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICRyb290U2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3RhYi5yb29tcycsIHt1aWQ6IHVzZXIudWlkfSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgJHNjb3BlLnNpZ25JbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIEF1dGhGYWN0b3J5LnNpZ25JbihjcmVkZW50aWFscylcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgJHJvb3RTY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLnJvb21zJywge3VpZDogdXNlci51aWR9KVxuICAgICAgICB9KVxuICAgIH1cbn0pIiwiYXBwLmNvbnRyb2xsZXIoJ1VzZXJDdHJsJywgW1wiJHNjb3BlXCIsIFwiJGZpcmViYXNlXCIsIFwiJGZpcmViYXNlQXV0aFwiLCBmdW5jdGlvbigkc2NvcGUsICRmaXJlYmFzZSwgJGZpcmViYXNlQXV0aCkge1xuXHR2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcblx0XG59XSkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
