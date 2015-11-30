'use strict';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
window.app = angular.module('starter', ['ionic', "firebase"])

 
 
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
  $urlRouterProvider.otherwise('/tab/login');
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
        console.log(ref.getAuth())
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
app.controller('ChatCtrl', function($scope, ChatFactory, $stateParams, RoomsFactory) {

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

app.config(function($urlRouterProvider, $stateProvider) {
  $stateProvider
  .state('tab.login', {
    url: '/login',
    views: {
      'loginView': {
        templateUrl: 'js/login/login.html',
        controller: 'RegisterCtrl'
      }
    }
    // resolve: {
    //     // controller will not be loaded until $waitForAuth resolves
    //     "currentAuth": ["Auth",
    //         function (Auth) {
    //             return Auth.$waitForAuth();
    // }]}
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
// angular.module('starter.controllers', [])

app.controller('SettingsCtrl', function($scope, currentUser) {
  $scope.user = currentUser
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
  var currUser = AuthFactory.getCurrentUser().uid
  var currUserRooms = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser + '/groups')

  return {

    all: function() {
      return roomsArr;
    },
   
    get: function(roomId) {
      return roomsArr.$getRecord(roomId);
    },

    add: function(roomObj) {
      console.log('this is roomobj in fac', roomObj)
      return roomsArr.$add(roomObj)
      .then(function (ref) {
        console.log('this is the ref', ref)
        var id = ref.key();
        console.log('this is the id in fac', id)
        currUserRooms.child(id).set({name: roomObj.name})
        $firebaseArray(roomsRef.child(id).child('members')).$add(currUser) //also want to add all selected users
        return id;
      })
        // console.log('added record with id' + id);
        // return rooms.$indexFor(id);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguZmFjdG9yeS5qcyIsImNoYXQuZmFjdG9yeS5qcyIsInRhYlN0YXRlLmpzIiwiY2hhdC9jaGF0LmNvbnRyb2xsZXIuanMiLCJjaGF0L3RhYi5jaGF0LnN0YXRlLmpzIiwibG9naW4vbG9naW4uY29udHJvbGxlci5qcyIsImxvZ2luL2xvZ2luLnN0YXRlLmpzIiwiZXZlbnRzL2V2ZW50cy5jb250cm9sbGVyLmpzIiwiZXZlbnRzL2V2ZW50cy5zdGF0ZS5qcyIsInNldHRpbmdzL3NldHRpbmdzLmNvbnRyb2xsZXIuanMiLCJzZXR0aW5ncy9zZXR0aW5ncy5zdGF0ZS5qcyIsInJvb21zL2NyZWF0ZU5ld1Jvb20uc3RhdGUuanMiLCJyb29tcy9yb29tcy5jb250cm9sbGVyLmpzIiwicm9vbXMvcm9vbXMuZmFjdG9yeS5qcyIsInJvb21zL3Jvb21zLnN0YXRlLmpzIiwiY29udHJvbGxlcnMvcmVnaXN0ZXIuY29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL3VzZXIuY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLy8gSW9uaWMgU3RhcnRlciBBcHBcblxuLy8gYW5ndWxhci5tb2R1bGUgaXMgYSBnbG9iYWwgcGxhY2UgZm9yIGNyZWF0aW5nLCByZWdpc3RlcmluZyBhbmQgcmV0cmlldmluZyBBbmd1bGFyIG1vZHVsZXNcbi8vICdzdGFydGVyJyBpcyB0aGUgbmFtZSBvZiB0aGlzIGFuZ3VsYXIgbW9kdWxlIGV4YW1wbGUgKGFsc28gc2V0IGluIGEgPGJvZHk+IGF0dHJpYnV0ZSBpbiBpbmRleC5odG1sKVxuLy8gdGhlIDJuZCBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2YgJ3JlcXVpcmVzJ1xuLy8gJ3N0YXJ0ZXIuc2VydmljZXMnIGlzIGZvdW5kIGluIHNlcnZpY2VzLmpzXG4vLyAnc3RhcnRlci5jb250cm9sbGVycycgaXMgZm91bmQgaW4gY29udHJvbGxlcnMuanNcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlcicsIFsnaW9uaWMnLCBcImZpcmViYXNlXCJdKVxuXG4gXG4gXG5hcHAucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgaWYgKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuXG4gICAgfVxuICAgIGlmICh3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICAvLyBvcmcuYXBhY2hlLmNvcmRvdmEuc3RhdHVzYmFyIHJlcXVpcmVkXG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG4gICAgfVxuICB9KTtcbn0pXG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gIC8vIGlmIG5vbmUgb2YgdGhlIGFib3ZlIHN0YXRlcyBhcmUgbWF0Y2hlZCwgdXNlIHRoaXMgYXMgdGhlIGZhbGxiYWNrXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy90YWIvbG9naW4nKTtcbn0pO1xuIiwiYXBwLmZhY3RvcnkoXCJBdXRoRmFjdG9yeVwiLCBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QsICRmaXJlYmFzZUF1dGgsICRmaXJlYmFzZUFycmF5KSB7XG4gICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG4gICAgdmFyIGF1dGggPSAkZmlyZWJhc2VBdXRoKHJlZik7XG4gICAgdmFyIHVzZXJzID0gcmVmLmNoaWxkKCd1c2VycycpXG4gICAgcmV0dXJuIHtcbiAgICAgIHNpZ25VcDogZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgcmV0dXJuIGF1dGguJGNyZWF0ZVVzZXIoe2VtYWlsOiBjcmVkZW50aWFscy5lbWFpbCwgcGFzc3dvcmQ6IGNyZWRlbnRpYWxzLnBhc3N3b3JkfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgIHVzZXIubmFtZSA9IGNyZWRlbnRpYWxzLm5hbWU7XG4gICAgICAgICAgdXNlci5waG9uZSA9IGNyZWRlbnRpYWxzLnBob25lO1xuICAgICAgICAgIHVzZXIuZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgICB1c2Vycy5jaGlsZCh1c2VyLnVpZCkuc2V0KHtcbiAgICAgICAgICAgIG5hbWU6IHVzZXIubmFtZSxcbiAgICAgICAgICAgIHBob25lOiB1c2VyLnBob25lLFxuICAgICAgICAgICAgZW1haWw6IHVzZXIuZW1haWxcbiAgICAgICAgICB9KVxuICAgICAgICAgIHJldHVybiB1c2VyXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBlbWFpbCA9IGNyZWRlbnRpYWxzLmVtYWlsO1xuICAgICAgICAgIHZhciBwYXNzd29yZCA9IGNyZWRlbnRpYWxzLnBhc3N3b3JkO1xuICAgICAgICAgIHJldHVybiBhdXRoLiRhdXRoV2l0aFBhc3N3b3JkKHtcbiAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZFxuICAgICAgICAgIH0pXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChjb25zb2xlLmVycm9yKVxuICAgICAgfSxcbiAgICAgIGdldEN1cnJlbnRVc2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVmLmdldEF1dGgoKSlcbiAgICAgICAgcmV0dXJuIHJlZi5nZXRBdXRoKClcbiAgICAgIH0sXG4gICAgICBzaWduSW46IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIHZhciBlbWFpbCA9IGNyZWRlbnRpYWxzLmVtYWlsO1xuICAgICAgICB2YXIgcGFzc3dvcmQgPSBjcmVkZW50aWFscy5wYXNzd29yZDtcbiAgICAgICAgcmV0dXJuIGF1dGguJGF1dGhXaXRoUGFzc3dvcmQoe1xuICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGNvbnNvbGUuZXJyb3IpXG4gICAgICB9XG4gICAgfVxuICB9KTsiLCJhcHAuZmFjdG9yeSgnQ2hhdEZhY3RvcnknLCBmdW5jdGlvbigkZmlyZWJhc2UsIFJvb21zRmFjdG9yeSwgJGZpcmViYXNlQXJyYXksIEF1dGhGYWN0b3J5KSB7XG5cbiAgdmFyIHNlbGVjdGVkUm9vbUlkO1xuICB2YXIgY2hhdHM7XG4gIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vJylcbiAgdmFyIHVzZXIgPSBBdXRoRmFjdG9yeS5nZXRDdXJyZW50VXNlcigpLnVpZFxuICByZXR1cm4ge1xuICAgIGFsbDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY2hhdHM7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uKGNoYXQpIHtcbiAgICAgIGNoYXRzLiRyZW1vdmUoY2hhdClcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgcmVmLmtleSgpID09PSBjaGF0LiRpZDtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbihjaGF0SWQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNoYXRzW2ldLmlkID09PSBwYXJzZUludChjaGF0SWQpKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYXRzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIGdldFNlbGVjdGVkUm9vbU5hbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzZWxlY3RlZFJvb207XG4gICAgICBpZiAoc2VsZWN0ZWRSb29tSWQgJiYgc2VsZWN0ZWRSb29tSWQgIT0gbnVsbCkge1xuICAgICAgICAgIHNlbGVjdGVkUm9vbSA9IFJvb21zRmFjdG9yeS5nZXQoc2VsZWN0ZWRSb29tSWQpO1xuICAgICAgICAgIGlmIChzZWxlY3RlZFJvb20pXG4gICAgICAgICAgICAgIHJldHVybiBzZWxlY3RlZFJvb20ubmFtZTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBzZWxlY3RSb29tOiBmdW5jdGlvbiAocm9vbUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2VsZWN0aW5nIHRoZSByb29tIHdpdGggaWQ6IFwiICsgcm9vbUlkKTtcbiAgICAgICAgc2VsZWN0ZWRSb29tSWQgPSByb29tSWQ7XG4gICAgICAgIGNoYXRzID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKCdtZXNzYWdlcycpLmNoaWxkKHNlbGVjdGVkUm9vbUlkKSk7XG4gICAgfSxcbiAgICBzZW5kOiBmdW5jdGlvbiAobWVzc2FnZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmRpbmcgbWVzc2FnZSBmcm9tIChpbnNlcnQgdXNlciBoZXJlKSAmIG1lc3NhZ2UgaXMgXCIgKyBtZXNzYWdlKTtcbiAgICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSB1c2VyJywgdXNlcilcbiAgICAgICAgICAgIHZhciBjaGF0TWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICB1c2VyOiB1c2VyLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiBGaXJlYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyBjaGF0cyBwcmUnLCBjaGF0cylcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIGNoYXRtZXNzYWdlJywgY2hhdE1lc3NhZ2UpXG4gICAgICAgICAgICBjaGF0cy4kYWRkKGNoYXRNZXNzYWdlKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJtZXNzYWdlIGFkZGVkIGFuZCB0aGlzIGlzIGRhdGEgcmV0dXJuZWRcIiwgZGF0YSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvcjpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbiAgfTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXJcblx0XHQuc3RhdGUoJ3RhYicsIHtcblx0XHR1cmw6ICcvdGFiJyxcblx0XHRhYnN0cmFjdDogdHJ1ZSxcblx0XHRjYWNoZTogZmFsc2UsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy90YWJzLmh0bWwnXG5cdFx0fSlcbn0pIiwiYXBwLmNvbnRyb2xsZXIoJ0NoYXRDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBDaGF0RmFjdG9yeSwgJHN0YXRlUGFyYW1zLCBSb29tc0ZhY3RvcnkpIHtcblxuICAkc2NvcGUuSU0gPSB7XG4gICAgdGV4dE1lc3NhZ2U6IFwiXCJcbiAgfTtcblxuICAvLyAkc2NvcGUucm9vbU5hbWUgPSBjdXJyZW50Um9vbS5jaGlsZCgnbmFtZScpXG4vLyBjb25zb2xlLmxvZygndGhpcyBpcyBzdGF0ZSBwYXJhbXMgaWQnLCAkc3RhdGVQYXJhbXMuaWQpXG4gIENoYXRGYWN0b3J5LnNlbGVjdFJvb20oJHN0YXRlUGFyYW1zLmlkKTtcblxuICB2YXIgcm9vbU5hbWUgPSBDaGF0RmFjdG9yeS5nZXRTZWxlY3RlZFJvb21OYW1lKCk7XG4gIFxuICBpZiAocm9vbU5hbWUpIHtcbiAgICAgICRzY29wZS5yb29tTmFtZSA9IFwiIC0gXCIgKyByb29tTmFtZTtcbiAgICAgICRzY29wZS5jaGF0cyA9IENoYXRGYWN0b3J5LmFsbCgpO1xuICB9XG5cbiAgJHNjb3BlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24gKG1zZykge1xuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgIENoYXRGYWN0b3J5LnNlbmQobXNnKTtcbiAgICAgICRzY29wZS5JTS50ZXh0TWVzc2FnZSA9IFwiXCI7XG4gIH1cblxuICAkc2NvcGUucmVtb3ZlID0gZnVuY3Rpb24gKGNoYXQpIHtcbiAgICAgIENoYXRGYWN0b3J5LnJlbW92ZShjaGF0KTtcbiAgfVxuXG4gICAgLy8gJHNjb3BlLnNlbmRDaGF0ID0gZnVuY3Rpb24gKGNoYXQpe1xuICAgIC8vICAgaWYgKCRyb290U2NvcGUudXNlcikge1xuICAgIC8vICAgICAvLyBjb25zb2xlLmxvZygndGhpcyBpcyB1c2VyJywgJHJvb3RTY29wZS51c2VyKVxuICAgIC8vICAgICAkc2NvcGUuY2hhdHMuJGFkZCh7XG4gICAgLy8gICAgICAgdXNlcjogJHJvb3RTY29wZS51c2VyLFxuICAgIC8vICAgICAgIG1lc3NhZ2U6IGNoYXQubWVzc2FnZVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIGNoYXQubWVzc2FnZSA9IFwiXCI7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuIH0pXG5cbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5jaGF0Jywge1xuICAgIHVybDogJy9jaGF0LzppZCcsXG4gICAgdmlld3M6IHtcbiAgICAgICdyb29tc1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY2hhdC9jaGF0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2hhdEN0cmwnXG4gICAgICB9XG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICAvLyBjdXJyZW50Um9vbTogZnVuY3Rpb24gKCRzdGF0ZVBhcmFtcywgJGZpcmViYXNlT2JqKSB7XG4gICAgICAvLyAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vZ3JvdXBzLycgKyAkc3RhdGVQYXJhbXMuaWQpXG4gICAgICAvLyAgIHJldHVybiAkZmlyZWJhc2VPYmoocmVmKVxuICAgICAgLy8gfVxuXG5cbiAgICB9XG4gIH0pXG59KTsiLCJhcHAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICRzY29wZS5jb250YWN0cyA9IFtcInBlcnNvbjFcIiwgXCJwZXJzb24yXCIsIFwicGVyc29uM1wiXTtcbiAgJHNjb3BlLmNoYXRzID0gW1wiYmFydFwiLCBcIndoaXNrZXlcIiwgXCJsbG9vXCJdO1xufSlcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHVybFJvdXRlclByb3ZpZGVyLCAkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5sb2dpbicsIHtcbiAgICB1cmw6ICcvbG9naW4nLFxuICAgIHZpZXdzOiB7XG4gICAgICAnbG9naW5WaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUmVnaXN0ZXJDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgICAvLyByZXNvbHZlOiB7XG4gICAgLy8gICAgIC8vIGNvbnRyb2xsZXIgd2lsbCBub3QgYmUgbG9hZGVkIHVudGlsICR3YWl0Rm9yQXV0aCByZXNvbHZlc1xuICAgIC8vICAgICBcImN1cnJlbnRBdXRoXCI6IFtcIkF1dGhcIixcbiAgICAvLyAgICAgICAgIGZ1bmN0aW9uIChBdXRoKSB7XG4gICAgLy8gICAgICAgICAgICAgcmV0dXJuIEF1dGguJHdhaXRGb3JBdXRoKCk7XG4gICAgLy8gfV19XG4gIH0pXG59KTsiLCJhcHAuY29udHJvbGxlcignRXZlbnRzQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgUm9vbXNGYWN0b3J5LCBDaGF0RmFjdG9yeSwgJHN0YXRlKSB7XG5cblxuIH0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5ldmVudHMnLCB7XG4gICAgdXJsOiAnL2V2ZW50cycsXG4gICAgdmlld3M6IHtcbiAgICAgICdldmVudHNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2V2ZW50cy9ldmVudHMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdFdmVudHNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsIi8vIGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyLmNvbnRyb2xsZXJzJywgW10pXG5cbmFwcC5jb250cm9sbGVyKCdTZXR0aW5nc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGN1cnJlbnRVc2VyKSB7XG4gICRzY29wZS51c2VyID0gY3VycmVudFVzZXJcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkdXJsUm91dGVyUHJvdmlkZXIsICRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLnNldHRpbmdzJywge1xuICAgIHVybDogJy9zZXR0aW5ncy86dWlkJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3NldHRpbmdzVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9zZXR0aW5ncy91c2VySW5mby5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1NldHRpbmdzQ3RybCdcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGN1cnJlbnRVc2VyOiBmdW5jdGlvbigkc3RhdGVQYXJhbXMsICRmaXJlYmFzZU9iamVjdCkge1xuICAgICAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL3VzZXJzLycgKyAkc3RhdGVQYXJhbXMudWlkKVxuICAgICAgICB2YXIgdXNlciA9ICRmaXJlYmFzZU9iamVjdChyZWYpXG4gICAgICAgIHJldHVybiB1c2VyXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5jcmVhdGVOZXdSb29tJywge1xuICAgIHVybDogJy9jcmVhdGVOZXdSb29tJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3Jvb21zVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9yb29tcy9jcmVhdGVOZXdSb29tLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUm9vbXNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsImFwcC5jb250cm9sbGVyKCdSb29tc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIFJvb21zRmFjdG9yeSwgQ2hhdEZhY3RvcnksICRzdGF0ZSkge1xuXG4gICAgLy8gJGlvbmljTW9kYWwuZnJvbVRlbXBsYXRlVXJsKCdqcy9sb2dpbi9sb2dpbi5odG1sJywge1xuICAgIC8vICAgICBzY29wZTogJHNjb3BlLFxuICAgIC8vICAgICBhbmltYXRpb246ICdzbGlkZS1pbi11cCdcbiAgICAvLyB9KVxuICAgIC8vIC50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgIC8vICRzY29wZS5tb2RhbCA9IG1vZGFsO1xuICAgIC8vIH0pO1xuXG4gICAgJHNjb3BlLnJvb21zID0gUm9vbXNGYWN0b3J5LmFsbCgpO1xuXG4gICAgJHNjb3BlLmNyZWF0ZVJvb20gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygndGFiLmNyZWF0ZU5ld1Jvb20nKTtcbiAgICB9XG5cbiAgICAkc2NvcGUub3BlblJvb20gPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIGlkIGluIG9wZW4nLCBpZClcbiAgICAgICRzdGF0ZS5nbygndGFiLmNoYXQnLCB7XG4gICAgICAgIGlkOiBpZFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmFkZENvbnRhY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vYWRkIHRvIGZpcmViYXNlIGFycmF5IGluIHJvb21zZmFjdG9yeVxuICAgIH1cblxuICAgICRzY29wZS5zYXZlTmV3Um9vbSA9IGZ1bmN0aW9uIChyb29tT2JqKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSByb29tb2JqIGluIHNhdmUnLCByb29tT2JqKVxuICAgICAgICByZXR1cm4gUm9vbXNGYWN0b3J5LmFkZChyb29tT2JqKS50aGVuKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgaWQgaW4gc2F2ZScsIGlkKVxuICAgICAgICAgICAgJHNjb3BlLm9wZW5Sb29tKGlkKTtcbiAgICAgICAgICAgIC8vICRzdGF0ZS5nbygndGFiLmNoYXQnLCB7aWQ6IGlkfSlcbiAgICAgICAgfSlcblxuICAgICAgICBcbiAgICAgICAgLy9hZGQgdG8gZmlyZWJhc2UgYXJyYXkgaW4gcm9vbXNmYWN0b3J5XG4gICAgfVxuXG4gICAgLy8gJHNjb3BlLnNlbmRDaGF0ID0gZnVuY3Rpb24gKGNoYXQpe1xuICAgIC8vICAgaWYgKCRyb290U2NvcGUudXNlcikge1xuICAgIC8vICAgICAvLyBjb25zb2xlLmxvZygndGhpcyBpcyB1c2VyJywgJHJvb3RTY29wZS51c2VyKVxuICAgIC8vICAgICAkc2NvcGUuY2hhdHMuJGFkZCh7XG4gICAgLy8gICAgICAgdXNlcjogJHJvb3RTY29wZS51c2VyLFxuICAgIC8vICAgICAgIG1lc3NhZ2U6IGNoYXQubWVzc2FnZVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIGNoYXQubWVzc2FnZSA9IFwiXCI7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuIH0pXG4iLCJhcHAuZmFjdG9yeSgnUm9vbXNGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlQXJyYXksICRmaXJlYmFzZUF1dGgsIEF1dGhGYWN0b3J5KSB7XG5cbiAgdmFyIHJvb21zUmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL2dyb3Vwcy8nKVxuICB2YXIgcm9vbXNBcnIgPSAkZmlyZWJhc2VBcnJheShyb29tc1JlZik7XG4gIC8vIHZhciByb29tc0FyciA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnZ3JvdXBzJykpO1xuICAvLyB2YXIgcm9vbXNSZWYgPSByZWYuY2hpbGQoJ2dyb3VwcycpXG4gIHZhciBjdXJyVXNlciA9IEF1dGhGYWN0b3J5LmdldEN1cnJlbnRVc2VyKCkudWlkXG4gIHZhciBjdXJyVXNlclJvb21zID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL3VzZXJzLycgKyBjdXJyVXNlciArICcvZ3JvdXBzJylcblxuICByZXR1cm4ge1xuXG4gICAgYWxsOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByb29tc0FycjtcbiAgICB9LFxuICAgXG4gICAgZ2V0OiBmdW5jdGlvbihyb29tSWQpIHtcbiAgICAgIHJldHVybiByb29tc0Fyci4kZ2V0UmVjb3JkKHJvb21JZCk7XG4gICAgfSxcblxuICAgIGFkZDogZnVuY3Rpb24ocm9vbU9iaikge1xuICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgcm9vbW9iaiBpbiBmYWMnLCByb29tT2JqKVxuICAgICAgcmV0dXJuIHJvb21zQXJyLiRhZGQocm9vbU9iailcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIHJlZicsIHJlZilcbiAgICAgICAgdmFyIGlkID0gcmVmLmtleSgpO1xuICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgaWQgaW4gZmFjJywgaWQpXG4gICAgICAgIGN1cnJVc2VyUm9vbXMuY2hpbGQoaWQpLnNldCh7bmFtZTogcm9vbU9iai5uYW1lfSlcbiAgICAgICAgJGZpcmViYXNlQXJyYXkocm9vbXNSZWYuY2hpbGQoaWQpLmNoaWxkKCdtZW1iZXJzJykpLiRhZGQoY3VyclVzZXIpIC8vYWxzbyB3YW50IHRvIGFkZCBhbGwgc2VsZWN0ZWQgdXNlcnNcbiAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgfSlcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2FkZGVkIHJlY29yZCB3aXRoIGlkJyArIGlkKTtcbiAgICAgICAgLy8gcmV0dXJuIHJvb21zLiRpbmRleEZvcihpZCk7XG4gICAgICAgIC8vc3RhdGUuZ28gdG8gY2hhdCBkZXRhaWwgd2l0aCBuZXcgaWRcblxuICAgIH1cbiAgfTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5yb29tcycsIHtcbiAgICB1cmw6ICcvcm9vbXMnLFxuICAgIHZpZXdzOiB7XG4gICAgICAncm9vbXNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Jvb21zL3Jvb21zLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUm9vbXNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgICAvLyByZXNvbHZlOiB7XG4gICAgLy8gICAgIFwiY3VycmVudEF1dGhcIjogW1wiQXV0aFwiLFxuICAgIC8vICAgICAgICAgZnVuY3Rpb24gKEF1dGgpIHtcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gQXV0aC4kd2FpdEZvckF1dGgoKTtcbiAgICAvLyB9XX1cbiAgfSlcbn0pOyIsImFwcC5jb250cm9sbGVyKCdSZWdpc3RlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRmaXJlYmFzZUF1dGgsIEF1dGhGYWN0b3J5LCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY01vZGFsKSB7XG4gICAgXG4gICAgLy8gJGlvbmljTW9kYWwuZnJvbVRlbXBsYXRlVXJsKCdqcy9sb2dpbi9sb2dpbi5odG1sJywge1xuICAgIC8vIHNjb3BlOiAkc2NvcGUgfSlcbiAgICAvLyAudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAvLyAkc2NvcGUubW9kYWwgPSBtb2RhbDtcbiAgICAvLyB9KTtcblxuXG4gICAgJHNjb3BlLnNpZ25VcCA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIEF1dGhGYWN0b3J5LnNpZ25VcChjcmVkZW50aWFscylcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgJHJvb3RTY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLnJvb21zJywge3VpZDogdXNlci51aWR9KVxuICAgICAgICB9KVxuICAgIH1cbiAgICAkc2NvcGUuc2lnbkluID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgQXV0aEZhY3Rvcnkuc2lnbkluKGNyZWRlbnRpYWxzKVxuICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgJHN0YXRlLmdvKCd0YWIucm9vbXMnLCB7dWlkOiB1c2VyLnVpZH0pXG4gICAgICAgIH0pXG4gICAgfVxufSkiLCJhcHAuY29udHJvbGxlcignVXNlckN0cmwnLCBbXCIkc2NvcGVcIiwgXCIkZmlyZWJhc2VcIiwgXCIkZmlyZWJhc2VBdXRoXCIsIGZ1bmN0aW9uKCRzY29wZSwgJGZpcmViYXNlLCAkZmlyZWJhc2VBdXRoKSB7XG5cdHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuXHRcbn1dKSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
