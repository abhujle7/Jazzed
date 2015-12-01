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
app.factory('ChatFactory', function($firebase, RoomsFactory, $firebaseArray, AuthFactory) {

  var selectedRoomId;
  var chats;
  var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/')
  var user = AuthFactory.getCurrentUser().uid
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
app.controller('ChatCtrl', function($scope, ChatFactory, $stateParams, RoomsFactory, AuthFactory) {

  var user = AuthFactory.getCurrentUser()
  $scope.IM = {
    textMessage: "",
    from: user.password.email
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
      console.log('this is user', user)
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
app.controller('UserCtrl', ["$scope", "$firebase", "$firebaseAuth", function($scope, $firebase, $firebaseAuth) {
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')
	
}])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguZmFjdG9yeS5qcyIsImNoYXQuZmFjdG9yeS5qcyIsInRhYlN0YXRlLmpzIiwiYWNjb3VudC9hY2NvdW50LmNvbnRyb2xsZXIuanMiLCJkYXNoL2Rhc2guY29udHJvbGxlci5qcyIsImNoYXQvY2hhdC5jb250cm9sbGVyLmpzIiwiY2hhdC90YWIuY2hhdC5zdGF0ZS5qcyIsImxvZ2luL2xvZ2luLmNvbnRyb2xsZXIuanMiLCJsb2dpbi9sb2dpbi5zdGF0ZS5qcyIsImV2ZW50cy9ldmVudHMuY29udHJvbGxlci5qcyIsImV2ZW50cy9ldmVudHMuc3RhdGUuanMiLCJyb29tcy9jcmVhdGVOZXdSb29tLnN0YXRlLmpzIiwicm9vbXMvcm9vbXMuY29udHJvbGxlci5qcyIsInJvb21zL3Jvb21zLmZhY3RvcnkuanMiLCJyb29tcy9yb29tcy5zdGF0ZS5qcyIsInNldHRpbmdzL3NldHRpbmdzLmNvbnRyb2xsZXIuanMiLCJzZXR0aW5ncy9zZXR0aW5ncy5zdGF0ZS5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyLmNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy91c2VyLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLy8gSW9uaWMgU3RhcnRlciBBcHBcblxuLy8gYW5ndWxhci5tb2R1bGUgaXMgYSBnbG9iYWwgcGxhY2UgZm9yIGNyZWF0aW5nLCByZWdpc3RlcmluZyBhbmQgcmV0cmlldmluZyBBbmd1bGFyIG1vZHVsZXNcbi8vICdzdGFydGVyJyBpcyB0aGUgbmFtZSBvZiB0aGlzIGFuZ3VsYXIgbW9kdWxlIGV4YW1wbGUgKGFsc28gc2V0IGluIGEgPGJvZHk+IGF0dHJpYnV0ZSBpbiBpbmRleC5odG1sKVxuLy8gdGhlIDJuZCBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2YgJ3JlcXVpcmVzJ1xuLy8gJ3N0YXJ0ZXIuc2VydmljZXMnIGlzIGZvdW5kIGluIHNlcnZpY2VzLmpzXG4vLyAnc3RhcnRlci5jb250cm9sbGVycycgaXMgZm91bmQgaW4gY29udHJvbGxlcnMuanNcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlcicsIFsnaW9uaWMnLCBcImZpcmViYXNlXCIsIFwidWkucm91dGVyXCJdKVxuXG4gXG4gXG5hcHAucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgaWYgKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuXG4gICAgfVxuICAgIGlmICh3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICAvLyBvcmcuYXBhY2hlLmNvcmRvdmEuc3RhdHVzYmFyIHJlcXVpcmVkXG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG4gICAgfVxuICB9KTtcbn0pXG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gIC8vIGlmIG5vbmUgb2YgdGhlIGFib3ZlIHN0YXRlcyBhcmUgbWF0Y2hlZCwgdXNlIHRoaXMgYXMgdGhlIGZhbGxiYWNrXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9sb2dpbicpO1xufSk7XG4iLCJhcHAuZmFjdG9yeShcIkF1dGhGYWN0b3J5XCIsIGZ1bmN0aW9uKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgocmVmKTtcbiAgICB2YXIgdXNlcnMgPSByZWYuY2hpbGQoJ3VzZXJzJylcbiAgICB2YXIgcGhvbmVOdW1zID0gW11cbiAgICB1c2Vycy5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oYWxsVXNlcnMpIHtcbiAgICAgIGFsbFVzZXJzLmZvckVhY2goZnVuY3Rpb24ob25lVXNlcikge1xuICAgICAgICB2YXIgcGhvbmUgPSBvbmVVc2VyLmNoaWxkKCdwaG9uZScpLnZhbCgpLnJlcGxhY2UoL1xcRC8sIFwiXCIpO1xuICAgICAgICBwaG9uZU51bXMucHVzaChwaG9uZSlcbiAgICAgIH0pXG4gICAgfSlcbiAgICByZXR1cm4ge1xuICAgICAgc2lnblVwOiBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICBpZiAocGhvbmVOdW1zLmluZGV4T2YoY3JlZGVudGlhbHMucGhvbmUucmVwbGFjZSgvXFxELywgXCJcIikpID09PSAtMSkge1xuICAgICAgICAgIHJldHVybiBhdXRoLiRjcmVhdGVVc2VyKHtlbWFpbDogY3JlZGVudGlhbHMuZW1haWwsIHBhc3N3b3JkOiBjcmVkZW50aWFscy5wYXNzd29yZH0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXNlci5uYW1lID0gY3JlZGVudGlhbHMubmFtZTtcbiAgICAgICAgICAgIHVzZXIucGhvbmUgPSBjcmVkZW50aWFscy5waG9uZTtcbiAgICAgICAgICAgIHVzZXIuZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgICAgIHVzZXJzLmNoaWxkKHVzZXIudWlkKS5zZXQoe1xuICAgICAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgICAgIHBob25lOiB1c2VyLnBob25lLnJlcGxhY2UoL1xcRC8sIFwiXCIpLFxuICAgICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHBob25lTnVtcy5wdXNoKGNyZWRlbnRpYWxzLnBob25lLnJlcGxhY2UoL1xcRC8sIFwiXCIpKVxuICAgICAgICAgICAgcmV0dXJuIHVzZXJcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgICAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIHZhciBlbWFpbCA9IGNyZWRlbnRpYWxzLmVtYWlsO1xuICAgICAgICAgICAgdmFyIHBhc3N3b3JkID0gY3JlZGVudGlhbHMucGFzc3dvcmQ7XG4gICAgICAgICAgICByZXR1cm4gYXV0aC4kYXV0aFdpdGhQYXNzd29yZCh7XG4gICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGNvbnNvbGUuZXJyb3IpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRDdXJyZW50VXNlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiByZWYuZ2V0QXV0aCgpXG4gICAgICB9LFxuICAgICAgc2lnbkluOiBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICB2YXIgZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgdmFyIHBhc3N3b3JkID0gY3JlZGVudGlhbHMucGFzc3dvcmQ7XG4gICAgICAgIHJldHVybiBhdXRoLiRhdXRoV2l0aFBhc3N3b3JkKHtcbiAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChjb25zb2xlLmVycm9yKVxuICAgICAgfVxuICAgIH1cbiAgfSk7IiwiYXBwLmZhY3RvcnkoJ0NoYXRGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlLCBSb29tc0ZhY3RvcnksICRmaXJlYmFzZUFycmF5LCBBdXRoRmFjdG9yeSkge1xuXG4gIHZhciBzZWxlY3RlZFJvb21JZDtcbiAgdmFyIGNoYXRzO1xuICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tLycpXG4gIHZhciB1c2VyID0gQXV0aEZhY3RvcnkuZ2V0Q3VycmVudFVzZXIoKS51aWRcbiAgcmV0dXJuIHtcbiAgICBhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNoYXRzO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihjaGF0KSB7XG4gICAgICBjaGF0cy4kcmVtb3ZlKGNoYXQpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgIHJlZi5rZXkoKSA9PT0gY2hhdC4kaWQ7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24oY2hhdElkKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjaGF0c1tpXS5pZCA9PT0gcGFyc2VJbnQoY2hhdElkKSkge1xuICAgICAgICAgIHJldHVybiBjaGF0c1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBnZXRTZWxlY3RlZFJvb21OYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRSb29tO1xuICAgICAgaWYgKHNlbGVjdGVkUm9vbUlkICYmIHNlbGVjdGVkUm9vbUlkICE9IG51bGwpIHtcbiAgICAgICAgICBzZWxlY3RlZFJvb20gPSBSb29tc0ZhY3RvcnkuZ2V0KHNlbGVjdGVkUm9vbUlkKTtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWRSb29tKVxuICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWRSb29tLm5hbWU7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgc2VsZWN0Um9vbTogZnVuY3Rpb24gKHJvb21JZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbGVjdGluZyB0aGUgcm9vbSB3aXRoIGlkOiBcIiArIHJvb21JZCk7XG4gICAgICAgIHNlbGVjdGVkUm9vbUlkID0gcm9vbUlkO1xuICAgICAgICBjaGF0cyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnbWVzc2FnZXMnKS5jaGlsZChzZWxlY3RlZFJvb21JZCkpO1xuICAgIH0sXG4gICAgc2VuZDogZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kaW5nIG1lc3NhZ2UgZnJvbSAoaW5zZXJ0IHVzZXIgaGVyZSkgJiBtZXNzYWdlIGlzIFwiICsgbWVzc2FnZSk7XG4gICAgICAgIGlmIChtZXNzYWdlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgdXNlcicsIHVzZXIpXG4gICAgICAgICAgICB2YXIgY2hhdE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgdXNlcjogdXNlcixcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRmlyZWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgY2hhdHMgcHJlJywgY2hhdHMpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyBjaGF0bWVzc2FnZScsIGNoYXRNZXNzYWdlKVxuICAgICAgICAgICAgLy9yZW1vdmVkIHZhbGlkYXRpb24gb2YgLndyaXRlIGFuZCAkb3RoZXJcbiAgICAgICAgICAgIGNoYXRzLiRhZGQoY2hhdE1lc3NhZ2UpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1lc3NhZ2UgYWRkZWQgYW5kIHRoaXMgaXMgZGF0YSByZXR1cm5lZFwiLCBkYXRhKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yOlwiLCBlcnJvcik7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuICB9O1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlclxuXHRcdC5zdGF0ZSgndGFiJywge1xuXHRcdHVybDogJy90YWInLFxuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdGNhY2hlOiBmYWxzZSxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL3RhYnMuaHRtbCdcblx0XHR9KVxufSkiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSkge1xuXG5cbnZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuXG4gICRzY29wZS5zZXR0aW5ncyA9IHtcbiAgICBlbmFibGVGcmllbmRzOiB0cnVlXG4gIH07XG4gIFxuICAkc2NvcGUucGxhY2VzID0gZnVuY3Rpb24oKSB7XG4gIFx0eWVscC5zZWFyY2goeyB0ZXJtOiAnbWV4aWNhbicsIGxvY2F0aW9uOiAnQnJvb2tseW4nIH0pXG4udGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICBjb25zb2xlLmxvZyhkYXRhKTtcbn0pXG4gIH1cblxufSk7XG4iLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignRGFzaEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSkge1xuXHQkc3RhdGUuZ28oJ3RhYi5jaGF0cycpXG59KSIsImFwcC5jb250cm9sbGVyKCdDaGF0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgQ2hhdEZhY3RvcnksICRzdGF0ZVBhcmFtcywgUm9vbXNGYWN0b3J5LCBBdXRoRmFjdG9yeSkge1xuXG4gIHZhciB1c2VyID0gQXV0aEZhY3RvcnkuZ2V0Q3VycmVudFVzZXIoKVxuICAkc2NvcGUuSU0gPSB7XG4gICAgdGV4dE1lc3NhZ2U6IFwiXCIsXG4gICAgZnJvbTogdXNlci5wYXNzd29yZC5lbWFpbFxuICB9O1xuXG4gIC8vICRzY29wZS5yb29tTmFtZSA9IGN1cnJlbnRSb29tLmNoaWxkKCduYW1lJylcbi8vIGNvbnNvbGUubG9nKCd0aGlzIGlzIHN0YXRlIHBhcmFtcyBpZCcsICRzdGF0ZVBhcmFtcy5pZClcbiAgQ2hhdEZhY3Rvcnkuc2VsZWN0Um9vbSgkc3RhdGVQYXJhbXMuaWQpO1xuXG4gIHZhciByb29tTmFtZSA9IENoYXRGYWN0b3J5LmdldFNlbGVjdGVkUm9vbU5hbWUoKTtcbiAgXG4gIGlmIChyb29tTmFtZSkge1xuICAgICAgJHNjb3BlLnJvb21OYW1lID0gXCIgLSBcIiArIHJvb21OYW1lO1xuICAgICAgJHNjb3BlLmNoYXRzID0gQ2hhdEZhY3RvcnkuYWxsKCk7XG4gIH1cblxuICAkc2NvcGUuc2VuZE1lc3NhZ2UgPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB1c2VyJywgdXNlcilcbiAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgICBDaGF0RmFjdG9yeS5zZW5kKG1zZyk7XG4gICAgICAkc2NvcGUuSU0udGV4dE1lc3NhZ2UgPSBcIlwiO1xuICB9XG5cbiAgJHNjb3BlLnJlbW92ZSA9IGZ1bmN0aW9uIChjaGF0KSB7XG4gICAgICBDaGF0RmFjdG9yeS5yZW1vdmUoY2hhdCk7XG4gIH1cblxuICAgIC8vICRzY29wZS5zZW5kQ2hhdCA9IGZ1bmN0aW9uIChjaGF0KXtcbiAgICAvLyAgIGlmICgkcm9vdFNjb3BlLnVzZXIpIHtcbiAgICAvLyAgICAgLy8gY29uc29sZS5sb2coJ3RoaXMgaXMgdXNlcicsICRyb290U2NvcGUudXNlcilcbiAgICAvLyAgICAgJHNjb3BlLmNoYXRzLiRhZGQoe1xuICAgIC8vICAgICAgIHVzZXI6ICRyb290U2NvcGUudXNlcixcbiAgICAvLyAgICAgICBtZXNzYWdlOiBjaGF0Lm1lc3NhZ2VcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICBjaGF0Lm1lc3NhZ2UgPSBcIlwiO1xuICAgIC8vICAgfVxuICAgIC8vIH1cbiB9KVxuXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIuY2hhdCcsIHtcbiAgICB1cmw6ICcvY2hhdC86aWQnLFxuICAgIHZpZXdzOiB7XG4gICAgICAncm9vbXNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NoYXQvY2hhdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NoYXRDdHJsJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgLy8gY3VycmVudFJvb206IGZ1bmN0aW9uICgkc3RhdGVQYXJhbXMsICRmaXJlYmFzZU9iaikge1xuICAgICAgLy8gICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL2dyb3Vwcy8nICsgJHN0YXRlUGFyYW1zLmlkKVxuICAgICAgLy8gICByZXR1cm4gJGZpcmViYXNlT2JqKHJlZilcbiAgICAgIC8vIH1cblxuXG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAkc2NvcGUuY29udGFjdHMgPSBbXCJwZXJzb24xXCIsIFwicGVyc29uMlwiLCBcInBlcnNvbjNcIl07XG4gICRzY29wZS5jaGF0cyA9IFtcImJhcnRcIiwgXCJ3aGlza2V5XCIsIFwibGxvb1wiXTtcbn0pXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgnbG9naW4nLCB7XG4gICAgdXJsOiAnL2xvZ2luJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnUmVnaXN0ZXJDdHJsJ1xuICB9KVxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ0V2ZW50c0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIFJvb21zRmFjdG9yeSwgQ2hhdEZhY3RvcnksICRzdGF0ZSkge1xuXG5cbiB9KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIuZXZlbnRzJywge1xuICAgIHVybDogJy9ldmVudHMnLFxuICAgIHZpZXdzOiB7XG4gICAgICAnZXZlbnRzVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ldmVudHMvZXZlbnRzLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnRXZlbnRzQ3RybCdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLmNyZWF0ZU5ld1Jvb20nLCB7XG4gICAgdXJsOiAnL2NyZWF0ZU5ld1Jvb20nLFxuICAgIHZpZXdzOiB7XG4gICAgICAncm9vbXNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Jvb21zL2NyZWF0ZU5ld1Jvb20uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSb29tc0N0cmwnXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ1Jvb21zQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgUm9vbXNGYWN0b3J5LCBDaGF0RmFjdG9yeSwgJHN0YXRlKSB7XG5cbiAgICAvLyAkaW9uaWNNb2RhbC5mcm9tVGVtcGxhdGVVcmwoJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLCB7XG4gICAgLy8gICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgLy8gICAgIGFuaW1hdGlvbjogJ3NsaWRlLWluLXVwJ1xuICAgIC8vIH0pXG4gICAgLy8gLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgLy8gJHNjb3BlLm1vZGFsID0gbW9kYWw7XG4gICAgLy8gfSk7XG5cbiAgICAkc2NvcGUucm9vbXMgPSBSb29tc0ZhY3RvcnkuYWxsKCk7XG5cbiAgICAkc2NvcGUuY3JlYXRlUm9vbSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLmdvKCd0YWIuY3JlYXRlTmV3Um9vbScpO1xuICAgIH1cblxuICAgICRzY29wZS5vcGVuUm9vbSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgaWQgaW4gb3BlbicsIGlkKVxuICAgICAgJHN0YXRlLmdvKCd0YWIuY2hhdCcsIHtcbiAgICAgICAgaWQ6IGlkXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAkc2NvcGUuYWRkQ29udGFjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9hZGQgdG8gZmlyZWJhc2UgYXJyYXkgaW4gcm9vbXNmYWN0b3J5XG4gICAgfVxuXG4gICAgJHNjb3BlLnNhdmVOZXdSb29tID0gZnVuY3Rpb24gKHJvb21PYmopIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIHJvb21vYmogaW4gc2F2ZScsIHJvb21PYmopXG4gICAgICAgIHJldHVybiBSb29tc0ZhY3RvcnkuYWRkKHJvb21PYmopLnRoZW4oZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSBpZCBpbiBzYXZlJywgaWQpXG4gICAgICAgICAgICAkc2NvcGUub3BlblJvb20oaWQpO1xuICAgICAgICAgICAgLy8gJHN0YXRlLmdvKCd0YWIuY2hhdCcsIHtpZDogaWR9KVxuICAgICAgICB9KVxuXG4gICAgICAgIFxuICAgICAgICAvL2FkZCB0byBmaXJlYmFzZSBhcnJheSBpbiByb29tc2ZhY3RvcnlcbiAgICB9XG5cbiAgICAvLyAkc2NvcGUuc2VuZENoYXQgPSBmdW5jdGlvbiAoY2hhdCl7XG4gICAgLy8gICBpZiAoJHJvb3RTY29wZS51c2VyKSB7XG4gICAgLy8gICAgIC8vIGNvbnNvbGUubG9nKCd0aGlzIGlzIHVzZXInLCAkcm9vdFNjb3BlLnVzZXIpXG4gICAgLy8gICAgICRzY29wZS5jaGF0cy4kYWRkKHtcbiAgICAvLyAgICAgICB1c2VyOiAkcm9vdFNjb3BlLnVzZXIsXG4gICAgLy8gICAgICAgbWVzc2FnZTogY2hhdC5tZXNzYWdlXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgY2hhdC5tZXNzYWdlID0gXCJcIjtcbiAgICAvLyAgIH1cbiAgICAvLyB9XG4gfSlcbiIsImFwcC5mYWN0b3J5KCdSb29tc0ZhY3RvcnknLCBmdW5jdGlvbigkZmlyZWJhc2VBcnJheSwgJGZpcmViYXNlQXV0aCwgQXV0aEZhY3RvcnkpIHtcblxuICB2YXIgcm9vbXNSZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vZ3JvdXBzLycpXG4gIHZhciByb29tc0FyciA9ICRmaXJlYmFzZUFycmF5KHJvb21zUmVmKTtcbiAgLy8gdmFyIHJvb21zQXJyID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKCdncm91cHMnKSk7XG4gIC8vIHZhciByb29tc1JlZiA9IHJlZi5jaGlsZCgnZ3JvdXBzJylcbiAgdmFyIGN1cnJVc2VyT2JqID0gQXV0aEZhY3RvcnkuZ2V0Q3VycmVudFVzZXIoKTtcbiAgdmFyIGN1cnJVc2VyID0gQXV0aEZhY3RvcnkuZ2V0Q3VycmVudFVzZXIoKS51aWRcbiAgdmFyIGN1cnJVc2VyUm9vbXMgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vdXNlcnMvJyArIGN1cnJVc2VyICsgJy9ncm91cHMnKVxuICB2YXIgdXNlclJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbS91c2Vycy8nICsgY3VyclVzZXIpXG5cbiAgcmV0dXJuIHtcblxuICAgIGFsbDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcm9vbXNBcnI7XG4gICAgfSxcbiAgIFxuICAgIGdldDogZnVuY3Rpb24ocm9vbUlkKSB7XG4gICAgICByZXR1cm4gcm9vbXNBcnIuJGdldFJlY29yZChyb29tSWQpO1xuICAgIH0sXG5cbiAgICBhZGQ6IGZ1bmN0aW9uKHJvb21PYmopIHtcbiAgICAgIHJldHVybiByb29tc0Fyci4kYWRkKHJvb21PYmopXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgIHZhciBpZCA9IHJlZi5rZXkoKTtcbiAgICAgICAgY3VyclVzZXJSb29tcy5jaGlsZChpZCkuc2V0KHtuYW1lOiByb29tT2JqLm5hbWV9KVxuICAgICAgICAvL3JlbW92ZWQgdmFsaWRhdGlvbiBvZiB1c2VyX2lkID0gdXNlciB1aWRcbiAgICAgICAgJGZpcmViYXNlQXJyYXkocm9vbXNSZWYuY2hpbGQoaWQpLmNoaWxkKCdtZW1iZXJzJykpLiRhZGQoe1xuICAgICAgICAgIGlkOiBjdXJyVXNlclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgdGhlIGRhdGEnLCBkYXRhKVxuICAgICAgICB9KVxuICAgICBcbiAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgfSlcbiAgICAgICAgLy9zdGF0ZS5nbyB0byBjaGF0IGRldGFpbCB3aXRoIG5ldyBpZFxuXG4gICAgfVxuICB9O1xufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLnJvb21zJywge1xuICAgIHVybDogJy9yb29tcycsXG4gICAgdmlld3M6IHtcbiAgICAgICdyb29tc1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvcm9vbXMvcm9vbXMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSb29tc0N0cmwnXG4gICAgICB9XG4gICAgfVxuICAgIC8vIHJlc29sdmU6IHtcbiAgICAvLyAgICAgXCJjdXJyZW50QXV0aFwiOiBbXCJBdXRoXCIsXG4gICAgLy8gICAgICAgICBmdW5jdGlvbiAoQXV0aCkge1xuICAgIC8vICAgICAgICAgICAgIHJldHVybiBBdXRoLiR3YWl0Rm9yQXV0aCgpO1xuICAgIC8vIH1dfVxuICB9KVxufSk7IiwiLy8gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuY29udHJvbGxlcnMnLCBbXSlcblxuYXBwLmNvbnRyb2xsZXIoJ1NldHRpbmdzQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgY3VycmVudFVzZXIsICRzdGF0ZSkge1xuXG52YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcblxuICAkc2NvcGUudXNlciA9IGN1cnJlbnRVc2VyO1xuXG4gICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gIFx0cmVmLnVuYXV0aCgpO1xuICBcdCRzdGF0ZS5nbygnbG9naW4nKVxuICB9XG5cbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkdXJsUm91dGVyUHJvdmlkZXIsICRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLnNldHRpbmdzJywge1xuICAgIHVybDogJy9zZXR0aW5ncy86dWlkJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3NldHRpbmdzVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9zZXR0aW5ncy91c2VySW5mby5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1NldHRpbmdzQ3RybCdcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGN1cnJlbnRVc2VyOiBmdW5jdGlvbigkc3RhdGVQYXJhbXMsICRmaXJlYmFzZU9iamVjdCkge1xuICAgICAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL3VzZXJzLycgKyAkc3RhdGVQYXJhbXMudWlkKVxuICAgICAgICB2YXIgdXNlciA9ICRmaXJlYmFzZU9iamVjdChyZWYpXG4gICAgICAgIHJldHVybiB1c2VyXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ1JlZ2lzdGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGZpcmViYXNlQXV0aCwgQXV0aEZhY3RvcnksICRzdGF0ZSwgJHJvb3RTY29wZSwgJGlvbmljUG9wdXApIHtcbiAgICBcbiAgICAvLyAkaW9uaWNNb2RhbC5mcm9tVGVtcGxhdGVVcmwoJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLCB7XG4gICAgLy8gc2NvcGU6ICRzY29wZSB9KVxuICAgIC8vIC50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgIC8vICRzY29wZS5tb2RhbCA9IG1vZGFsO1xuICAgIC8vIH0pO1xuXG5cbiAgICAkc2NvcGUuc2lnblVwID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgaWYgKCFBdXRoRmFjdG9yeS5zaWduVXAoY3JlZGVudGlhbHMpKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIGNyZWRlbnRpYWxzJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJ1RoYXQgbnVtYmVyIG9yIGVtYWlsIGlzIGFscmVhZHkgcmVnaXN0ZXJlZCEgUGxlYXNlIHRyeSBhZ2FpbiA6KSdcbiAgICAgICAgICAgIH0pICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBBdXRoRmFjdG9yeS5zaWduVXAoY3JlZGVudGlhbHMpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCd0YWIucm9vbXMnLCB7dWlkOiB1c2VyLnVpZH0pXG4gICAgICAgICAgICB9KSAgICBcbiAgICAgICAgfVxuICAgIH1cbiAgICAkc2NvcGUuc2lnbkluID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgQXV0aEZhY3Rvcnkuc2lnbkluKGNyZWRlbnRpYWxzKVxuICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3RhYi5yb29tcycsIHt1aWQ6IHVzZXIudWlkfSlcbiAgICAgICAgfSlcbiAgICB9XG59KSIsImFwcC5jb250cm9sbGVyKCdVc2VyQ3RybCcsIFtcIiRzY29wZVwiLCBcIiRmaXJlYmFzZVwiLCBcIiRmaXJlYmFzZUF1dGhcIiwgZnVuY3Rpb24oJHNjb3BlLCAkZmlyZWJhc2UsICRmaXJlYmFzZUF1dGgpIHtcblx0dmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG5cdFxufV0pIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
