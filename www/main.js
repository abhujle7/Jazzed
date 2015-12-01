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
    var phoneNums = []
    users.once("value", function(allUsers) {
      allUsers.forEach(function(oneUser) {
        var phone = oneUser.child('phone').val().replace(/\D/, "");
        phoneNums.push(phone)
      })
    })
    return {
      signUp: function(credentials) {
        if (phoneNums.indexOf(credentials.phone.replace(/\D/, "")) === -1) {
          return auth.$createUser({email: credentials.email, password: credentials.password})
          .then(function(user) {
            if (!user) {
              return false
            }
            user.name = credentials.name;
            user.phone = credentials.phone;
            user.email = credentials.email;
            users.child(user.uid).set({
              name: user.name,
              phone: user.phone.replace(/\D/, ""),
              email: user.email
            })
            phoneNums.push(credentials.phone.replace(/\D/, ""))
            return user
          })
          .then(function(input) {
            if (!input) {
              return false
            } 
            var email = credentials.email;
            var password = credentials.password;
            return auth.$authWithPassword({
              email: email,
              password: password
            })
          })
          .catch(console.error)
        }
        else {
          return false
        }
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
app.factory('ChatFactory', function($firebase, RoomsFactory, $firebaseArray, $firebaseObject, AuthFactory) {

  var selectedRoomId;
  var chats;
  var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/')
  var user = AuthFactory.getCurrentUser().uid
  var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + user)
  var userObj = $firebaseObject(userRef)

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
        chats = $firebaseArray(ref.child('messages').child(selectedRoomId));
    },
    send: function (message) {
        console.log("sending message from (insert user here) & message is " + message);
        if (message) {
            console.log('this is the user', user)
            var chatMessage = {
                user: user,
                from: userObj.name,
                message: message,
                timestamp: Firebase.ServerValue.TIMESTAMP
            };
            console.log('this is chats pre', chats)
            console.log('this is chatmessage', chatMessage)
            //removed validation of .write and $other
            chats.$add(chatMessage).then(function (data) {
                console.log("message added and this is data returned", data);
            })
            .catch(function(error) {
              console.error("Error:", error);
            })
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

app.controller('ChatCtrl', function($scope, ChatFactory, $stateParams, RoomsFactory, AuthFactory, $firebaseObject) {

  var currUser = AuthFactory.getCurrentUser().uid
  var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser)
  var userObj = $firebaseObject(userRef)
  $scope.IM = {
    textMessage: ""
  };

  // $scope.roomName = currentRoom.child('name')
// console.log('this is state params id', $stateParams.id)
  ChatFactory.selectRoom($stateParams.id);

  var roomName = ChatFactory.getSelectedRoomName();
  
  if (roomName) {
      $scope.roomName = " - " + roomName;
      $scope.chats = ChatFactory.all();
  }

  $scope.sendMessage = function (msg) {
      console.log('this is userobj', userObj)
      console.log(msg);
      ChatFactory.send(msg);
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
    url: '/chat/:id',
    views: {
      'roomsView': {
        templateUrl: 'js/chat/chat.html',
        controller: 'ChatCtrl'
      }
    },
    resolve: {
      // currentRoom: function ($stateParams, $firebaseObj) {
      //   var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/groups/' + $stateParams.id)
      //   return $firebaseObj(ref)
      // }


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

    $scope.openRoom = function (id) {
      console.log('this is id in open', id)
      $state.go('tab.chat', {
        id: id
      });
    }

    $scope.addContact = function () {
        //add to firebase array in roomsfactory
    }

    $scope.saveNewRoom = function (roomObj) {
        console.log('this is the roomobj in save', roomObj)
        return RoomsFactory.add(roomObj).then(function(id) {
            console.log('this is the id in save', id)
            $scope.openRoom(id);
            // $state.go('tab.chat', {id: id})
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

app.factory('RoomsFactory', function($firebaseArray, $firebaseAuth, AuthFactory) {

  var roomsRef = new Firebase('https://boiling-fire-3161.firebaseio.com/groups/')
  var roomsArr = $firebaseArray(roomsRef);
  // var roomsArr = $firebaseArray(ref.child('groups'));
  // var roomsRef = ref.child('groups')
  var currUserObj = AuthFactory.getCurrentUser();
  var currUser = AuthFactory.getCurrentUser().uid
  var currUserRooms = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser + '/groups')
  var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser)

  return {

    all: function() {
      return roomsArr;
    },
   
    get: function(roomId) {
      return roomsArr.$getRecord(roomId);
    },

    add: function(roomObj) {
      return roomsArr.$add(roomObj)
      .then(function (ref) {
        var id = ref.key();
        currUserRooms.child(id).set({name: roomObj.name})
        //removed validation of user_id = user uid
        $firebaseArray(roomsRef.child(id).child('members')).$add({
          id: currUser
        }).then(function (data) {
          console.log('this the data', data)
        })
     
        return id;
      })
        //state.go to chat detail with new id

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
app.controller('RegisterCtrl', function($scope, $firebaseAuth, AuthFactory, $state, $rootScope, $ionicPopup) {
    
    // $ionicModal.fromTemplateUrl('js/login/login.html', {
    // scope: $scope })
    // .then(function (modal) {
    // $scope.modal = modal;
    // });


    $scope.signUp = function(credentials) {
        if (!AuthFactory.signUp(credentials)) {
            $scope.error = $ionicPopup.alert({
                title: 'Invalid credentials',
                template: 'That number or email is already registered! Please try again :)'
            })   
        }
        else {
            AuthFactory.signUp(credentials)
            .then(function(user) {
                $state.go('tab.rooms', {uid: user.uid})
            })    
        }
    }
    $scope.signIn = function(credentials) {
        if (AuthFactory.signIn(credentials).error) {
            $scope.error = $ionicPopup.alert({
                title: 'Invalid login',
                template: 'Oops, you might have spelled something wrong! Please try again :)'
            })   
        }
        else {
            AuthFactory.signIn(credentials)
            .then(function(user) {
                $state.go('tab.rooms', {uid: user.uid})
            })    
        }
    }
})
app.controller('UserCtrl', function($scope, AuthFactory) {
	var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + AuthFactory.getCurrentUser().uid)
})
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguZmFjdG9yeS5qcyIsImNoYXQuZmFjdG9yeS5qcyIsInRhYlN0YXRlLmpzIiwiYWNjb3VudC9hY2NvdW50LmNvbnRyb2xsZXIuanMiLCJjaGF0L2NoYXQuY29udHJvbGxlci5qcyIsImNoYXQvdGFiLmNoYXQuc3RhdGUuanMiLCJkYXNoL2Rhc2guY29udHJvbGxlci5qcyIsImV2ZW50cy9jcmVhdGVFdmVudC5zdGF0ZS5qcyIsImV2ZW50cy9ldmVudC5mYWN0b3J5LmpzIiwiZXZlbnRzL2V2ZW50cy5jb250cm9sbGVyLmpzIiwiZXZlbnRzL2V2ZW50cy5zdGF0ZS5qcyIsInJvb21zL2NyZWF0ZU5ld1Jvb20uc3RhdGUuanMiLCJyb29tcy9yb29tcy5jb250cm9sbGVyLmpzIiwicm9vbXMvcm9vbXMuZmFjdG9yeS5qcyIsInJvb21zL3Jvb21zLnN0YXRlLmpzIiwibG9naW4vbG9naW4uY29udHJvbGxlci5qcyIsImxvZ2luL2xvZ2luLnN0YXRlLmpzIiwic2V0dGluZ3Mvc2V0dGluZ3MuY29udHJvbGxlci5qcyIsInNldHRpbmdzL3NldHRpbmdzLnN0YXRlLmpzIiwiY29udHJvbGxlcnMvcmVnaXN0ZXIuY29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL3VzZXIuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8vIElvbmljIFN0YXJ0ZXIgQXBwXG5cbi8vIGFuZ3VsYXIubW9kdWxlIGlzIGEgZ2xvYmFsIHBsYWNlIGZvciBjcmVhdGluZywgcmVnaXN0ZXJpbmcgYW5kIHJldHJpZXZpbmcgQW5ndWxhciBtb2R1bGVzXG4vLyAnc3RhcnRlcicgaXMgdGhlIG5hbWUgb2YgdGhpcyBhbmd1bGFyIG1vZHVsZSBleGFtcGxlIChhbHNvIHNldCBpbiBhIDxib2R5PiBhdHRyaWJ1dGUgaW4gaW5kZXguaHRtbClcbi8vIHRoZSAybmQgcGFyYW1ldGVyIGlzIGFuIGFycmF5IG9mICdyZXF1aXJlcydcbi8vICdzdGFydGVyLnNlcnZpY2VzJyBpcyBmb3VuZCBpbiBzZXJ2aWNlcy5qc1xuLy8gJ3N0YXJ0ZXIuY29udHJvbGxlcnMnIGlzIGZvdW5kIGluIGNvbnRyb2xsZXJzLmpzXG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXInLCBbJ2lvbmljJywgXCJmaXJlYmFzZVwiLCBcInVpLnJvdXRlclwiXSlcblxuIFxuIFxuYXBwLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxuICAgIGlmICh3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcblxuICAgIH1cbiAgICBpZiAod2luZG93LlN0YXR1c0Jhcikge1xuICAgICAgLy8gb3JnLmFwYWNoZS5jb3Jkb3ZhLnN0YXR1c2JhciByZXF1aXJlZFxuICAgICAgU3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuICAgIH1cbiAgfSk7XG59KVxuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAvLyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvbG9naW4nKTtcbn0pO1xuIiwiYXBwLmZhY3RvcnkoXCJBdXRoRmFjdG9yeVwiLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5KSB7XG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG4gICAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKHJlZik7XG4gICAgdmFyIHVzZXJzID0gcmVmLmNoaWxkKCd1c2VycycpXG4gICAgdmFyIHBob25lTnVtcyA9IFtdXG4gICAgdXNlcnMub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKGFsbFVzZXJzKSB7XG4gICAgICBhbGxVc2Vycy5mb3JFYWNoKGZ1bmN0aW9uKG9uZVVzZXIpIHtcbiAgICAgICAgdmFyIHBob25lID0gb25lVXNlci5jaGlsZCgncGhvbmUnKS52YWwoKS5yZXBsYWNlKC9cXEQvLCBcIlwiKTtcbiAgICAgICAgcGhvbmVOdW1zLnB1c2gocGhvbmUpXG4gICAgICB9KVxuICAgIH0pXG4gICAgcmV0dXJuIHtcbiAgICAgIHNpZ25VcDogZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgaWYgKHBob25lTnVtcy5pbmRleE9mKGNyZWRlbnRpYWxzLnBob25lLnJlcGxhY2UoL1xcRC8sIFwiXCIpKSA9PT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gYXV0aC4kY3JlYXRlVXNlcih7ZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsLCBwYXNzd29yZDogY3JlZGVudGlhbHMucGFzc3dvcmR9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZXIubmFtZSA9IGNyZWRlbnRpYWxzLm5hbWU7XG4gICAgICAgICAgICB1c2VyLnBob25lID0gY3JlZGVudGlhbHMucGhvbmU7XG4gICAgICAgICAgICB1c2VyLmVtYWlsID0gY3JlZGVudGlhbHMuZW1haWw7XG4gICAgICAgICAgICB1c2Vycy5jaGlsZCh1c2VyLnVpZCkuc2V0KHtcbiAgICAgICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxuICAgICAgICAgICAgICBwaG9uZTogdXNlci5waG9uZS5yZXBsYWNlKC9cXEQvLCBcIlwiKSxcbiAgICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBwaG9uZU51bXMucHVzaChjcmVkZW50aWFscy5waG9uZS5yZXBsYWNlKC9cXEQvLCBcIlwiKSlcbiAgICAgICAgICAgIHJldHVybiB1c2VyXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICAgICAgaWYgKCFpbnB1dCkge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB2YXIgZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgICAgIHZhciBwYXNzd29yZCA9IGNyZWRlbnRpYWxzLnBhc3N3b3JkO1xuICAgICAgICAgICAgcmV0dXJuIGF1dGguJGF1dGhXaXRoUGFzc3dvcmQoe1xuICAgICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChjb25zb2xlLmVycm9yKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0Q3VycmVudFVzZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcmVmLmdldEF1dGgoKVxuICAgICAgfSxcbiAgICAgIHNpZ25JbjogZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgdmFyIGVtYWlsID0gY3JlZGVudGlhbHMuZW1haWw7XG4gICAgICAgIHZhciBwYXNzd29yZCA9IGNyZWRlbnRpYWxzLnBhc3N3b3JkO1xuICAgICAgICByZXR1cm4gYXV0aC4kYXV0aFdpdGhQYXNzd29yZCh7XG4gICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goY29uc29sZS5lcnJvcilcbiAgICAgIH1cbiAgICB9XG4gIH0pOyIsImFwcC5mYWN0b3J5KCdDaGF0RmFjdG9yeScsIGZ1bmN0aW9uKCRmaXJlYmFzZSwgUm9vbXNGYWN0b3J5LCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBBdXRoRmFjdG9yeSkge1xuXG4gIHZhciBzZWxlY3RlZFJvb21JZDtcbiAgdmFyIGNoYXRzO1xuICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tLycpXG4gIHZhciB1c2VyID0gQXV0aEZhY3RvcnkuZ2V0Q3VycmVudFVzZXIoKS51aWRcbiAgdmFyIHVzZXJSZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vdXNlcnMvJyArIHVzZXIpXG4gIHZhciB1c2VyT2JqID0gJGZpcmViYXNlT2JqZWN0KHVzZXJSZWYpXG5cbiAgcmV0dXJuIHtcbiAgICBhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNoYXRzO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihjaGF0KSB7XG4gICAgICBjaGF0cy4kcmVtb3ZlKGNoYXQpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgIHJlZi5rZXkoKSA9PT0gY2hhdC4kaWQ7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24oY2hhdElkKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjaGF0c1tpXS5pZCA9PT0gcGFyc2VJbnQoY2hhdElkKSkge1xuICAgICAgICAgIHJldHVybiBjaGF0c1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBnZXRTZWxlY3RlZFJvb21OYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRSb29tO1xuICAgICAgaWYgKHNlbGVjdGVkUm9vbUlkICYmIHNlbGVjdGVkUm9vbUlkICE9IG51bGwpIHtcbiAgICAgICAgICBzZWxlY3RlZFJvb20gPSBSb29tc0ZhY3RvcnkuZ2V0KHNlbGVjdGVkUm9vbUlkKTtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWRSb29tKVxuICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWRSb29tLm5hbWU7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgc2VsZWN0Um9vbTogZnVuY3Rpb24gKHJvb21JZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbGVjdGluZyB0aGUgcm9vbSB3aXRoIGlkOiBcIiArIHJvb21JZCk7XG4gICAgICAgIHNlbGVjdGVkUm9vbUlkID0gcm9vbUlkO1xuICAgICAgICBjaGF0cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnbWVzc2FnZXMnKS5jaGlsZChzZWxlY3RlZFJvb21JZCkpO1xuICAgIH0sXG4gICAgc2VuZDogZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kaW5nIG1lc3NhZ2UgZnJvbSAoaW5zZXJ0IHVzZXIgaGVyZSkgJiBtZXNzYWdlIGlzIFwiICsgbWVzc2FnZSk7XG4gICAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgdXNlcicsIHVzZXIpXG4gICAgICAgICAgICB2YXIgY2hhdE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgICAgICAgICBmcm9tOiB1c2VyT2JqLm5hbWUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IEZpcmViYXNlLlNlcnZlclZhbHVlLlRJTUVTVEFNUFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIGNoYXRzIHByZScsIGNoYXRzKVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgY2hhdG1lc3NhZ2UnLCBjaGF0TWVzc2FnZSlcbiAgICAgICAgICAgIC8vcmVtb3ZlZCB2YWxpZGF0aW9uIG9mIC53cml0ZSBhbmQgJG90aGVyXG4gICAgICAgICAgICBjaGF0cy4kYWRkKGNoYXRNZXNzYWdlKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJtZXNzYWdlIGFkZGVkIGFuZCB0aGlzIGlzIGRhdGEgcmV0dXJuZWRcIiwgZGF0YSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvcjpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbiAgfTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXJcblx0XHQuc3RhdGUoJ3RhYicsIHtcblx0XHR1cmw6ICcvdGFiJyxcblx0XHRhYnN0cmFjdDogdHJ1ZSxcblx0XHRjYWNoZTogZmFsc2UsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy90YWJzLmh0bWwnXG5cdFx0fSlcbn0pIiwiLy8gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuY29udHJvbGxlcnMnLCBbXSlcblxuYXBwLmNvbnRyb2xsZXIoJ0FjY291bnRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUpIHtcblxuXG52YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcblxuICAkc2NvcGUuc2V0dGluZ3MgPSB7XG4gICAgZW5hYmxlRnJpZW5kczogdHJ1ZVxuICB9O1xuICBcbiAgJHNjb3BlLnBsYWNlcyA9IGZ1bmN0aW9uKCkge1xuICBcdHllbHAuc2VhcmNoKHsgdGVybTogJ21leGljYW4nLCBsb2NhdGlvbjogJ0Jyb29rbHluJyB9KVxuLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgY29uc29sZS5sb2coZGF0YSk7XG59KVxuICB9XG5cbn0pO1xuIiwiYXBwLmNvbnRyb2xsZXIoJ0NoYXRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBDaGF0RmFjdG9yeSwgJHN0YXRlUGFyYW1zLCBSb29tc0ZhY3RvcnksIEF1dGhGYWN0b3J5LCAkZmlyZWJhc2VPYmplY3QpIHtcblxuICB2YXIgY3VyclVzZXIgPSBBdXRoRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpLnVpZFxuICB2YXIgdXNlclJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbS91c2Vycy8nICsgY3VyclVzZXIpXG4gIHZhciB1c2VyT2JqID0gJGZpcmViYXNlT2JqZWN0KHVzZXJSZWYpXG4gICRzY29wZS5JTSA9IHtcbiAgICB0ZXh0TWVzc2FnZTogXCJcIlxuICB9O1xuXG4gIC8vICRzY29wZS5yb29tTmFtZSA9IGN1cnJlbnRSb29tLmNoaWxkKCduYW1lJylcbi8vIGNvbnNvbGUubG9nKCd0aGlzIGlzIHN0YXRlIHBhcmFtcyBpZCcsICRzdGF0ZVBhcmFtcy5pZClcbiAgQ2hhdEZhY3Rvcnkuc2VsZWN0Um9vbSgkc3RhdGVQYXJhbXMuaWQpO1xuXG4gIHZhciByb29tTmFtZSA9IENoYXRGYWN0b3J5LmdldFNlbGVjdGVkUm9vbU5hbWUoKTtcbiAgXG4gIGlmIChyb29tTmFtZSkge1xuICAgICAgJHNjb3BlLnJvb21OYW1lID0gXCIgLSBcIiArIHJvb21OYW1lO1xuICAgICAgJHNjb3BlLmNoYXRzID0gQ2hhdEZhY3RvcnkuYWxsKCk7XG4gIH1cblxuICAkc2NvcGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB1c2Vyb2JqJywgdXNlck9iailcbiAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgICBDaGF0RmFjdG9yeS5zZW5kKG1zZyk7XG4gICAgICAkc2NvcGUuSU0udGV4dE1lc3NhZ2UgPSBcIlwiO1xuICB9XG5cbiAgJHNjb3BlLnJlbW92ZSA9IGZ1bmN0aW9uIChjaGF0KSB7XG4gICAgICBDaGF0RmFjdG9yeS5yZW1vdmUoY2hhdCk7XG4gIH1cblxuICAgIC8vICRzY29wZS5zZW5kQ2hhdCA9IGZ1bmN0aW9uIChjaGF0KXtcbiAgICAvLyAgIGlmICgkcm9vdFNjb3BlLnVzZXIpIHtcbiAgICAvLyAgICAgLy8gY29uc29sZS5sb2coJ3RoaXMgaXMgdXNlcicsICRyb290U2NvcGUudXNlcilcbiAgICAvLyAgICAgJHNjb3BlLmNoYXRzLiRhZGQoe1xuICAgIC8vICAgICAgIHVzZXI6ICRyb290U2NvcGUudXNlcixcbiAgICAvLyAgICAgICBtZXNzYWdlOiBjaGF0Lm1lc3NhZ2VcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICBjaGF0Lm1lc3NhZ2UgPSBcIlwiO1xuICAgIC8vICAgfVxuICAgIC8vIH1cbiB9KVxuXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIuY2hhdCcsIHtcbiAgICB1cmw6ICcvY2hhdC86aWQnLFxuICAgIHZpZXdzOiB7XG4gICAgICAncm9vbXNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NoYXQvY2hhdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NoYXRDdHJsJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgLy8gY3VycmVudFJvb206IGZ1bmN0aW9uICgkc3RhdGVQYXJhbXMsICRmaXJlYmFzZU9iaikge1xuICAgICAgLy8gICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL2dyb3Vwcy8nICsgJHN0YXRlUGFyYW1zLmlkKVxuICAgICAgLy8gICByZXR1cm4gJGZpcmViYXNlT2JqKHJlZilcbiAgICAgIC8vIH1cblxuXG4gICAgfVxuICB9KVxufSk7IiwiLy8gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuY29udHJvbGxlcnMnLCBbXSlcblxuYXBwLmNvbnRyb2xsZXIoJ0Rhc2hDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUpIHtcblx0JHN0YXRlLmdvKCd0YWIuY2hhdHMnKVxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyXG5cdC5zdGF0ZSgndGFiLmNyZWF0ZU5ld0V2ZW50Jywge1xuXHRcdHVybDogJy9jcmVhdGVOZXdFdmVudCcsXG5cdFx0dmlld3M6IHtcblx0XHRcdCdldmVudHNWaWV3Jzoge1xuXHRcdFx0XHR0ZW1wbGF0ZVVybDogJ2pzL2V2ZW50cy9jcmVhdGVOZXdFdmVudC5odG1sJyxcblx0XHRcdFx0Y29udHJvbGxlcjogJ0V2ZW50c0N0cmwnXG5cdFx0XHR9XG5cdFx0fVxuXHR9KVxufSkiLCJhcHAuZmFjdG9yeSgnRXZlbnRGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlLCAkZmlyZWJhc2VBcnJheSwgQXV0aEZhY3RvcnkpIHtcblx0XG5cdHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKTtcblx0dmFyIGV2ZW50cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnZXZlbnRzJykpO1xuXHR2YXIgZml4ZWRFdmVudHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoJ2V2ZW50cycpLmNoaWxkKCdmaXhlZCcpKTtcblx0dmFyIGxvY2F0aW9uQ2hpbGQgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoJ2V2ZW50cycpLmNoaWxkKCdmaXhlZCcpLmNoaWxkKCdsb2NhdGlvbicpKTtcblx0dmFyIGN1cnJlbnRVc2VyID0gQXV0aEZhY3RvcnkuZ2V0Q3VycmVudFVzZXIoKTtcblxuXHRyZXR1cm4ge1xuXHRcdGFsbDogZnVuY3Rpb24oKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhldmVudHMpO1xuXHRcdH0sXG5cdFx0YWRkRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgZXZlbnRUaW1lLCBldmVudExvY2F0aW9uLCBsb2NhdGlvbk5hbWUpIHtcblx0XHRcdGZpeGVkRXZlbnRzLiRhZGQoe1xuXHRcdFx0XHRuYW1lOiBldmVudE5hbWUsXG5cdFx0XHRcdHRpbWU6IGV2ZW50VGltZSxcblx0XHRcdFx0bG9jYXRpb246IHtcblx0XHRcdFx0XHRuYW1lOiBsb2NhdGlvbk5hbWUsXG5cdFx0XHRcdFx0Y29vcmRpbmF0ZXM6IGV2ZW50TG9jYXRpb25cblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cbn0pXG5cbi8qXG4tLS0tLVRvLWRvIGxpc3QtLS0tXG5Td2l0Y2ggbmFtZSBvciBldmVudC5faWRcblxuKi9cblxuXG4gLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAvLyBcImV2ZW50c1wiOiB7XG4gICAgICAvLyAgIFwiZml4ZWRcIjoge1xuICAgICAgLy8gXHRcIi53cml0ZVwiOiBcImF1dGggIT09IG51bGxcIixcbiAgICAgIC8vICAgICBcIiRldmVudF9pZFwiOiB7XG4gICAgICAvLyAgICAgICBcIi52YWxpZGF0ZVwiOiBcIihuZXdEYXRhLmNoaWxkKCduYW1lJykuZXhpc3RzKCkpICYmIChuZXdEYXRhLmV4aXN0cygpICYmIG5ld0RhdGEuaGFzQ2hpbGRyZW4oWyd0aW1lJywgJ2xvY2F0aW9uJ10pKVwiLFxuICAgICAgLy8gICAgICAgXCJuYW1lXCI6IHtcbiAgICAgIC8vICAgICAgICAgXCIudmFsaWRhdGVcIjogXCJuZXdEYXRhLnZhbCgpLmxlbmd0aCA8IDIwICYmIG5ld0RhdGEudmFsKCkubGVuZ3RoID4gMFwiXG4gICAgICAvLyAgICAgICB9LFxuICAgICAgLy8gICAgICAgXCJ0aW1lXCI6IHtcbiAgICAgIC8vICAgICAgICAgXCIudmFsaWRhdGVcIjogXCJuZXdEYXRhLnZhbCgpIDw9IG5vd1wiXG4gICAgICAvLyAgICAgICB9LFxuICAgICAgLy8gICAgICAgXCJsb2NhdGlvblwiOiB7XG4gICAgICAvLyAgICAgICAgIFwiLnZhbGlkYXRlXCI6IFwibmV3RGF0YS5oYXNDaGlsZHJlbihbJ25hbWUnLCAnY29vcmRpbmF0ZXMnXSlcIixcbiAgICAgIC8vICAgICAgICAgXCJuYW1lXCI6IHtcIi52YWxpZGF0ZVwiOiBcIm5ld0RhdGEuaXNTdHJpbmcoKSAmJiBuZXdEYXRhLnZhbCgpLmxlbmd0aCA8IDIwXCJ9LFxuICAgICAgLy8gICAgICAgICBcImNvb3JkaW5hdGVzXCI6IHtcbiAgICAgIC8vXHRcdFx0XCIudmFsaWRhdGVcIjogXCJuZXdEYXRhLnZhbCgpLmxlbmd0aCA8IDIwICYmIG5ld0RhdGEudmFsKCkubGVuZ3RoID4gMFwiXG4gICAgICAvLyAgICAgICAgIH0gXG4gICAgICAvLyAgICAgICB9XG4gICAgICAvLyAgICAgfVxuICAgICAgLy8gICB9LCIsImFwcC5jb250cm9sbGVyKCdFdmVudHNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUsIEV2ZW50RmFjdG9yeSkge1xuXG5cdCRzY29wZS5ldmVudHMgPSBbe1xuXHRcdG5hbWU6IFwiZm9vZGllXCIsXG5cdFx0dGltZTogMTIzNDQ1LFxuXHRcdGxvY2F0aW9uOiBcIk15IGhvdXNlXCJcblx0fSx7XG5cdFx0bmFtZTogXCJnYW1lc1wiLFxuXHRcdHRpbWU6IDM0NTU0Myxcblx0XHRsb2NhdGlvbjogXCJ5b3VyIGhvdXNlXCJcblx0fSx7XG5cdFx0bmFtZTogXCJkYW5jZSBvZmZcIixcblx0XHR0aW1lOiAyMzIzNCxcblx0XHRsb2NhdGlvbjogXCJ3aGl0ZSBob3VzZVwiXG5cdH1dO1xuXG5cdCRzY29wZS5kYXRhID0ge307XG5cblx0JHNjb3BlLmNyZWF0ZUV2ZW50ID0gZnVuY3Rpb24oKSB7XG5cdFx0JHN0YXRlLmdvKCd0YWIuY3JlYXRlTmV3RXZlbnQnKTtcblx0fVxuXG5cdCRzY29wZS5zdWJtaXRFdmVudCA9IGZ1bmN0aW9uKCkge1xuXHRcdEV2ZW50RmFjdG9yeS5hZGRFdmVudCgkc2NvcGUuZGF0YS5uYW1lLCAkc2NvcGUuZGF0YS50aW1lLCAkc2NvcGUuZGF0YS5sb2NhdGlvbiwgJHNjb3BlLmRhdGEubG9jYXRpb25OYW1lKTtcblx0XHRFdmVudEZhY3RvcnkuYWxsKCk7XG5cdH1cbiB9KVxuXG4vL25lZWRzIHRvIHRhbGsgdG8gdGhlIGJhY2siLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLmV2ZW50cycsIHtcbiAgICB1cmw6ICcvZXZlbnRzJyxcbiAgICB2aWV3czoge1xuICAgICAgJ2V2ZW50c1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZXZlbnRzL2V2ZW50cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0V2ZW50c0N0cmwnXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5jcmVhdGVOZXdSb29tJywge1xuICAgIHVybDogJy9jcmVhdGVOZXdSb29tJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3Jvb21zVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9yb29tcy9jcmVhdGVOZXdSb29tLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUm9vbXNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsImFwcC5jb250cm9sbGVyKCdSb29tc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIFJvb21zRmFjdG9yeSwgQ2hhdEZhY3RvcnksICRzdGF0ZSkge1xuXG4gICAgLy8gJGlvbmljTW9kYWwuZnJvbVRlbXBsYXRlVXJsKCdqcy9sb2dpbi9sb2dpbi5odG1sJywge1xuICAgIC8vICAgICBzY29wZTogJHNjb3BlLFxuICAgIC8vICAgICBhbmltYXRpb246ICdzbGlkZS1pbi11cCdcbiAgICAvLyB9KVxuICAgIC8vIC50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgIC8vICRzY29wZS5tb2RhbCA9IG1vZGFsO1xuICAgIC8vIH0pO1xuXG4gICAgJHNjb3BlLnJvb21zID0gUm9vbXNGYWN0b3J5LmFsbCgpO1xuXG4gICAgJHNjb3BlLmNyZWF0ZVJvb20gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygndGFiLmNyZWF0ZU5ld1Jvb20nKTtcbiAgICB9XG5cbiAgICAkc2NvcGUub3BlblJvb20gPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIGlkIGluIG9wZW4nLCBpZClcbiAgICAgICRzdGF0ZS5nbygndGFiLmNoYXQnLCB7XG4gICAgICAgIGlkOiBpZFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmFkZENvbnRhY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vYWRkIHRvIGZpcmViYXNlIGFycmF5IGluIHJvb21zZmFjdG9yeVxuICAgIH1cblxuICAgICRzY29wZS5zYXZlTmV3Um9vbSA9IGZ1bmN0aW9uIChyb29tT2JqKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSByb29tb2JqIGluIHNhdmUnLCByb29tT2JqKVxuICAgICAgICByZXR1cm4gUm9vbXNGYWN0b3J5LmFkZChyb29tT2JqKS50aGVuKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgaWQgaW4gc2F2ZScsIGlkKVxuICAgICAgICAgICAgJHNjb3BlLm9wZW5Sb29tKGlkKTtcbiAgICAgICAgICAgIC8vICRzdGF0ZS5nbygndGFiLmNoYXQnLCB7aWQ6IGlkfSlcbiAgICAgICAgfSlcblxuICAgICAgICBcbiAgICAgICAgLy9hZGQgdG8gZmlyZWJhc2UgYXJyYXkgaW4gcm9vbXNmYWN0b3J5XG4gICAgfVxuXG4gICAgLy8gJHNjb3BlLnNlbmRDaGF0ID0gZnVuY3Rpb24gKGNoYXQpe1xuICAgIC8vICAgaWYgKCRyb290U2NvcGUudXNlcikge1xuICAgIC8vICAgICAvLyBjb25zb2xlLmxvZygndGhpcyBpcyB1c2VyJywgJHJvb3RTY29wZS51c2VyKVxuICAgIC8vICAgICAkc2NvcGUuY2hhdHMuJGFkZCh7XG4gICAgLy8gICAgICAgdXNlcjogJHJvb3RTY29wZS51c2VyLFxuICAgIC8vICAgICAgIG1lc3NhZ2U6IGNoYXQubWVzc2FnZVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIGNoYXQubWVzc2FnZSA9IFwiXCI7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuIH0pXG4iLCJhcHAuZmFjdG9yeSgnUm9vbXNGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZUF1dGgsIEF1dGhGYWN0b3J5KSB7XG5cbiAgdmFyIHJvb21zUmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL2dyb3Vwcy8nKVxuICB2YXIgcm9vbXNBcnIgPSAkZmlyZWJhc2VBcnJheShyb29tc1JlZik7XG4gIC8vIHZhciByb29tc0FyciA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnZ3JvdXBzJykpO1xuICAvLyB2YXIgcm9vbXNSZWYgPSByZWYuY2hpbGQoJ2dyb3VwcycpXG4gIHZhciBjdXJyVXNlck9iaiA9IEF1dGhGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCk7XG4gIHZhciBjdXJyVXNlciA9IEF1dGhGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCkudWlkXG4gIHZhciBjdXJyVXNlclJvb21zID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL3VzZXJzLycgKyBjdXJyVXNlciArICcvZ3JvdXBzJylcbiAgdmFyIHVzZXJSZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vdXNlcnMvJyArIGN1cnJVc2VyKVxuXG4gIHJldHVybiB7XG5cbiAgICBhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJvb21zQXJyO1xuICAgIH0sXG4gICBcbiAgICBnZXQ6IGZ1bmN0aW9uKHJvb21JZCkge1xuICAgICAgcmV0dXJuIHJvb21zQXJyLiRnZXRSZWNvcmQocm9vbUlkKTtcbiAgICB9LFxuXG4gICAgYWRkOiBmdW5jdGlvbihyb29tT2JqKSB7XG4gICAgICByZXR1cm4gcm9vbXNBcnIuJGFkZChyb29tT2JqKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICB2YXIgaWQgPSByZWYua2V5KCk7XG4gICAgICAgIGN1cnJVc2VyUm9vbXMuY2hpbGQoaWQpLnNldCh7bmFtZTogcm9vbU9iai5uYW1lfSlcbiAgICAgICAgLy9yZW1vdmVkIHZhbGlkYXRpb24gb2YgdXNlcl9pZCA9IHVzZXIgdWlkXG4gICAgICAgICRmaXJlYmFzZUFycmF5KHJvb21zUmVmLmNoaWxkKGlkKS5jaGlsZCgnbWVtYmVycycpKS4kYWRkKHtcbiAgICAgICAgICBpZDogY3VyclVzZXJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIHRoZSBkYXRhJywgZGF0YSlcbiAgICAgICAgfSlcbiAgICAgXG4gICAgICAgIHJldHVybiBpZDtcbiAgICAgIH0pXG4gICAgICAgIC8vc3RhdGUuZ28gdG8gY2hhdCBkZXRhaWwgd2l0aCBuZXcgaWRcblxuICAgIH1cbiAgfTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5yb29tcycsIHtcbiAgICB1cmw6ICcvcm9vbXMnLFxuICAgIHZpZXdzOiB7XG4gICAgICAncm9vbXNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Jvb21zL3Jvb21zLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUm9vbXNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgICAvLyByZXNvbHZlOiB7XG4gICAgLy8gICAgIFwiY3VycmVudEF1dGhcIjogW1wiQXV0aFwiLFxuICAgIC8vICAgICAgICAgZnVuY3Rpb24gKEF1dGgpIHtcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gQXV0aC4kd2FpdEZvckF1dGgoKTtcbiAgICAvLyB9XX1cbiAgfSlcbn0pOyIsImFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgJHNjb3BlLmNvbnRhY3RzID0gW1wicGVyc29uMVwiLCBcInBlcnNvbjJcIiwgXCJwZXJzb24zXCJdO1xuICAkc2NvcGUuY2hhdHMgPSBbXCJiYXJ0XCIsIFwid2hpc2tleVwiLCBcImxsb29cIl07XG59KVxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ2xvZ2luJywge1xuICAgIHVybDogJy9sb2dpbicsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9sb2dpbi5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ1JlZ2lzdGVyQ3RybCdcbiAgfSlcbn0pOyIsIi8vIGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyLmNvbnRyb2xsZXJzJywgW10pXG5cbmFwcC5jb250cm9sbGVyKCdTZXR0aW5nc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGN1cnJlbnRVc2VyLCAkc3RhdGUpIHtcblxudmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG5cbiAgJHNjb3BlLnVzZXIgPSBjdXJyZW50VXNlcjtcblxuICAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICBcdHJlZi51bmF1dGgoKTtcbiAgXHQkc3RhdGUuZ28oJ2xvZ2luJylcbiAgfVxuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHVybFJvdXRlclByb3ZpZGVyLCAkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5zZXR0aW5ncycsIHtcbiAgICB1cmw6ICcvc2V0dGluZ3MvOnVpZCcsXG4gICAgdmlld3M6IHtcbiAgICAgICdzZXR0aW5nc1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc2V0dGluZ3MvdXNlckluZm8uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTZXR0aW5nc0N0cmwnXG4gICAgICB9XG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBjdXJyZW50VXNlcjogZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VPYmplY3QpIHtcbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbS91c2Vycy8nICsgJHN0YXRlUGFyYW1zLnVpZClcbiAgICAgICAgdmFyIHVzZXIgPSAkZmlyZWJhc2VPYmplY3QocmVmKVxuICAgICAgICByZXR1cm4gdXNlclxuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsImFwcC5jb250cm9sbGVyKCdSZWdpc3RlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRmaXJlYmFzZUF1dGgsIEF1dGhGYWN0b3J5LCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY1BvcHVwKSB7XG4gICAgXG4gICAgLy8gJGlvbmljTW9kYWwuZnJvbVRlbXBsYXRlVXJsKCdqcy9sb2dpbi9sb2dpbi5odG1sJywge1xuICAgIC8vIHNjb3BlOiAkc2NvcGUgfSlcbiAgICAvLyAudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAvLyAkc2NvcGUubW9kYWwgPSBtb2RhbDtcbiAgICAvLyB9KTtcblxuXG4gICAgJHNjb3BlLnNpZ25VcCA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmICghQXV0aEZhY3Rvcnkuc2lnblVwKGNyZWRlbnRpYWxzKSkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnSW52YWxpZCBjcmVkZW50aWFscycsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6ICdUaGF0IG51bWJlciBvciBlbWFpbCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQhIFBsZWFzZSB0cnkgYWdhaW4gOiknXG4gICAgICAgICAgICB9KSAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgQXV0aEZhY3Rvcnkuc2lnblVwKGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLnJvb21zJywge3VpZDogdXNlci51aWR9KVxuICAgICAgICAgICAgfSkgICAgXG4gICAgICAgIH1cbiAgICB9XG4gICAgJHNjb3BlLnNpZ25JbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmIChBdXRoRmFjdG9yeS5zaWduSW4oY3JlZGVudGlhbHMpLmVycm9yKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIGxvZ2luJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJ09vcHMsIHlvdSBtaWdodCBoYXZlIHNwZWxsZWQgc29tZXRoaW5nIHdyb25nISBQbGVhc2UgdHJ5IGFnYWluIDopJ1xuICAgICAgICAgICAgfSkgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIEF1dGhGYWN0b3J5LnNpZ25JbihjcmVkZW50aWFscylcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3RhYi5yb29tcycsIHt1aWQ6IHVzZXIudWlkfSlcbiAgICAgICAgICAgIH0pICAgIFxuICAgICAgICB9XG4gICAgfVxufSkiLCJhcHAuY29udHJvbGxlcignVXNlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIEF1dGhGYWN0b3J5KSB7XG5cdHZhciB1c2VyUmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL3VzZXJzLycgKyBBdXRoRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpLnVpZClcbn0pIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
