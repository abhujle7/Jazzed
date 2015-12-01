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

// angular.module('starter.controllers', [])

app.controller('DashCtrl', function($scope, $state) {
	$state.go('tab.chats')
})
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
app.controller('EventsCtrl', function($scope, RoomsFactory, ChatFactory, $state) {


 })
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
        AuthFactory.signIn(credentials)
        .then(function(user) {
            $state.go('tab.rooms', {uid: user.uid})
        })
    }
})
app.controller('UserCtrl', ["$scope", "$firebase", "$firebaseAuth", function($scope, $firebase, $firebaseAuth) {
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')
	
}])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguZmFjdG9yeS5qcyIsImNoYXQuZmFjdG9yeS5qcyIsInRhYlN0YXRlLmpzIiwiYWNjb3VudC9hY2NvdW50LmNvbnRyb2xsZXIuanMiLCJkYXNoL2Rhc2guY29udHJvbGxlci5qcyIsImNoYXQvY2hhdC5jb250cm9sbGVyLmpzIiwiY2hhdC90YWIuY2hhdC5zdGF0ZS5qcyIsImV2ZW50cy9ldmVudHMuY29udHJvbGxlci5qcyIsImV2ZW50cy9ldmVudHMuc3RhdGUuanMiLCJsb2dpbi9sb2dpbi5jb250cm9sbGVyLmpzIiwibG9naW4vbG9naW4uc3RhdGUuanMiLCJyb29tcy9jcmVhdGVOZXdSb29tLnN0YXRlLmpzIiwicm9vbXMvcm9vbXMuY29udHJvbGxlci5qcyIsInJvb21zL3Jvb21zLmZhY3RvcnkuanMiLCJyb29tcy9yb29tcy5zdGF0ZS5qcyIsInNldHRpbmdzL3NldHRpbmdzLmNvbnRyb2xsZXIuanMiLCJzZXR0aW5ncy9zZXR0aW5ncy5zdGF0ZS5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyLmNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy91c2VyLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8vIElvbmljIFN0YXJ0ZXIgQXBwXG5cbi8vIGFuZ3VsYXIubW9kdWxlIGlzIGEgZ2xvYmFsIHBsYWNlIGZvciBjcmVhdGluZywgcmVnaXN0ZXJpbmcgYW5kIHJldHJpZXZpbmcgQW5ndWxhciBtb2R1bGVzXG4vLyAnc3RhcnRlcicgaXMgdGhlIG5hbWUgb2YgdGhpcyBhbmd1bGFyIG1vZHVsZSBleGFtcGxlIChhbHNvIHNldCBpbiBhIDxib2R5PiBhdHRyaWJ1dGUgaW4gaW5kZXguaHRtbClcbi8vIHRoZSAybmQgcGFyYW1ldGVyIGlzIGFuIGFycmF5IG9mICdyZXF1aXJlcydcbi8vICdzdGFydGVyLnNlcnZpY2VzJyBpcyBmb3VuZCBpbiBzZXJ2aWNlcy5qc1xuLy8gJ3N0YXJ0ZXIuY29udHJvbGxlcnMnIGlzIGZvdW5kIGluIGNvbnRyb2xsZXJzLmpzXG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXInLCBbJ2lvbmljJywgXCJmaXJlYmFzZVwiLCBcInVpLnJvdXRlclwiXSlcblxuIFxuIFxuYXBwLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxuICAgIGlmICh3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcblxuICAgIH1cbiAgICBpZiAod2luZG93LlN0YXR1c0Jhcikge1xuICAgICAgLy8gb3JnLmFwYWNoZS5jb3Jkb3ZhLnN0YXR1c2JhciByZXF1aXJlZFxuICAgICAgU3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuICAgIH1cbiAgfSk7XG59KVxuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAvLyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvbG9naW4nKTtcbn0pO1xuIiwiYXBwLmZhY3RvcnkoXCJBdXRoRmFjdG9yeVwiLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5KSB7XG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG4gICAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKHJlZik7XG4gICAgdmFyIHVzZXJzID0gcmVmLmNoaWxkKCd1c2VycycpXG4gICAgdmFyIHBob25lTnVtcyA9IFtdXG4gICAgdXNlcnMub25jZShcInZhbHVlXCIsIGZ1bmN0aW9uKGFsbFVzZXJzKSB7XG4gICAgICBhbGxVc2Vycy5mb3JFYWNoKGZ1bmN0aW9uKG9uZVVzZXIpIHtcbiAgICAgICAgdmFyIHBob25lID0gb25lVXNlci5jaGlsZCgncGhvbmUnKS52YWwoKS5yZXBsYWNlKC9cXEQvLCBcIlwiKTtcbiAgICAgICAgcGhvbmVOdW1zLnB1c2gocGhvbmUpXG4gICAgICB9KVxuICAgIH0pXG4gICAgcmV0dXJuIHtcbiAgICAgIHNpZ25VcDogZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgaWYgKHBob25lTnVtcy5pbmRleE9mKGNyZWRlbnRpYWxzLnBob25lLnJlcGxhY2UoL1xcRC8sIFwiXCIpKSA9PT0gLTEpIHtcbiAgICAgICAgICByZXR1cm4gYXV0aC4kY3JlYXRlVXNlcih7ZW1haWw6IGNyZWRlbnRpYWxzLmVtYWlsLCBwYXNzd29yZDogY3JlZGVudGlhbHMucGFzc3dvcmR9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgIGlmICghdXNlcikge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHVzZXIubmFtZSA9IGNyZWRlbnRpYWxzLm5hbWU7XG4gICAgICAgICAgICB1c2VyLnBob25lID0gY3JlZGVudGlhbHMucGhvbmU7XG4gICAgICAgICAgICB1c2VyLmVtYWlsID0gY3JlZGVudGlhbHMuZW1haWw7XG4gICAgICAgICAgICB1c2Vycy5jaGlsZCh1c2VyLnVpZCkuc2V0KHtcbiAgICAgICAgICAgICAgbmFtZTogdXNlci5uYW1lLFxuICAgICAgICAgICAgICBwaG9uZTogdXNlci5waG9uZS5yZXBsYWNlKC9cXEQvLCBcIlwiKSxcbiAgICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBwaG9uZU51bXMucHVzaChjcmVkZW50aWFscy5waG9uZS5yZXBsYWNlKC9cXEQvLCBcIlwiKSlcbiAgICAgICAgICAgIHJldHVybiB1c2VyXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICAgICAgaWYgKCFpbnB1dCkge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH0gXG4gICAgICAgICAgICB2YXIgZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgICAgIHZhciBwYXNzd29yZCA9IGNyZWRlbnRpYWxzLnBhc3N3b3JkO1xuICAgICAgICAgICAgcmV0dXJuIGF1dGguJGF1dGhXaXRoUGFzc3dvcmQoe1xuICAgICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChjb25zb2xlLmVycm9yKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZ2V0Q3VycmVudFVzZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gcmVmLmdldEF1dGgoKVxuICAgICAgfSxcbiAgICAgIHNpZ25JbjogZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgdmFyIGVtYWlsID0gY3JlZGVudGlhbHMuZW1haWw7XG4gICAgICAgIHZhciBwYXNzd29yZCA9IGNyZWRlbnRpYWxzLnBhc3N3b3JkO1xuICAgICAgICByZXR1cm4gYXV0aC4kYXV0aFdpdGhQYXNzd29yZCh7XG4gICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goY29uc29sZS5lcnJvcilcbiAgICAgIH1cbiAgICB9XG4gIH0pOyIsImFwcC5mYWN0b3J5KCdDaGF0RmFjdG9yeScsIGZ1bmN0aW9uKCRmaXJlYmFzZSwgUm9vbXNGYWN0b3J5LCAkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlT2JqZWN0LCBBdXRoRmFjdG9yeSkge1xuXG4gIHZhciBzZWxlY3RlZFJvb21JZDtcbiAgdmFyIGNoYXRzO1xuICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tLycpXG4gIHZhciB1c2VyID0gQXV0aEZhY3RvcnkuZ2V0Q3VycmVudFVzZXIoKS51aWRcbiAgdmFyIHVzZXJSZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vdXNlcnMvJyArIHVzZXIpXG4gIHZhciB1c2VyT2JqID0gJGZpcmViYXNlT2JqZWN0KHVzZXJSZWYpXG5cbiAgcmV0dXJuIHtcbiAgICBhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNoYXRzO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihjaGF0KSB7XG4gICAgICBjaGF0cy4kcmVtb3ZlKGNoYXQpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgIHJlZi5rZXkoKSA9PT0gY2hhdC4kaWQ7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24oY2hhdElkKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjaGF0c1tpXS5pZCA9PT0gcGFyc2VJbnQoY2hhdElkKSkge1xuICAgICAgICAgIHJldHVybiBjaGF0c1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBnZXRTZWxlY3RlZFJvb21OYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRSb29tO1xuICAgICAgaWYgKHNlbGVjdGVkUm9vbUlkICYmIHNlbGVjdGVkUm9vbUlkICE9IG51bGwpIHtcbiAgICAgICAgICBzZWxlY3RlZFJvb20gPSBSb29tc0ZhY3RvcnkuZ2V0KHNlbGVjdGVkUm9vbUlkKTtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWRSb29tKVxuICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWRSb29tLm5hbWU7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgc2VsZWN0Um9vbTogZnVuY3Rpb24gKHJvb21JZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbGVjdGluZyB0aGUgcm9vbSB3aXRoIGlkOiBcIiArIHJvb21JZCk7XG4gICAgICAgIHNlbGVjdGVkUm9vbUlkID0gcm9vbUlkO1xuICAgICAgICBjaGF0cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnbWVzc2FnZXMnKS5jaGlsZChzZWxlY3RlZFJvb21JZCkpO1xuICAgIH0sXG4gICAgc2VuZDogZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kaW5nIG1lc3NhZ2UgZnJvbSAoaW5zZXJ0IHVzZXIgaGVyZSkgJiBtZXNzYWdlIGlzIFwiICsgbWVzc2FnZSk7XG4gICAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgdXNlcicsIHVzZXIpXG4gICAgICAgICAgICB2YXIgY2hhdE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgICAgICAgICBmcm9tOiB1c2VyT2JqLm5hbWUsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogbWVzc2FnZSxcbiAgICAgICAgICAgICAgICB0aW1lc3RhbXA6IEZpcmViYXNlLlNlcnZlclZhbHVlLlRJTUVTVEFNUFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIGNoYXRzIHByZScsIGNoYXRzKVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgY2hhdG1lc3NhZ2UnLCBjaGF0TWVzc2FnZSlcbiAgICAgICAgICAgIC8vcmVtb3ZlZCB2YWxpZGF0aW9uIG9mIC53cml0ZSBhbmQgJG90aGVyXG4gICAgICAgICAgICBjaGF0cy4kYWRkKGNoYXRNZXNzYWdlKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJtZXNzYWdlIGFkZGVkIGFuZCB0aGlzIGlzIGRhdGEgcmV0dXJuZWRcIiwgZGF0YSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvcjpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbiAgfTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXJcblx0XHQuc3RhdGUoJ3RhYicsIHtcblx0XHR1cmw6ICcvdGFiJyxcblx0XHRhYnN0cmFjdDogdHJ1ZSxcblx0XHRjYWNoZTogZmFsc2UsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy90YWJzLmh0bWwnXG5cdFx0fSlcbn0pIiwiLy8gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuY29udHJvbGxlcnMnLCBbXSlcblxuYXBwLmNvbnRyb2xsZXIoJ0FjY291bnRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUpIHtcblxuXG52YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcblxuICAkc2NvcGUuc2V0dGluZ3MgPSB7XG4gICAgZW5hYmxlRnJpZW5kczogdHJ1ZVxuICB9O1xuICBcbiAgJHNjb3BlLnBsYWNlcyA9IGZ1bmN0aW9uKCkge1xuICBcdHllbHAuc2VhcmNoKHsgdGVybTogJ21leGljYW4nLCBsb2NhdGlvbjogJ0Jyb29rbHluJyB9KVxuLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgY29uc29sZS5sb2coZGF0YSk7XG59KVxuICB9XG5cbn0pO1xuIiwiLy8gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuY29udHJvbGxlcnMnLCBbXSlcblxuYXBwLmNvbnRyb2xsZXIoJ0Rhc2hDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUpIHtcblx0JHN0YXRlLmdvKCd0YWIuY2hhdHMnKVxufSkiLCJhcHAuY29udHJvbGxlcignQ2hhdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIENoYXRGYWN0b3J5LCAkc3RhdGVQYXJhbXMsIFJvb21zRmFjdG9yeSwgQXV0aEZhY3RvcnksICRmaXJlYmFzZU9iamVjdCkge1xuXG4gIHZhciBjdXJyVXNlciA9IEF1dGhGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCkudWlkXG4gIHZhciB1c2VyUmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL3VzZXJzLycgKyBjdXJyVXNlcilcbiAgdmFyIHVzZXJPYmogPSAkZmlyZWJhc2VPYmplY3QodXNlclJlZilcbiAgJHNjb3BlLklNID0ge1xuICAgIHRleHRNZXNzYWdlOiBcIlwiXG4gIH07XG5cbiAgLy8gJHNjb3BlLnJvb21OYW1lID0gY3VycmVudFJvb20uY2hpbGQoJ25hbWUnKVxuLy8gY29uc29sZS5sb2coJ3RoaXMgaXMgc3RhdGUgcGFyYW1zIGlkJywgJHN0YXRlUGFyYW1zLmlkKVxuICBDaGF0RmFjdG9yeS5zZWxlY3RSb29tKCRzdGF0ZVBhcmFtcy5pZCk7XG5cbiAgdmFyIHJvb21OYW1lID0gQ2hhdEZhY3RvcnkuZ2V0U2VsZWN0ZWRSb29tTmFtZSgpO1xuICBcbiAgaWYgKHJvb21OYW1lKSB7XG4gICAgICAkc2NvcGUucm9vbU5hbWUgPSBcIiAtIFwiICsgcm9vbU5hbWU7XG4gICAgICAkc2NvcGUuY2hhdHMgPSBDaGF0RmFjdG9yeS5hbGwoKTtcbiAgfVxuXG4gICRzY29wZS5zZW5kTWVzc2FnZSA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHVzZXJvYmonLCB1c2VyT2JqKVxuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgIENoYXRGYWN0b3J5LnNlbmQobXNnKTtcbiAgICAgICRzY29wZS5JTS50ZXh0TWVzc2FnZSA9IFwiXCI7XG4gIH1cblxuICAkc2NvcGUucmVtb3ZlID0gZnVuY3Rpb24gKGNoYXQpIHtcbiAgICAgIENoYXRGYWN0b3J5LnJlbW92ZShjaGF0KTtcbiAgfVxuXG4gICAgLy8gJHNjb3BlLnNlbmRDaGF0ID0gZnVuY3Rpb24gKGNoYXQpe1xuICAgIC8vICAgaWYgKCRyb290U2NvcGUudXNlcikge1xuICAgIC8vICAgICAvLyBjb25zb2xlLmxvZygndGhpcyBpcyB1c2VyJywgJHJvb3RTY29wZS51c2VyKVxuICAgIC8vICAgICAkc2NvcGUuY2hhdHMuJGFkZCh7XG4gICAgLy8gICAgICAgdXNlcjogJHJvb3RTY29wZS51c2VyLFxuICAgIC8vICAgICAgIG1lc3NhZ2U6IGNoYXQubWVzc2FnZVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIGNoYXQubWVzc2FnZSA9IFwiXCI7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuIH0pXG5cbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5jaGF0Jywge1xuICAgIHVybDogJy9jaGF0LzppZCcsXG4gICAgdmlld3M6IHtcbiAgICAgICdyb29tc1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY2hhdC9jaGF0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2hhdEN0cmwnXG4gICAgICB9XG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICAvLyBjdXJyZW50Um9vbTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgJGZpcmViYXNlT2JqKSB7XG4gICAgICAvLyAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vZ3JvdXBzLycgKyAkc3RhdGVQYXJhbXMuaWQpXG4gICAgICAvLyAgIHJldHVybiAkZmlyZWJhc2VPYmoocmVmKVxuICAgICAgLy8gfVxuXG5cbiAgICB9XG4gIH0pXG59KTsiLCJhcHAuY29udHJvbGxlcignRXZlbnRzQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgUm9vbXNGYWN0b3J5LCBDaGF0RmFjdG9yeSwgJHN0YXRlKSB7XG5cblxuIH0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5ldmVudHMnLCB7XG4gICAgdXJsOiAnL2V2ZW50cycsXG4gICAgdmlld3M6IHtcbiAgICAgICdldmVudHNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2V2ZW50cy9ldmVudHMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdFdmVudHNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsImFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgJHNjb3BlLmNvbnRhY3RzID0gW1wicGVyc29uMVwiLCBcInBlcnNvbjJcIiwgXCJwZXJzb24zXCJdO1xuICAkc2NvcGUuY2hhdHMgPSBbXCJiYXJ0XCIsIFwid2hpc2tleVwiLCBcImxsb29cIl07XG59KVxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ2xvZ2luJywge1xuICAgIHVybDogJy9sb2dpbicsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9sb2dpbi5odG1sJywgXG4gICAgY29udHJvbGxlcjogJ1JlZ2lzdGVyQ3RybCdcbiAgfSlcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIuY3JlYXRlTmV3Um9vbScsIHtcbiAgICB1cmw6ICcvY3JlYXRlTmV3Um9vbScsXG4gICAgdmlld3M6IHtcbiAgICAgICdyb29tc1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvcm9vbXMvY3JlYXRlTmV3Um9vbS5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1Jvb21zQ3RybCdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KTsiLCJhcHAuY29udHJvbGxlcignUm9vbXNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBSb29tc0ZhY3RvcnksIENoYXRGYWN0b3J5LCAkc3RhdGUpIHtcblxuICAgIC8vICRpb25pY01vZGFsLmZyb21UZW1wbGF0ZVVybCgnanMvbG9naW4vbG9naW4uaHRtbCcsIHtcbiAgICAvLyAgICAgc2NvcGU6ICRzY29wZSxcbiAgICAvLyAgICAgYW5pbWF0aW9uOiAnc2xpZGUtaW4tdXAnXG4gICAgLy8gfSlcbiAgICAvLyAudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAvLyAkc2NvcGUubW9kYWwgPSBtb2RhbDtcbiAgICAvLyB9KTtcblxuICAgICRzY29wZS5yb29tcyA9IFJvb21zRmFjdG9yeS5hbGwoKTtcblxuICAgICRzY29wZS5jcmVhdGVSb29tID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc3RhdGUuZ28oJ3RhYi5jcmVhdGVOZXdSb29tJyk7XG4gICAgfVxuXG4gICAgJHNjb3BlLm9wZW5Sb29tID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICBjb25zb2xlLmxvZygndGhpcyBpcyBpZCBpbiBvcGVuJywgaWQpXG4gICAgICAkc3RhdGUuZ28oJ3RhYi5jaGF0Jywge1xuICAgICAgICBpZDogaWRcbiAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5hZGRDb250YWN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvL2FkZCB0byBmaXJlYmFzZSBhcnJheSBpbiByb29tc2ZhY3RvcnlcbiAgICB9XG5cbiAgICAkc2NvcGUuc2F2ZU5ld1Jvb20gPSBmdW5jdGlvbiAocm9vbU9iaikge1xuICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgcm9vbW9iaiBpbiBzYXZlJywgcm9vbU9iailcbiAgICAgICAgcmV0dXJuIFJvb21zRmFjdG9yeS5hZGQocm9vbU9iaikudGhlbihmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIGlkIGluIHNhdmUnLCBpZClcbiAgICAgICAgICAgICRzY29wZS5vcGVuUm9vbShpZCk7XG4gICAgICAgICAgICAvLyAkc3RhdGUuZ28oJ3RhYi5jaGF0Jywge2lkOiBpZH0pXG4gICAgICAgIH0pXG5cbiAgICAgICAgXG4gICAgICAgIC8vYWRkIHRvIGZpcmViYXNlIGFycmF5IGluIHJvb21zZmFjdG9yeVxuICAgIH1cblxuICAgIC8vICRzY29wZS5zZW5kQ2hhdCA9IGZ1bmN0aW9uIChjaGF0KXtcbiAgICAvLyAgIGlmICgkcm9vdFNjb3BlLnVzZXIpIHtcbiAgICAvLyAgICAgLy8gY29uc29sZS5sb2coJ3RoaXMgaXMgdXNlcicsICRyb290U2NvcGUudXNlcilcbiAgICAvLyAgICAgJHNjb3BlLmNoYXRzLiRhZGQoe1xuICAgIC8vICAgICAgIHVzZXI6ICRyb290U2NvcGUudXNlcixcbiAgICAvLyAgICAgICBtZXNzYWdlOiBjaGF0Lm1lc3NhZ2VcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICBjaGF0Lm1lc3NhZ2UgPSBcIlwiO1xuICAgIC8vICAgfVxuICAgIC8vIH1cbiB9KVxuIiwiYXBwLmZhY3RvcnkoJ1Jvb21zRmFjdG9yeScsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VBdXRoLCBBdXRoRmFjdG9yeSkge1xuXG4gIHZhciByb29tc1JlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbS9ncm91cHMvJylcbiAgdmFyIHJvb21zQXJyID0gJGZpcmViYXNlQXJyYXkocm9vbXNSZWYpO1xuICAvLyB2YXIgcm9vbXNBcnIgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoJ2dyb3VwcycpKTtcbiAgLy8gdmFyIHJvb21zUmVmID0gcmVmLmNoaWxkKCdncm91cHMnKVxuICB2YXIgY3VyclVzZXJPYmogPSBBdXRoRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpO1xuICB2YXIgY3VyclVzZXIgPSBBdXRoRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpLnVpZFxuICB2YXIgY3VyclVzZXJSb29tcyA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbS91c2Vycy8nICsgY3VyclVzZXIgKyAnL2dyb3VwcycpXG4gIHZhciB1c2VyUmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL3VzZXJzLycgKyBjdXJyVXNlcilcblxuICByZXR1cm4ge1xuXG4gICAgYWxsOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByb29tc0FycjtcbiAgICB9LFxuICAgXG4gICAgZ2V0OiBmdW5jdGlvbihyb29tSWQpIHtcbiAgICAgIHJldHVybiByb29tc0Fyci4kZ2V0UmVjb3JkKHJvb21JZCk7XG4gICAgfSxcblxuICAgIGFkZDogZnVuY3Rpb24ocm9vbU9iaikge1xuICAgICAgcmV0dXJuIHJvb21zQXJyLiRhZGQocm9vbU9iailcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgdmFyIGlkID0gcmVmLmtleSgpO1xuICAgICAgICBjdXJyVXNlclJvb21zLmNoaWxkKGlkKS5zZXQoe25hbWU6IHJvb21PYmoubmFtZX0pXG4gICAgICAgIC8vcmVtb3ZlZCB2YWxpZGF0aW9uIG9mIHVzZXJfaWQgPSB1c2VyIHVpZFxuICAgICAgICAkZmlyZWJhc2VBcnJheShyb29tc1JlZi5jaGlsZChpZCkuY2hpbGQoJ21lbWJlcnMnKSkuJGFkZCh7XG4gICAgICAgICAgaWQ6IGN1cnJVc2VyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyB0aGUgZGF0YScsIGRhdGEpXG4gICAgICAgIH0pXG4gICAgIFxuICAgICAgICByZXR1cm4gaWQ7XG4gICAgICB9KVxuICAgICAgICAvL3N0YXRlLmdvIHRvIGNoYXQgZGV0YWlsIHdpdGggbmV3IGlkXG5cbiAgICB9XG4gIH07XG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIucm9vbXMnLCB7XG4gICAgdXJsOiAnL3Jvb21zJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3Jvb21zVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9yb29tcy9yb29tcy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1Jvb21zQ3RybCdcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gcmVzb2x2ZToge1xuICAgIC8vICAgICBcImN1cnJlbnRBdXRoXCI6IFtcIkF1dGhcIixcbiAgICAvLyAgICAgICAgIGZ1bmN0aW9uIChBdXRoKSB7XG4gICAgLy8gICAgICAgICAgICAgcmV0dXJuIEF1dGguJHdhaXRGb3JBdXRoKCk7XG4gICAgLy8gfV19XG4gIH0pXG59KTsiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignU2V0dGluZ3NDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBjdXJyZW50VXNlciwgJHN0YXRlKSB7XG5cbnZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuXG4gICRzY29wZS51c2VyID0gY3VycmVudFVzZXI7XG5cbiAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgXHRyZWYudW5hdXRoKCk7XG4gIFx0JHN0YXRlLmdvKCdsb2dpbicpXG4gIH1cblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCR1cmxSb3V0ZXJQcm92aWRlciwgJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIuc2V0dGluZ3MnLCB7XG4gICAgdXJsOiAnL3NldHRpbmdzLzp1aWQnLFxuICAgIHZpZXdzOiB7XG4gICAgICAnc2V0dGluZ3NWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3NldHRpbmdzL3VzZXJJbmZvLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnU2V0dGluZ3NDdHJsJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgY3VycmVudFVzZXI6IGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgJGZpcmViYXNlT2JqZWN0KSB7XG4gICAgICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vdXNlcnMvJyArICRzdGF0ZVBhcmFtcy51aWQpXG4gICAgICAgIHZhciB1c2VyID0gJGZpcmViYXNlT2JqZWN0KHJlZilcbiAgICAgICAgcmV0dXJuIHVzZXJcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KTsiLCJhcHAuY29udHJvbGxlcignUmVnaXN0ZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkZmlyZWJhc2VBdXRoLCBBdXRoRmFjdG9yeSwgJHN0YXRlLCAkcm9vdFNjb3BlLCAkaW9uaWNQb3B1cCkge1xuICAgIFxuICAgIC8vICRpb25pY01vZGFsLmZyb21UZW1wbGF0ZVVybCgnanMvbG9naW4vbG9naW4uaHRtbCcsIHtcbiAgICAvLyBzY29wZTogJHNjb3BlIH0pXG4gICAgLy8gLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgLy8gJHNjb3BlLm1vZGFsID0gbW9kYWw7XG4gICAgLy8gfSk7XG5cblxuICAgICRzY29wZS5zaWduVXAgPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICBpZiAoIUF1dGhGYWN0b3J5LnNpZ25VcChjcmVkZW50aWFscykpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0ludmFsaWQgY3JlZGVudGlhbHMnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnVGhhdCBudW1iZXIgb3IgZW1haWwgaXMgYWxyZWFkeSByZWdpc3RlcmVkISBQbGVhc2UgdHJ5IGFnYWluIDopJ1xuICAgICAgICAgICAgfSkgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIEF1dGhGYWN0b3J5LnNpZ25VcChjcmVkZW50aWFscylcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3RhYi5yb29tcycsIHt1aWQ6IHVzZXIudWlkfSlcbiAgICAgICAgICAgIH0pICAgIFxuICAgICAgICB9XG4gICAgfVxuICAgICRzY29wZS5zaWduSW4gPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICBBdXRoRmFjdG9yeS5zaWduSW4oY3JlZGVudGlhbHMpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLnJvb21zJywge3VpZDogdXNlci51aWR9KVxuICAgICAgICB9KVxuICAgIH1cbn0pIiwiYXBwLmNvbnRyb2xsZXIoJ1VzZXJDdHJsJywgW1wiJHNjb3BlXCIsIFwiJGZpcmViYXNlXCIsIFwiJGZpcmViYXNlQXV0aFwiLCBmdW5jdGlvbigkc2NvcGUsICRmaXJlYmFzZSwgJGZpcmViYXNlQXV0aCkge1xuXHR2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcblx0XG59XSkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
