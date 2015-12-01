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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguZmFjdG9yeS5qcyIsImNoYXQuZmFjdG9yeS5qcyIsInRhYlN0YXRlLmpzIiwiYWNjb3VudC9hY2NvdW50LmNvbnRyb2xsZXIuanMiLCJjaGF0L2NoYXQuY29udHJvbGxlci5qcyIsImNoYXQvdGFiLmNoYXQuc3RhdGUuanMiLCJkYXNoL2Rhc2guY29udHJvbGxlci5qcyIsImV2ZW50cy9ldmVudHMuY29udHJvbGxlci5qcyIsImV2ZW50cy9ldmVudHMuc3RhdGUuanMiLCJsb2dpbi9sb2dpbi5jb250cm9sbGVyLmpzIiwibG9naW4vbG9naW4uc3RhdGUuanMiLCJyb29tcy9jcmVhdGVOZXdSb29tLnN0YXRlLmpzIiwicm9vbXMvcm9vbXMuY29udHJvbGxlci5qcyIsInJvb21zL3Jvb21zLmZhY3RvcnkuanMiLCJyb29tcy9yb29tcy5zdGF0ZS5qcyIsInNldHRpbmdzL3NldHRpbmdzLmNvbnRyb2xsZXIuanMiLCJzZXR0aW5ncy9zZXR0aW5ncy5zdGF0ZS5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyLmNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy91c2VyLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLy8gSW9uaWMgU3RhcnRlciBBcHBcblxuLy8gYW5ndWxhci5tb2R1bGUgaXMgYSBnbG9iYWwgcGxhY2UgZm9yIGNyZWF0aW5nLCByZWdpc3RlcmluZyBhbmQgcmV0cmlldmluZyBBbmd1bGFyIG1vZHVsZXNcbi8vICdzdGFydGVyJyBpcyB0aGUgbmFtZSBvZiB0aGlzIGFuZ3VsYXIgbW9kdWxlIGV4YW1wbGUgKGFsc28gc2V0IGluIGEgPGJvZHk+IGF0dHJpYnV0ZSBpbiBpbmRleC5odG1sKVxuLy8gdGhlIDJuZCBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2YgJ3JlcXVpcmVzJ1xuLy8gJ3N0YXJ0ZXIuc2VydmljZXMnIGlzIGZvdW5kIGluIHNlcnZpY2VzLmpzXG4vLyAnc3RhcnRlci5jb250cm9sbGVycycgaXMgZm91bmQgaW4gY29udHJvbGxlcnMuanNcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlcicsIFsnaW9uaWMnLCBcImZpcmViYXNlXCIsIFwidWkucm91dGVyXCJdKVxuXG4gXG4gXG5hcHAucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgaWYgKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuXG4gICAgfVxuICAgIGlmICh3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICAvLyBvcmcuYXBhY2hlLmNvcmRvdmEuc3RhdHVzYmFyIHJlcXVpcmVkXG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG4gICAgfVxuICB9KTtcbn0pXG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gIC8vIGlmIG5vbmUgb2YgdGhlIGFib3ZlIHN0YXRlcyBhcmUgbWF0Y2hlZCwgdXNlIHRoaXMgYXMgdGhlIGZhbGxiYWNrXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9sb2dpbicpO1xufSk7XG4iLCJhcHAuZmFjdG9yeShcIkF1dGhGYWN0b3J5XCIsIGZ1bmN0aW9uKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgocmVmKTtcbiAgICB2YXIgdXNlcnMgPSByZWYuY2hpbGQoJ3VzZXJzJylcbiAgICB2YXIgcGhvbmVOdW1zID0gW11cbiAgICB1c2Vycy5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oYWxsVXNlcnMpIHtcbiAgICAgIGFsbFVzZXJzLmZvckVhY2goZnVuY3Rpb24ob25lVXNlcikge1xuICAgICAgICB2YXIgcGhvbmUgPSBvbmVVc2VyLmNoaWxkKCdwaG9uZScpLnZhbCgpLnJlcGxhY2UoL1xcRC8sIFwiXCIpO1xuICAgICAgICBwaG9uZU51bXMucHVzaChwaG9uZSlcbiAgICAgIH0pXG4gICAgfSlcbiAgICByZXR1cm4ge1xuICAgICAgc2lnblVwOiBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICBpZiAocGhvbmVOdW1zLmluZGV4T2YoY3JlZGVudGlhbHMucGhvbmUucmVwbGFjZSgvXFxELywgXCJcIikpID09PSAtMSkge1xuICAgICAgICAgIHJldHVybiBhdXRoLiRjcmVhdGVVc2VyKHtlbWFpbDogY3JlZGVudGlhbHMuZW1haWwsIHBhc3N3b3JkOiBjcmVkZW50aWFscy5wYXNzd29yZH0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXNlci5uYW1lID0gY3JlZGVudGlhbHMubmFtZTtcbiAgICAgICAgICAgIHVzZXIucGhvbmUgPSBjcmVkZW50aWFscy5waG9uZTtcbiAgICAgICAgICAgIHVzZXIuZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgICAgIHVzZXJzLmNoaWxkKHVzZXIudWlkKS5zZXQoe1xuICAgICAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgICAgIHBob25lOiB1c2VyLnBob25lLnJlcGxhY2UoL1xcRC8sIFwiXCIpLFxuICAgICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHBob25lTnVtcy5wdXNoKGNyZWRlbnRpYWxzLnBob25lLnJlcGxhY2UoL1xcRC8sIFwiXCIpKVxuICAgICAgICAgICAgcmV0dXJuIHVzZXJcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgICAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIHZhciBlbWFpbCA9IGNyZWRlbnRpYWxzLmVtYWlsO1xuICAgICAgICAgICAgdmFyIHBhc3N3b3JkID0gY3JlZGVudGlhbHMucGFzc3dvcmQ7XG4gICAgICAgICAgICByZXR1cm4gYXV0aC4kYXV0aFdpdGhQYXNzd29yZCh7XG4gICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGNvbnNvbGUuZXJyb3IpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRDdXJyZW50VXNlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiByZWYuZ2V0QXV0aCgpXG4gICAgICB9LFxuICAgICAgc2lnbkluOiBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICB2YXIgZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgdmFyIHBhc3N3b3JkID0gY3JlZGVudGlhbHMucGFzc3dvcmQ7XG4gICAgICAgIHJldHVybiBhdXRoLiRhdXRoV2l0aFBhc3N3b3JkKHtcbiAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChjb25zb2xlLmVycm9yKVxuICAgICAgfVxuICAgIH1cbiAgfSk7IiwiYXBwLmZhY3RvcnkoJ0NoYXRGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlLCBSb29tc0ZhY3RvcnksICRmaXJlYmFzZUFycmF5LCAkZmlyZWJhc2VPYmplY3QsIEF1dGhGYWN0b3J5KSB7XG5cbiAgdmFyIHNlbGVjdGVkUm9vbUlkO1xuICB2YXIgY2hhdHM7XG4gIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vJylcbiAgdmFyIHVzZXIgPSBBdXRoRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpLnVpZFxuICB2YXIgdXNlclJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbS91c2Vycy8nICsgdXNlcilcbiAgdmFyIHVzZXJPYmogPSAkZmlyZWJhc2VPYmplY3QodXNlclJlZilcblxuICByZXR1cm4ge1xuICAgIGFsbDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY2hhdHM7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uKGNoYXQpIHtcbiAgICAgIGNoYXRzLiRyZW1vdmUoY2hhdClcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgcmVmLmtleSgpID09PSBjaGF0LiRpZDtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbihjaGF0SWQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNoYXRzW2ldLmlkID09PSBwYXJzZUludChjaGF0SWQpKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYXRzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIGdldFNlbGVjdGVkUm9vbU5hbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzZWxlY3RlZFJvb207XG4gICAgICBpZiAoc2VsZWN0ZWRSb29tSWQgJiYgc2VsZWN0ZWRSb29tSWQgIT0gbnVsbCkge1xuICAgICAgICAgIHNlbGVjdGVkUm9vbSA9IFJvb21zRmFjdG9yeS5nZXQoc2VsZWN0ZWRSb29tSWQpO1xuICAgICAgICAgIGlmIChzZWxlY3RlZFJvb20pXG4gICAgICAgICAgICAgIHJldHVybiBzZWxlY3RlZFJvb20ubmFtZTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBzZWxlY3RSb29tOiBmdW5jdGlvbiAocm9vbUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2VsZWN0aW5nIHRoZSByb29tIHdpdGggaWQ6IFwiICsgcm9vbUlkKTtcbiAgICAgICAgc2VsZWN0ZWRSb29tSWQgPSByb29tSWQ7XG4gICAgICAgIGNoYXRzID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKCdtZXNzYWdlcycpLmNoaWxkKHNlbGVjdGVkUm9vbUlkKSk7XG4gICAgfSxcbiAgICBzZW5kOiBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRpbmcgbWVzc2FnZSBmcm9tIChpbnNlcnQgdXNlciBoZXJlKSAmIG1lc3NhZ2UgaXMgXCIgKyBtZXNzYWdlKTtcbiAgICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSB1c2VyJywgdXNlcilcbiAgICAgICAgICAgIHZhciBjaGF0TWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICB1c2VyOiB1c2VyLFxuICAgICAgICAgICAgICAgIGZyb206IHVzZXJPYmoubmFtZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgIHRpbWVzdGFtcDogRmlyZWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgY2hhdHMgcHJlJywgY2hhdHMpXG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyBjaGF0bWVzc2FnZScsIGNoYXRNZXNzYWdlKVxuICAgICAgICAgICAgLy9yZW1vdmVkIHZhbGlkYXRpb24gb2YgLndyaXRlIGFuZCAkb3RoZXJcbiAgICAgICAgICAgIGNoYXRzLiRhZGQoY2hhdE1lc3NhZ2UpLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1lc3NhZ2UgYWRkZWQgYW5kIHRoaXMgaXMgZGF0YSByZXR1cm5lZFwiLCBkYXRhKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yOlwiLCBlcnJvcik7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxuICB9O1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlclxuXHRcdC5zdGF0ZSgndGFiJywge1xuXHRcdHVybDogJy90YWInLFxuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdGNhY2hlOiBmYWxzZSxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL3RhYnMuaHRtbCdcblx0XHR9KVxufSkiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSkge1xuXG5cbnZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuXG4gICRzY29wZS5zZXR0aW5ncyA9IHtcbiAgICBlbmFibGVGcmllbmRzOiB0cnVlXG4gIH07XG4gIFxuICAkc2NvcGUucGxhY2VzID0gZnVuY3Rpb24oKSB7XG4gIFx0eWVscC5zZWFyY2goeyB0ZXJtOiAnbWV4aWNhbicsIGxvY2F0aW9uOiAnQnJvb2tseW4nIH0pXG4udGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICBjb25zb2xlLmxvZyhkYXRhKTtcbn0pXG4gIH1cblxufSk7XG4iLCJhcHAuY29udHJvbGxlcignQ2hhdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIENoYXRGYWN0b3J5LCAkc3RhdGVQYXJhbXMsIFJvb21zRmFjdG9yeSwgQXV0aEZhY3RvcnksICRmaXJlYmFzZU9iamVjdCkge1xuXG4gIHZhciBjdXJyVXNlciA9IEF1dGhGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCkudWlkXG4gIHZhciB1c2VyUmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL3VzZXJzLycgKyBjdXJyVXNlcilcbiAgdmFyIHVzZXJPYmogPSAkZmlyZWJhc2VPYmplY3QodXNlclJlZilcbiAgJHNjb3BlLklNID0ge1xuICAgIHRleHRNZXNzYWdlOiBcIlwiXG4gIH07XG5cbiAgLy8gJHNjb3BlLnJvb21OYW1lID0gY3VycmVudFJvb20uY2hpbGQoJ25hbWUnKVxuLy8gY29uc29sZS5sb2coJ3RoaXMgaXMgc3RhdGUgcGFyYW1zIGlkJywgJHN0YXRlUGFyYW1zLmlkKVxuICBDaGF0RmFjdG9yeS5zZWxlY3RSb29tKCRzdGF0ZVBhcmFtcy5pZCk7XG5cbiAgdmFyIHJvb21OYW1lID0gQ2hhdEZhY3RvcnkuZ2V0U2VsZWN0ZWRSb29tTmFtZSgpO1xuICBcbiAgaWYgKHJvb21OYW1lKSB7XG4gICAgICAkc2NvcGUucm9vbU5hbWUgPSBcIiAtIFwiICsgcm9vbU5hbWU7XG4gICAgICAkc2NvcGUuY2hhdHMgPSBDaGF0RmFjdG9yeS5hbGwoKTtcbiAgfVxuXG4gICRzY29wZS5zZW5kTWVzc2FnZSA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHVzZXJvYmonLCB1c2VyT2JqKVxuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgIENoYXRGYWN0b3J5LnNlbmQobXNnKTtcbiAgICAgICRzY29wZS5JTS50ZXh0TWVzc2FnZSA9IFwiXCI7XG4gIH1cblxuICAkc2NvcGUucmVtb3ZlID0gZnVuY3Rpb24gKGNoYXQpIHtcbiAgICAgIENoYXRGYWN0b3J5LnJlbW92ZShjaGF0KTtcbiAgfVxuXG4gICAgLy8gJHNjb3BlLnNlbmRDaGF0ID0gZnVuY3Rpb24gKGNoYXQpe1xuICAgIC8vICAgaWYgKCRyb290U2NvcGUudXNlcikge1xuICAgIC8vICAgICAvLyBjb25zb2xlLmxvZygndGhpcyBpcyB1c2VyJywgJHJvb3RTY29wZS51c2VyKVxuICAgIC8vICAgICAkc2NvcGUuY2hhdHMuJGFkZCh7XG4gICAgLy8gICAgICAgdXNlcjogJHJvb3RTY29wZS51c2VyLFxuICAgIC8vICAgICAgIG1lc3NhZ2U6IGNoYXQubWVzc2FnZVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIGNoYXQubWVzc2FnZSA9IFwiXCI7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuIH0pXG5cbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5jaGF0Jywge1xuICAgIHVybDogJy9jaGF0LzppZCcsXG4gICAgdmlld3M6IHtcbiAgICAgICdyb29tc1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY2hhdC9jaGF0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2hhdEN0cmwnXG4gICAgICB9XG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICAvLyBjdXJyZW50Um9vbTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgJGZpcmViYXNlT2JqKSB7XG4gICAgICAvLyAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vZ3JvdXBzLycgKyAkc3RhdGVQYXJhbXMuaWQpXG4gICAgICAvLyAgIHJldHVybiAkZmlyZWJhc2VPYmoocmVmKVxuICAgICAgLy8gfVxuXG5cbiAgICB9XG4gIH0pXG59KTsiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignRGFzaEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSkge1xuXHQkc3RhdGUuZ28oJ3RhYi5jaGF0cycpXG59KSIsImFwcC5jb250cm9sbGVyKCdFdmVudHNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBSb29tc0ZhY3RvcnksIENoYXRGYWN0b3J5LCAkc3RhdGUpIHtcblxuXG4gfSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLmV2ZW50cycsIHtcbiAgICB1cmw6ICcvZXZlbnRzJyxcbiAgICB2aWV3czoge1xuICAgICAgJ2V2ZW50c1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZXZlbnRzL2V2ZW50cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0V2ZW50c0N0cmwnXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAkc2NvcGUuY29udGFjdHMgPSBbXCJwZXJzb24xXCIsIFwicGVyc29uMlwiLCBcInBlcnNvbjNcIl07XG4gICRzY29wZS5jaGF0cyA9IFtcImJhcnRcIiwgXCJ3aGlza2V5XCIsIFwibGxvb1wiXTtcbn0pXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgnbG9naW4nLCB7XG4gICAgdXJsOiAnL2xvZ2luJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnUmVnaXN0ZXJDdHJsJ1xuICB9KVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5jcmVhdGVOZXdSb29tJywge1xuICAgIHVybDogJy9jcmVhdGVOZXdSb29tJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3Jvb21zVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9yb29tcy9jcmVhdGVOZXdSb29tLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUm9vbXNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsImFwcC5jb250cm9sbGVyKCdSb29tc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIFJvb21zRmFjdG9yeSwgQ2hhdEZhY3RvcnksICRzdGF0ZSkge1xuXG4gICAgLy8gJGlvbmljTW9kYWwuZnJvbVRlbXBsYXRlVXJsKCdqcy9sb2dpbi9sb2dpbi5odG1sJywge1xuICAgIC8vICAgICBzY29wZTogJHNjb3BlLFxuICAgIC8vICAgICBhbmltYXRpb246ICdzbGlkZS1pbi11cCdcbiAgICAvLyB9KVxuICAgIC8vIC50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgIC8vICRzY29wZS5tb2RhbCA9IG1vZGFsO1xuICAgIC8vIH0pO1xuXG4gICAgJHNjb3BlLnJvb21zID0gUm9vbXNGYWN0b3J5LmFsbCgpO1xuXG4gICAgJHNjb3BlLmNyZWF0ZVJvb20gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygndGFiLmNyZWF0ZU5ld1Jvb20nKTtcbiAgICB9XG5cbiAgICAkc2NvcGUub3BlblJvb20gPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIGlkIGluIG9wZW4nLCBpZClcbiAgICAgICRzdGF0ZS5nbygndGFiLmNoYXQnLCB7XG4gICAgICAgIGlkOiBpZFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmFkZENvbnRhY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vYWRkIHRvIGZpcmViYXNlIGFycmF5IGluIHJvb21zZmFjdG9yeVxuICAgIH1cblxuICAgICRzY29wZS5zYXZlTmV3Um9vbSA9IGZ1bmN0aW9uIChyb29tT2JqKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSByb29tb2JqIGluIHNhdmUnLCByb29tT2JqKVxuICAgICAgICByZXR1cm4gUm9vbXNGYWN0b3J5LmFkZChyb29tT2JqKS50aGVuKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgaWQgaW4gc2F2ZScsIGlkKVxuICAgICAgICAgICAgJHNjb3BlLm9wZW5Sb29tKGlkKTtcbiAgICAgICAgICAgIC8vICRzdGF0ZS5nbygndGFiLmNoYXQnLCB7aWQ6IGlkfSlcbiAgICAgICAgfSlcblxuICAgICAgICBcbiAgICAgICAgLy9hZGQgdG8gZmlyZWJhc2UgYXJyYXkgaW4gcm9vbXNmYWN0b3J5XG4gICAgfVxuXG4gICAgLy8gJHNjb3BlLnNlbmRDaGF0ID0gZnVuY3Rpb24gKGNoYXQpe1xuICAgIC8vICAgaWYgKCRyb290U2NvcGUudXNlcikge1xuICAgIC8vICAgICAvLyBjb25zb2xlLmxvZygndGhpcyBpcyB1c2VyJywgJHJvb3RTY29wZS51c2VyKVxuICAgIC8vICAgICAkc2NvcGUuY2hhdHMuJGFkZCh7XG4gICAgLy8gICAgICAgdXNlcjogJHJvb3RTY29wZS51c2VyLFxuICAgIC8vICAgICAgIG1lc3NhZ2U6IGNoYXQubWVzc2FnZVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIGNoYXQubWVzc2FnZSA9IFwiXCI7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuIH0pXG4iLCJhcHAuZmFjdG9yeSgnUm9vbXNGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZUF1dGgsIEF1dGhGYWN0b3J5KSB7XG5cbiAgdmFyIHJvb21zUmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL2dyb3Vwcy8nKVxuICB2YXIgcm9vbXNBcnIgPSAkZmlyZWJhc2VBcnJheShyb29tc1JlZik7XG4gIC8vIHZhciByb29tc0FyciA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnZ3JvdXBzJykpO1xuICAvLyB2YXIgcm9vbXNSZWYgPSByZWYuY2hpbGQoJ2dyb3VwcycpXG4gIHZhciBjdXJyVXNlck9iaiA9IEF1dGhGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCk7XG4gIHZhciBjdXJyVXNlciA9IEF1dGhGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCkudWlkXG4gIHZhciBjdXJyVXNlclJvb21zID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL3VzZXJzLycgKyBjdXJyVXNlciArICcvZ3JvdXBzJylcbiAgdmFyIHVzZXJSZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vdXNlcnMvJyArIGN1cnJVc2VyKVxuXG4gIHJldHVybiB7XG5cbiAgICBhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJvb21zQXJyO1xuICAgIH0sXG4gICBcbiAgICBnZXQ6IGZ1bmN0aW9uKHJvb21JZCkge1xuICAgICAgcmV0dXJuIHJvb21zQXJyLiRnZXRSZWNvcmQocm9vbUlkKTtcbiAgICB9LFxuXG4gICAgYWRkOiBmdW5jdGlvbihyb29tT2JqKSB7XG4gICAgICByZXR1cm4gcm9vbXNBcnIuJGFkZChyb29tT2JqKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlZikge1xuICAgICAgICB2YXIgaWQgPSByZWYua2V5KCk7XG4gICAgICAgIGN1cnJVc2VyUm9vbXMuY2hpbGQoaWQpLnNldCh7bmFtZTogcm9vbU9iai5uYW1lfSlcbiAgICAgICAgLy9yZW1vdmVkIHZhbGlkYXRpb24gb2YgdXNlcl9pZCA9IHVzZXIgdWlkXG4gICAgICAgICRmaXJlYmFzZUFycmF5KHJvb21zUmVmLmNoaWxkKGlkKS5jaGlsZCgnbWVtYmVycycpKS4kYWRkKHtcbiAgICAgICAgICBpZDogY3VyclVzZXJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIHRoZSBkYXRhJywgZGF0YSlcbiAgICAgICAgfSlcbiAgICAgXG4gICAgICAgIHJldHVybiBpZDtcbiAgICAgIH0pXG4gICAgICAgIC8vc3RhdGUuZ28gdG8gY2hhdCBkZXRhaWwgd2l0aCBuZXcgaWRcblxuICAgIH1cbiAgfTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5yb29tcycsIHtcbiAgICB1cmw6ICcvcm9vbXMnLFxuICAgIHZpZXdzOiB7XG4gICAgICAncm9vbXNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Jvb21zL3Jvb21zLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUm9vbXNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgICAvLyByZXNvbHZlOiB7XG4gICAgLy8gICAgIFwiY3VycmVudEF1dGhcIjogW1wiQXV0aFwiLFxuICAgIC8vICAgICAgICAgZnVuY3Rpb24gKEF1dGgpIHtcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gQXV0aC4kd2FpdEZvckF1dGgoKTtcbiAgICAvLyB9XX1cbiAgfSlcbn0pOyIsIi8vIGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyLmNvbnRyb2xsZXJzJywgW10pXG5cbmFwcC5jb250cm9sbGVyKCdTZXR0aW5nc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGN1cnJlbnRVc2VyLCAkc3RhdGUpIHtcblxudmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG5cbiAgJHNjb3BlLnVzZXIgPSBjdXJyZW50VXNlcjtcblxuICAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICBcdHJlZi51bmF1dGgoKTtcbiAgXHQkc3RhdGUuZ28oJ2xvZ2luJylcbiAgfVxuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHVybFJvdXRlclByb3ZpZGVyLCAkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5zZXR0aW5ncycsIHtcbiAgICB1cmw6ICcvc2V0dGluZ3MvOnVpZCcsXG4gICAgdmlld3M6IHtcbiAgICAgICdzZXR0aW5nc1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc2V0dGluZ3MvdXNlckluZm8uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTZXR0aW5nc0N0cmwnXG4gICAgICB9XG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBjdXJyZW50VXNlcjogZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VPYmplY3QpIHtcbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbS91c2Vycy8nICsgJHN0YXRlUGFyYW1zLnVpZClcbiAgICAgICAgdmFyIHVzZXIgPSAkZmlyZWJhc2VPYmplY3QocmVmKVxuICAgICAgICByZXR1cm4gdXNlclxuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsImFwcC5jb250cm9sbGVyKCdSZWdpc3RlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRmaXJlYmFzZUF1dGgsIEF1dGhGYWN0b3J5LCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY1BvcHVwKSB7XG4gICAgXG4gICAgLy8gJGlvbmljTW9kYWwuZnJvbVRlbXBsYXRlVXJsKCdqcy9sb2dpbi9sb2dpbi5odG1sJywge1xuICAgIC8vIHNjb3BlOiAkc2NvcGUgfSlcbiAgICAvLyAudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAvLyAkc2NvcGUubW9kYWwgPSBtb2RhbDtcbiAgICAvLyB9KTtcblxuXG4gICAgJHNjb3BlLnNpZ25VcCA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmICghQXV0aEZhY3Rvcnkuc2lnblVwKGNyZWRlbnRpYWxzKSkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnSW52YWxpZCBjcmVkZW50aWFscycsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6ICdUaGF0IG51bWJlciBvciBlbWFpbCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQhIFBsZWFzZSB0cnkgYWdhaW4gOiknXG4gICAgICAgICAgICB9KSAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgQXV0aEZhY3Rvcnkuc2lnblVwKGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLnJvb21zJywge3VpZDogdXNlci51aWR9KVxuICAgICAgICAgICAgfSkgICAgXG4gICAgICAgIH1cbiAgICB9XG4gICAgJHNjb3BlLnNpZ25JbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmIChBdXRoRmFjdG9yeS5zaWduSW4oY3JlZGVudGlhbHMpLmVycm9yKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIGxvZ2luJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJ09vcHMsIHlvdSBtaWdodCBoYXZlIHNwZWxsZWQgc29tZXRoaW5nIHdyb25nISBQbGVhc2UgdHJ5IGFnYWluIDopJ1xuICAgICAgICAgICAgfSkgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIEF1dGhGYWN0b3J5LnNpZ25JbihjcmVkZW50aWFscylcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3RhYi5yb29tcycsIHt1aWQ6IHVzZXIudWlkfSlcbiAgICAgICAgICAgIH0pICAgIFxuICAgICAgICB9XG4gICAgfVxufSkiLCJhcHAuY29udHJvbGxlcignVXNlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIEF1dGhGYWN0b3J5KSB7XG5cdHZhciB1c2VyUmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL3VzZXJzLycgKyBBdXRoRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpLnVpZClcbn0pIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
