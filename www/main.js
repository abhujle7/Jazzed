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

  $scope.logout = function() {
  	ref.unauth();
  	$state.go('login')
  }

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguZmFjdG9yeS5qcyIsImNoYXQuZmFjdG9yeS5qcyIsInRhYlN0YXRlLmpzIiwiYWNjb3VudC9hY2NvdW50LmNvbnRyb2xsZXIuanMiLCJjaGF0L2NoYXQuY29udHJvbGxlci5qcyIsImNoYXQvdGFiLmNoYXQuc3RhdGUuanMiLCJkYXNoL2Rhc2guY29udHJvbGxlci5qcyIsImV2ZW50cy9ldmVudHMuY29udHJvbGxlci5qcyIsImV2ZW50cy9ldmVudHMuc3RhdGUuanMiLCJsb2dpbi9sb2dpbi5jb250cm9sbGVyLmpzIiwibG9naW4vbG9naW4uc3RhdGUuanMiLCJyb29tcy9jcmVhdGVOZXdSb29tLnN0YXRlLmpzIiwicm9vbXMvcm9vbXMuY29udHJvbGxlci5qcyIsInJvb21zL3Jvb21zLmZhY3RvcnkuanMiLCJyb29tcy9yb29tcy5zdGF0ZS5qcyIsInNldHRpbmdzL3NldHRpbmdzLmNvbnRyb2xsZXIuanMiLCJzZXR0aW5ncy9zZXR0aW5ncy5zdGF0ZS5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyLmNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy91c2VyLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vLyBJb25pYyBTdGFydGVyIEFwcFxuXG4vLyBhbmd1bGFyLm1vZHVsZSBpcyBhIGdsb2JhbCBwbGFjZSBmb3IgY3JlYXRpbmcsIHJlZ2lzdGVyaW5nIGFuZCByZXRyaWV2aW5nIEFuZ3VsYXIgbW9kdWxlc1xuLy8gJ3N0YXJ0ZXInIGlzIHRoZSBuYW1lIG9mIHRoaXMgYW5ndWxhciBtb2R1bGUgZXhhbXBsZSAoYWxzbyBzZXQgaW4gYSA8Ym9keT4gYXR0cmlidXRlIGluIGluZGV4Lmh0bWwpXG4vLyB0aGUgMm5kIHBhcmFtZXRlciBpcyBhbiBhcnJheSBvZiAncmVxdWlyZXMnXG4vLyAnc3RhcnRlci5zZXJ2aWNlcycgaXMgZm91bmQgaW4gc2VydmljZXMuanNcbi8vICdzdGFydGVyLmNvbnRyb2xsZXJzJyBpcyBmb3VuZCBpbiBjb250cm9sbGVycy5qc1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyJywgWydpb25pYycsIFwiZmlyZWJhc2VcIl0pXG5cbiBcbiBcbmFwcC5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICBpZiAod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucyAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG5cbiAgICB9XG4gICAgaWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG4gIH0pO1xufSlcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgLy8gaWYgbm9uZSBvZiB0aGUgYWJvdmUgc3RhdGVzIGFyZSBtYXRjaGVkLCB1c2UgdGhpcyBhcyB0aGUgZmFsbGJhY2tcbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL2xvZ2luJyk7XG59KTtcbiIsImFwcC5mYWN0b3J5KFwiQXV0aEZhY3RvcnlcIiwgZnVuY3Rpb24oJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBdXRoLCAkZmlyZWJhc2VBcnJheSkge1xuICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aChyZWYpO1xuICAgIHZhciB1c2VycyA9IHJlZi5jaGlsZCgndXNlcnMnKVxuICAgIHJldHVybiB7XG4gICAgICBzaWduVXA6IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIHJldHVybiBhdXRoLiRjcmVhdGVVc2VyKHtlbWFpbDogY3JlZGVudGlhbHMuZW1haWwsIHBhc3N3b3JkOiBjcmVkZW50aWFscy5wYXNzd29yZH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICB1c2VyLm5hbWUgPSBjcmVkZW50aWFscy5uYW1lO1xuICAgICAgICAgIHVzZXIucGhvbmUgPSBjcmVkZW50aWFscy5waG9uZTtcbiAgICAgICAgICB1c2VyLmVtYWlsID0gY3JlZGVudGlhbHMuZW1haWw7XG4gICAgICAgICAgdXNlcnMuY2hpbGQodXNlci51aWQpLnNldCh7XG4gICAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgICBwaG9uZTogdXNlci5waG9uZSxcbiAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm4gdXNlclxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgICB2YXIgcGFzc3dvcmQgPSBjcmVkZW50aWFscy5wYXNzd29yZDtcbiAgICAgICAgICByZXR1cm4gYXV0aC4kYXV0aFdpdGhQYXNzd29yZCh7XG4gICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goY29uc29sZS5lcnJvcilcbiAgICAgIH0sXG4gICAgICBnZXRDdXJyZW50VXNlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlZi5nZXRBdXRoKCkpXG4gICAgICAgIHJldHVybiByZWYuZ2V0QXV0aCgpXG4gICAgICB9LFxuICAgICAgc2lnbkluOiBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICB2YXIgZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgdmFyIHBhc3N3b3JkID0gY3JlZGVudGlhbHMucGFzc3dvcmQ7XG4gICAgICAgIHJldHVybiBhdXRoLiRhdXRoV2l0aFBhc3N3b3JkKHtcbiAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChjb25zb2xlLmVycm9yKVxuICAgICAgfVxuICAgIH1cbiAgfSk7IiwiYXBwLmZhY3RvcnkoJ0NoYXRGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlLCBSb29tc0ZhY3RvcnkpIHtcblxuICB2YXIgc2VsZWN0ZWRSb29tSWQ7XG4gIHZhciBjaGF0cztcbiAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG5cbiAgcmV0dXJuIHtcbiAgICBhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNoYXRzO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihjaGF0KSB7XG4gICAgICBjaGF0cy4kcmVtb3ZlKGNoYXQpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgIHJlZi5rZXkoKSA9PT0gY2hhdC4kaWQ7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24oY2hhdElkKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjaGF0c1tpXS5pZCA9PT0gcGFyc2VJbnQoY2hhdElkKSkge1xuICAgICAgICAgIHJldHVybiBjaGF0c1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBnZXRTZWxlY3RlZFJvb21OYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRSb29tO1xuICAgICAgaWYgKHNlbGVjdGVkUm9vbUlkICYmIHNlbGVjdGVkUm9vbUlkICE9IG51bGwpIHtcbiAgICAgICAgICBzZWxlY3RlZFJvb20gPSBSb29tc0ZhY3RvcnkuZ2V0KHNlbGVjdGVkUm9vbUlkKTtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWRSb29tKVxuICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWRSb29tLm5hbWU7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgc2VsZWN0Um9vbTogZnVuY3Rpb24gKHJvb21JZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbGVjdGluZyB0aGUgcm9vbSB3aXRoIGlkOiBcIiArIHJvb21JZCk7XG4gICAgICAgIHNlbGVjdGVkUm9vbUlkID0gcm9vbUlkO1xuICAgICAgICBpZiAoIWlzTmFOKHJvb21JZCkpIHtcbiAgICAgICAgICAgIGNoYXRzID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKCdyb29tcycpLmNoaWxkKHNlbGVjdGVkUm9vbUlkKS5jaGlsZCgnY2hhdHMnKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNlbmQ6IGZ1bmN0aW9uIChmcm9tLCBtZXNzYWdlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2VuZGluZyBtZXNzYWdlIGZyb20gOlwiICsgZnJvbS5kaXNwbGF5TmFtZSArIFwiICYgbWVzc2FnZSBpcyBcIiArIG1lc3NhZ2UpO1xuICAgICAgICBpZiAoZnJvbSAmJiBtZXNzYWdlKSB7XG4gICAgICAgICAgICB2YXIgY2hhdE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgZnJvbTogZnJvbS5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogRmlyZWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2hhdHMuJGFkZChjaGF0TWVzc2FnZSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibWVzc2FnZSBhZGRlZFwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICB9O1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlclxuXHRcdC5zdGF0ZSgndGFiJywge1xuXHRcdHVybDogJy90YWInLFxuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdGNhY2hlOiBmYWxzZSxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL3RhYnMuaHRtbCdcblx0XHR9KVxufSkiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSkge1xuXG5cbnZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuXG4gICRzY29wZS5zZXR0aW5ncyA9IHtcbiAgICBlbmFibGVGcmllbmRzOiB0cnVlXG4gIH07XG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICBcdHJlZi51bmF1dGgoKTtcbiAgXHQkc3RhdGUuZ28oJ2xvZ2luJylcbiAgfVxuXG4gICRzY29wZS5wbGFjZXMgPSBmdW5jdGlvbigpIHtcbiAgXHR5ZWxwLnNlYXJjaCh7IHRlcm06ICdtZXhpY2FuJywgbG9jYXRpb246ICdCcm9va2x5bicgfSlcbi50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gIGNvbnNvbGUubG9nKGRhdGEpO1xufSlcbiAgfVxuXG59KTtcbiIsImFwcC5jb250cm9sbGVyKCdDaGF0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgQ2hhdEZhY3RvcnksICRzdGF0ZSkge1xuXG4gICRzY29wZS5JTSA9IHtcbiAgICB0ZXh0TWVzc2FnZTogXCJcIlxuICB9O1xuXG4gIENoYXRGYWN0b3J5LnNlbGVjdFJvb20oJHN0YXRlLnBhcmFtcy5yb29tSWQpO1xuXG4gIHZhciByb29tTmFtZSA9IENoYXRGYWN0b3J5LmdldFNlbGVjdGVkUm9vbU5hbWUoKTtcblxuICBpZiAocm9vbU5hbWUpIHtcbiAgICAgICRzY29wZS5yb29tTmFtZSA9IFwiIC0gXCIgKyByb29tTmFtZTtcbiAgICAgICRzY29wZS5jaGF0cyA9IENoYXRGYWN0b3J5LmFsbCgpO1xuICB9XG5cbiAgJHNjb3BlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24gKG1zZykge1xuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgIENoYXRGYWN0b3J5LnNlbmQoJHNjb3BlLmRpc3BsYXlOYW1lLCBtc2cpO1xuICAgICAgJHNjb3BlLklNLnRleHRNZXNzYWdlID0gXCJcIjtcbiAgfVxuXG4gICRzY29wZS5yZW1vdmUgPSBmdW5jdGlvbiAoY2hhdCkge1xuICAgICAgQ2hhdEZhY3RvcnkucmVtb3ZlKGNoYXQpO1xuICB9XG5cbiAgICAvLyAkc2NvcGUuc2VuZENoYXQgPSBmdW5jdGlvbiAoY2hhdCl7XG4gICAgLy8gICBpZiAoJHJvb3RTY29wZS51c2VyKSB7XG4gICAgLy8gICAgIC8vIGNvbnNvbGUubG9nKCd0aGlzIGlzIHVzZXInLCAkcm9vdFNjb3BlLnVzZXIpXG4gICAgLy8gICAgICRzY29wZS5jaGF0cy4kYWRkKHtcbiAgICAvLyAgICAgICB1c2VyOiAkcm9vdFNjb3BlLnVzZXIsXG4gICAgLy8gICAgICAgbWVzc2FnZTogY2hhdC5tZXNzYWdlXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgY2hhdC5tZXNzYWdlID0gXCJcIjtcbiAgICAvLyAgIH1cbiAgICAvLyB9XG4gfSlcblxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLmNoYXQnLCB7XG4gICAgdXJsOiAnL2NoYXQnLFxuICAgIHZpZXdzOiB7XG4gICAgICAncm9vbXNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NoYXQvY2hhdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NoYXRDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsIi8vIGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyLmNvbnRyb2xsZXJzJywgW10pXG5cbmFwcC5jb250cm9sbGVyKCdEYXNoQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlKSB7XG5cdCRzdGF0ZS5nbygndGFiLmNoYXRzJylcbn0pIiwiYXBwLmNvbnRyb2xsZXIoJ0V2ZW50c0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIFJvb21zRmFjdG9yeSwgQ2hhdEZhY3RvcnksICRzdGF0ZSkge1xuXG5cbiB9KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIuZXZlbnRzJywge1xuICAgIHVybDogJy9ldmVudHMnLFxuICAgIHZpZXdzOiB7XG4gICAgICAnZXZlbnRzVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ldmVudHMvZXZlbnRzLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnRXZlbnRzQ3RybCdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KTsiLCJhcHAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICRzY29wZS5jb250YWN0cyA9IFtcInBlcnNvbjFcIiwgXCJwZXJzb24yXCIsIFwicGVyc29uM1wiXTtcbiAgJHNjb3BlLmNoYXRzID0gW1wiYmFydFwiLCBcIndoaXNrZXlcIiwgXCJsbG9vXCJdO1xufSlcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICB1cmw6ICcvbG9naW4nLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsIFxuICAgIGNvbnRyb2xsZXI6ICdSZWdpc3RlckN0cmwnXG4gIH0pXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLmNyZWF0ZU5ld1Jvb20nLCB7XG4gICAgdXJsOiAnL2NyZWF0ZU5ld1Jvb20nLFxuICAgIHZpZXdzOiB7XG4gICAgICAncm9vbXNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Jvb21zL2NyZWF0ZU5ld1Jvb20uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSb29tc0N0cmwnXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ1Jvb21zQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgUm9vbXNGYWN0b3J5LCBDaGF0RmFjdG9yeSwgJHN0YXRlKSB7XG5cbiAgICAvLyAkaW9uaWNNb2RhbC5mcm9tVGVtcGxhdGVVcmwoJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLCB7XG4gICAgLy8gICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgLy8gICAgIGFuaW1hdGlvbjogJ3NsaWRlLWluLXVwJ1xuICAgIC8vIH0pXG4gICAgLy8gLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgLy8gJHNjb3BlLm1vZGFsID0gbW9kYWw7XG4gICAgLy8gfSk7XG5cbiAgICAkc2NvcGUucm9vbXMgPSBSb29tc0ZhY3RvcnkuYWxsKCk7XG5cbiAgICAkc2NvcGUuY3JlYXRlUm9vbSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLmdvKCd0YWIuY3JlYXRlTmV3Um9vbScpO1xuICAgIH1cblxuICAgICRzY29wZS5vcGVuUm9vbSA9IGZ1bmN0aW9uIChyb29tSWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHJvb21pZCcsIHJvb21JZClcbiAgICAgICRzdGF0ZS5nbygndGFiLmNoYXQnLCB7XG4gICAgICAgIHJvb21JZDogcm9vbUlkXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAkc2NvcGUuYWRkQ29udGFjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9hZGQgdG8gZmlyZWJhc2UgYXJyYXkgaW4gcm9vbXNmYWN0b3J5XG4gICAgfVxuXG4gICAgJHNjb3BlLnNhdmVOZXdSb29tID0gZnVuY3Rpb24gKHJvb21PYmopIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIHJvb21vYmonLCByb29tT2JqKVxuICAgICAgICByZXR1cm4gUm9vbXNGYWN0b3J5LmFkZChyb29tT2JqKS50aGVuKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgaWQnLCBpZClcbiAgICAgICAgfSlcblxuICAgICAgICBcbiAgICAgICAgLy9hZGQgdG8gZmlyZWJhc2UgYXJyYXkgaW4gcm9vbXNmYWN0b3J5XG4gICAgfVxuXG4gICAgLy8gJHNjb3BlLnNlbmRDaGF0ID0gZnVuY3Rpb24gKGNoYXQpe1xuICAgIC8vICAgaWYgKCRyb290U2NvcGUudXNlcikge1xuICAgIC8vICAgICAvLyBjb25zb2xlLmxvZygndGhpcyBpcyB1c2VyJywgJHJvb3RTY29wZS51c2VyKVxuICAgIC8vICAgICAkc2NvcGUuY2hhdHMuJGFkZCh7XG4gICAgLy8gICAgICAgdXNlcjogJHJvb3RTY29wZS51c2VyLFxuICAgIC8vICAgICAgIG1lc3NhZ2U6IGNoYXQubWVzc2FnZVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIGNoYXQubWVzc2FnZSA9IFwiXCI7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuIH0pXG4iLCJhcHAuZmFjdG9yeSgnUm9vbXNGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlQXJyYXkpIHtcblxuICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcbiAgdmFyIHJvb21zID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKCdncm91cHMnKSk7XG5cbiAgcmV0dXJuIHtcblxuICAgIGFsbDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSxcbiAgIFxuICAgIGdldDogZnVuY3Rpb24ocm9vbUlkKSB7XG4gICAgICByZXR1cm4gcm9vbXMuJGdldFJlY29yZChyb29tSWQpO1xuICAgIH0sXG5cbiAgICBhZGQ6IGZ1bmN0aW9uKHJvb21PYmopIHtcbiAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHJvb21vYmogaW4gZmFjJywgcm9vbU9iailcbiAgICAgIHJvb21zLiRhZGQocm9vbU9iailcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIHJlZicsIHJlZilcbiAgICAgICAgdmFyIGlkID0gcmVmLmtleSgpO1xuICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgaWQnLCBpZClcbiAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnYWRkZWQgcmVjb3JkIHdpdGggaWQnICsgaWQpO1xuICAgICAgICAvLyByZXR1cm4gcm9vbXMuJGluZGV4Rm9yKGlkKTtcbiAgICAgICAgLy9zdGF0ZS5nbyB0byBjaGF0IGRldGFpbCB3aXRoIG5ldyBpZFxuICAgICAgfSlcblxuICAgIH1cbiAgfTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5yb29tcycsIHtcbiAgICB1cmw6ICcvcm9vbXMnLFxuICAgIHZpZXdzOiB7XG4gICAgICAncm9vbXNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Jvb21zL3Jvb21zLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUm9vbXNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgICAvLyByZXNvbHZlOiB7XG4gICAgLy8gICAgIFwiY3VycmVudEF1dGhcIjogW1wiQXV0aFwiLFxuICAgIC8vICAgICAgICAgZnVuY3Rpb24gKEF1dGgpIHtcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gQXV0aC4kd2FpdEZvckF1dGgoKTtcbiAgICAvLyB9XX1cbiAgfSlcbn0pOyIsIi8vIGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyLmNvbnRyb2xsZXJzJywgW10pXG5cbmFwcC5jb250cm9sbGVyKCdTZXR0aW5nc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGN1cnJlbnRVc2VyKSB7XG4gICRzY29wZS51c2VyID0gY3VycmVudFVzZXJcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkdXJsUm91dGVyUHJvdmlkZXIsICRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLnNldHRpbmdzJywge1xuICAgIHVybDogJy9zZXR0aW5ncy86dWlkJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3NldHRpbmdzVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9zZXR0aW5ncy91c2VySW5mby5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1NldHRpbmdzQ3RybCdcbiAgICAgIH1cbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGN1cnJlbnRVc2VyOiBmdW5jdGlvbigkc3RhdGVQYXJhbXMsICRmaXJlYmFzZU9iamVjdCkge1xuICAgICAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tL3VzZXJzLycgKyAkc3RhdGVQYXJhbXMudWlkKVxuICAgICAgICB2YXIgdXNlciA9ICRmaXJlYmFzZU9iamVjdChyZWYpXG4gICAgICAgIHJldHVybiB1c2VyXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ1JlZ2lzdGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGZpcmViYXNlQXV0aCwgQXV0aEZhY3RvcnksICRzdGF0ZSwgJHJvb3RTY29wZSwgJGlvbmljTW9kYWwpIHtcbiAgICBcbiAgICAvLyAkaW9uaWNNb2RhbC5mcm9tVGVtcGxhdGVVcmwoJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLCB7XG4gICAgLy8gc2NvcGU6ICRzY29wZSB9KVxuICAgIC8vIC50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgIC8vICRzY29wZS5tb2RhbCA9IG1vZGFsO1xuICAgIC8vIH0pO1xuXG5cbiAgICAkc2NvcGUuc2lnblVwID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgQXV0aEZhY3Rvcnkuc2lnblVwKGNyZWRlbnRpYWxzKVxuICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgJHN0YXRlLmdvKCd0YWIucm9vbXMnLCB7dWlkOiB1c2VyLnVpZH0pXG4gICAgICAgIH0pXG4gICAgfVxuICAgICRzY29wZS5zaWduSW4gPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICBBdXRoRmFjdG9yeS5zaWduSW4oY3JlZGVudGlhbHMpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICRyb290U2NvcGUudXNlciA9IHVzZXI7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3RhYi5yb29tcycsIHt1aWQ6IHVzZXIudWlkfSlcbiAgICAgICAgfSlcbiAgICB9XG59KSIsImFwcC5jb250cm9sbGVyKCdVc2VyQ3RybCcsIFtcIiRzY29wZVwiLCBcIiRmaXJlYmFzZVwiLCBcIiRmaXJlYmFzZUF1dGhcIiwgZnVuY3Rpb24oJHNjb3BlLCAkZmlyZWJhc2UsICRmaXJlYmFzZUF1dGgpIHtcblx0dmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG5cdFxufV0pIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
