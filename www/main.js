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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguZmFjdG9yeS5qcyIsImNoYXQuZmFjdG9yeS5qcyIsInRhYlN0YXRlLmpzIiwiY2hhdC9jaGF0LmNvbnRyb2xsZXIuanMiLCJjaGF0L3RhYi5jaGF0LnN0YXRlLmpzIiwiYWNjb3VudC9hY2NvdW50LmNvbnRyb2xsZXIuanMiLCJkYXNoL2Rhc2guY29udHJvbGxlci5qcyIsImV2ZW50cy9ldmVudHMuY29udHJvbGxlci5qcyIsImV2ZW50cy9ldmVudHMuc3RhdGUuanMiLCJsb2dpbi9sb2dpbi5jb250cm9sbGVyLmpzIiwibG9naW4vbG9naW4uc3RhdGUuanMiLCJyb29tcy9jcmVhdGVOZXdSb29tLnN0YXRlLmpzIiwicm9vbXMvcm9vbXMuY29udHJvbGxlci5qcyIsInJvb21zL3Jvb21zLmZhY3RvcnkuanMiLCJyb29tcy9yb29tcy5zdGF0ZS5qcyIsInNldHRpbmdzL3NldHRpbmdzLmNvbnRyb2xsZXIuanMiLCJzZXR0aW5ncy9zZXR0aW5ncy5zdGF0ZS5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyLmNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy91c2VyLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vLyBJb25pYyBTdGFydGVyIEFwcFxuXG4vLyBhbmd1bGFyLm1vZHVsZSBpcyBhIGdsb2JhbCBwbGFjZSBmb3IgY3JlYXRpbmcsIHJlZ2lzdGVyaW5nIGFuZCByZXRyaWV2aW5nIEFuZ3VsYXIgbW9kdWxlc1xuLy8gJ3N0YXJ0ZXInIGlzIHRoZSBuYW1lIG9mIHRoaXMgYW5ndWxhciBtb2R1bGUgZXhhbXBsZSAoYWxzbyBzZXQgaW4gYSA8Ym9keT4gYXR0cmlidXRlIGluIGluZGV4Lmh0bWwpXG4vLyB0aGUgMm5kIHBhcmFtZXRlciBpcyBhbiBhcnJheSBvZiAncmVxdWlyZXMnXG4vLyAnc3RhcnRlci5zZXJ2aWNlcycgaXMgZm91bmQgaW4gc2VydmljZXMuanNcbi8vICdzdGFydGVyLmNvbnRyb2xsZXJzJyBpcyBmb3VuZCBpbiBjb250cm9sbGVycy5qc1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyJywgWydpb25pYycsIFwiZmlyZWJhc2VcIiwgXCJ1aS5yb3V0ZXJcIl0pXG5cbiBcbiBcbmFwcC5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICBpZiAod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucyAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG5cbiAgICB9XG4gICAgaWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG4gIH0pO1xufSlcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgLy8gaWYgbm9uZSBvZiB0aGUgYWJvdmUgc3RhdGVzIGFyZSBtYXRjaGVkLCB1c2UgdGhpcyBhcyB0aGUgZmFsbGJhY2tcbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL2xvZ2luJyk7XG59KTtcbiIsImFwcC5mYWN0b3J5KFwiQXV0aEZhY3RvcnlcIiwgZnVuY3Rpb24oJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBdXRoLCAkZmlyZWJhc2VBcnJheSkge1xuICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aChyZWYpO1xuICAgIHZhciB1c2VycyA9IHJlZi5jaGlsZCgndXNlcnMnKVxuICAgIHZhciBwaG9uZU51bXMgPSBbXVxuICAgIHVzZXJzLm9uY2UoXCJ2YWx1ZVwiLCBmdW5jdGlvbihhbGxVc2Vycykge1xuICAgICAgYWxsVXNlcnMuZm9yRWFjaChmdW5jdGlvbihvbmVVc2VyKSB7XG4gICAgICAgIHZhciBwaG9uZSA9IG9uZVVzZXIuY2hpbGQoJ3Bob25lJykudmFsKCkucmVwbGFjZSgvXFxELywgXCJcIik7XG4gICAgICAgIHBob25lTnVtcy5wdXNoKHBob25lKVxuICAgICAgfSlcbiAgICB9KVxuICAgIHJldHVybiB7XG4gICAgICBzaWduVXA6IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmIChwaG9uZU51bXMuaW5kZXhPZihjcmVkZW50aWFscy5waG9uZS5yZXBsYWNlKC9cXEQvLCBcIlwiKSkgPT09IC0xKSB7XG4gICAgICAgICAgcmV0dXJuIGF1dGguJGNyZWF0ZVVzZXIoe2VtYWlsOiBjcmVkZW50aWFscy5lbWFpbCwgcGFzc3dvcmQ6IGNyZWRlbnRpYWxzLnBhc3N3b3JkfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICBpZiAoIXVzZXIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB1c2VyLm5hbWUgPSBjcmVkZW50aWFscy5uYW1lO1xuICAgICAgICAgICAgdXNlci5waG9uZSA9IGNyZWRlbnRpYWxzLnBob25lO1xuICAgICAgICAgICAgdXNlci5lbWFpbCA9IGNyZWRlbnRpYWxzLmVtYWlsO1xuICAgICAgICAgICAgdXNlcnMuY2hpbGQodXNlci51aWQpLnNldCh7XG4gICAgICAgICAgICAgIG5hbWU6IHVzZXIubmFtZSxcbiAgICAgICAgICAgICAgcGhvbmU6IHVzZXIucGhvbmUucmVwbGFjZSgvXFxELywgXCJcIiksXG4gICAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcGhvbmVOdW1zLnB1c2goY3JlZGVudGlhbHMucGhvbmUucmVwbGFjZSgvXFxELywgXCJcIikpXG4gICAgICAgICAgICByZXR1cm4gdXNlclxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgICAgIGlmICghaW5wdXQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICB9IFxuICAgICAgICAgICAgdmFyIGVtYWlsID0gY3JlZGVudGlhbHMuZW1haWw7XG4gICAgICAgICAgICB2YXIgcGFzc3dvcmQgPSBjcmVkZW50aWFscy5wYXNzd29yZDtcbiAgICAgICAgICAgIHJldHVybiBhdXRoLiRhdXRoV2l0aFBhc3N3b3JkKHtcbiAgICAgICAgICAgICAgZW1haWw6IGVtYWlsLFxuICAgICAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2goY29uc29sZS5lcnJvcilcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldEN1cnJlbnRVc2VyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHJlZi5nZXRBdXRoKClcbiAgICAgIH0sXG4gICAgICBzaWduSW46IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIHZhciBlbWFpbCA9IGNyZWRlbnRpYWxzLmVtYWlsO1xuICAgICAgICB2YXIgcGFzc3dvcmQgPSBjcmVkZW50aWFscy5wYXNzd29yZDtcbiAgICAgICAgcmV0dXJuIGF1dGguJGF1dGhXaXRoUGFzc3dvcmQoe1xuICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGNvbnNvbGUuZXJyb3IpXG4gICAgICB9XG4gICAgfVxuICB9KTsiLCJhcHAuZmFjdG9yeSgnQ2hhdEZhY3RvcnknLCBmdW5jdGlvbigkZmlyZWJhc2UsIFJvb21zRmFjdG9yeSkge1xuXG4gIHZhciBzZWxlY3RlZFJvb21JZDtcbiAgdmFyIGNoYXRzO1xuICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcblxuICByZXR1cm4ge1xuICAgIGFsbDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gY2hhdHM7XG4gICAgfSxcbiAgICByZW1vdmU6IGZ1bmN0aW9uKGNoYXQpIHtcbiAgICAgIGNoYXRzLiRyZW1vdmUoY2hhdClcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgcmVmLmtleSgpID09PSBjaGF0LiRpZDtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbihjaGF0SWQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNoYXRzW2ldLmlkID09PSBwYXJzZUludChjaGF0SWQpKSB7XG4gICAgICAgICAgcmV0dXJuIGNoYXRzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIGdldFNlbGVjdGVkUm9vbU5hbWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzZWxlY3RlZFJvb207XG4gICAgICBpZiAoc2VsZWN0ZWRSb29tSWQgJiYgc2VsZWN0ZWRSb29tSWQgIT0gbnVsbCkge1xuICAgICAgICAgIHNlbGVjdGVkUm9vbSA9IFJvb21zRmFjdG9yeS5nZXQoc2VsZWN0ZWRSb29tSWQpO1xuICAgICAgICAgIGlmIChzZWxlY3RlZFJvb20pXG4gICAgICAgICAgICAgIHJldHVybiBzZWxlY3RlZFJvb20ubmFtZTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfSBlbHNlXG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBzZWxlY3RSb29tOiBmdW5jdGlvbiAocm9vbUlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2VsZWN0aW5nIHRoZSByb29tIHdpdGggaWQ6IFwiICsgcm9vbUlkKTtcbiAgICAgICAgc2VsZWN0ZWRSb29tSWQgPSByb29tSWQ7XG4gICAgICAgIGlmICghaXNOYU4ocm9vbUlkKSkge1xuICAgICAgICAgICAgY2hhdHMgPSAkZmlyZWJhc2VBcnJheShyZWYuY2hpbGQoJ3Jvb21zJykuY2hpbGQoc2VsZWN0ZWRSb29tSWQpLmNoaWxkKCdjaGF0cycpKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgc2VuZDogZnVuY3Rpb24gKGZyb20sIG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kaW5nIG1lc3NhZ2UgZnJvbSA6XCIgKyBmcm9tLmRpc3BsYXlOYW1lICsgXCIgJiBtZXNzYWdlIGlzIFwiICsgbWVzc2FnZSk7XG4gICAgICAgIGlmIChmcm9tICYmIG1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHZhciBjaGF0TWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICBmcm9tOiBmcm9tLmRpc3BsYXlOYW1lLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgY3JlYXRlZEF0OiBGaXJlYmFzZS5TZXJ2ZXJWYWx1ZS5USU1FU1RBTVBcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjaGF0cy4kYWRkKGNoYXRNZXNzYWdlKS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJtZXNzYWdlIGFkZGVkXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gIH07XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyXG5cdFx0LnN0YXRlKCd0YWInLCB7XG5cdFx0dXJsOiAnL3RhYicsXG5cdFx0YWJzdHJhY3Q6IHRydWUsXG5cdFx0Y2FjaGU6IGZhbHNlLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvdGFicy5odG1sJ1xuXHRcdH0pXG59KSIsImFwcC5jb250cm9sbGVyKCdDaGF0Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgQ2hhdEZhY3RvcnksICRzdGF0ZSkge1xuXG4gICRzY29wZS5JTSA9IHtcbiAgICB0ZXh0TWVzc2FnZTogXCJcIlxuICB9O1xuXG4gIENoYXRGYWN0b3J5LnNlbGVjdFJvb20oJHN0YXRlLnBhcmFtcy5yb29tSWQpO1xuXG4gIHZhciByb29tTmFtZSA9IENoYXRGYWN0b3J5LmdldFNlbGVjdGVkUm9vbU5hbWUoKTtcblxuICBpZiAocm9vbU5hbWUpIHtcbiAgICAgICRzY29wZS5yb29tTmFtZSA9IFwiIC0gXCIgKyByb29tTmFtZTtcbiAgICAgICRzY29wZS5jaGF0cyA9IENoYXRGYWN0b3J5LmFsbCgpO1xuICB9XG5cbiAgJHNjb3BlLnNlbmRNZXNzYWdlID0gZnVuY3Rpb24gKG1zZykge1xuICAgICAgY29uc29sZS5sb2cobXNnKTtcbiAgICAgIENoYXRGYWN0b3J5LnNlbmQoJHNjb3BlLmRpc3BsYXlOYW1lLCBtc2cpO1xuICAgICAgJHNjb3BlLklNLnRleHRNZXNzYWdlID0gXCJcIjtcbiAgfVxuXG4gICRzY29wZS5yZW1vdmUgPSBmdW5jdGlvbiAoY2hhdCkge1xuICAgICAgQ2hhdEZhY3RvcnkucmVtb3ZlKGNoYXQpO1xuICB9XG5cbiAgICAvLyAkc2NvcGUuc2VuZENoYXQgPSBmdW5jdGlvbiAoY2hhdCl7XG4gICAgLy8gICBpZiAoJHJvb3RTY29wZS51c2VyKSB7XG4gICAgLy8gICAgIC8vIGNvbnNvbGUubG9nKCd0aGlzIGlzIHVzZXInLCAkcm9vdFNjb3BlLnVzZXIpXG4gICAgLy8gICAgICRzY29wZS5jaGF0cy4kYWRkKHtcbiAgICAvLyAgICAgICB1c2VyOiAkcm9vdFNjb3BlLnVzZXIsXG4gICAgLy8gICAgICAgbWVzc2FnZTogY2hhdC5tZXNzYWdlXG4gICAgLy8gICAgIH0pO1xuICAgIC8vICAgY2hhdC5tZXNzYWdlID0gXCJcIjtcbiAgICAvLyAgIH1cbiAgICAvLyB9XG4gfSlcblxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLmNoYXQnLCB7XG4gICAgdXJsOiAnL2NoYXQnLFxuICAgIHZpZXdzOiB7XG4gICAgICAncm9vbXNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NoYXQvY2hhdC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0NoYXRDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsIi8vIGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyLmNvbnRyb2xsZXJzJywgW10pXG5cbmFwcC5jb250cm9sbGVyKCdBY2NvdW50Q3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlKSB7XG5cblxudmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG5cbiAgJHNjb3BlLnNldHRpbmdzID0ge1xuICAgIGVuYWJsZUZyaWVuZHM6IHRydWVcbiAgfTtcbiAgXG4gICRzY29wZS5wbGFjZXMgPSBmdW5jdGlvbigpIHtcbiAgXHR5ZWxwLnNlYXJjaCh7IHRlcm06ICdtZXhpY2FuJywgbG9jYXRpb246ICdCcm9va2x5bicgfSlcbi50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gIGNvbnNvbGUubG9nKGRhdGEpO1xufSlcbiAgfVxuXG59KTtcbiIsIi8vIGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyLmNvbnRyb2xsZXJzJywgW10pXG5cbmFwcC5jb250cm9sbGVyKCdEYXNoQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlKSB7XG5cdCRzdGF0ZS5nbygndGFiLmNoYXRzJylcbn0pIiwiYXBwLmNvbnRyb2xsZXIoJ0V2ZW50c0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIFJvb21zRmFjdG9yeSwgQ2hhdEZhY3RvcnksICRzdGF0ZSkge1xuXG5cbiB9KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIuZXZlbnRzJywge1xuICAgIHVybDogJy9ldmVudHMnLFxuICAgIHZpZXdzOiB7XG4gICAgICAnZXZlbnRzVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ldmVudHMvZXZlbnRzLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnRXZlbnRzQ3RybCdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KTsiLCJhcHAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24oJHNjb3BlKSB7XG4gICRzY29wZS5jb250YWN0cyA9IFtcInBlcnNvbjFcIiwgXCJwZXJzb24yXCIsIFwicGVyc29uM1wiXTtcbiAgJHNjb3BlLmNoYXRzID0gW1wiYmFydFwiLCBcIndoaXNrZXlcIiwgXCJsbG9vXCJdO1xufSlcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICB1cmw6ICcvbG9naW4nLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsIFxuICAgIGNvbnRyb2xsZXI6ICdSZWdpc3RlckN0cmwnXG4gIH0pXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLmNyZWF0ZU5ld1Jvb20nLCB7XG4gICAgdXJsOiAnL2NyZWF0ZU5ld1Jvb20nLFxuICAgIHZpZXdzOiB7XG4gICAgICAncm9vbXNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Jvb21zL2NyZWF0ZU5ld1Jvb20uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSb29tc0N0cmwnXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ1Jvb21zQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgUm9vbXNGYWN0b3J5LCBDaGF0RmFjdG9yeSwgJHN0YXRlKSB7XG5cbiAgICAvLyAkaW9uaWNNb2RhbC5mcm9tVGVtcGxhdGVVcmwoJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLCB7XG4gICAgLy8gICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgLy8gICAgIGFuaW1hdGlvbjogJ3NsaWRlLWluLXVwJ1xuICAgIC8vIH0pXG4gICAgLy8gLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgLy8gJHNjb3BlLm1vZGFsID0gbW9kYWw7XG4gICAgLy8gfSk7XG5cbiAgICAkc2NvcGUucm9vbXMgPSBSb29tc0ZhY3RvcnkuYWxsKCk7XG5cbiAgICAkc2NvcGUuY3JlYXRlUm9vbSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLmdvKCd0YWIuY3JlYXRlTmV3Um9vbScpO1xuICAgIH1cblxuICAgICRzY29wZS5vcGVuUm9vbSA9IGZ1bmN0aW9uIChyb29tSWQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHJvb21pZCcsIHJvb21JZClcbiAgICAgICRzdGF0ZS5nbygndGFiLmNoYXQnLCB7XG4gICAgICAgIHJvb21JZDogcm9vbUlkXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAkc2NvcGUuYWRkQ29udGFjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9hZGQgdG8gZmlyZWJhc2UgYXJyYXkgaW4gcm9vbXNmYWN0b3J5XG4gICAgfVxuXG4gICAgJHNjb3BlLnNhdmVOZXdSb29tID0gZnVuY3Rpb24gKHJvb21PYmopIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIHJvb21vYmonLCByb29tT2JqKVxuICAgICAgICByZXR1cm4gUm9vbXNGYWN0b3J5LmFkZChyb29tT2JqKS50aGVuKGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgaWQnLCBpZClcbiAgICAgICAgfSlcblxuICAgICAgICBcbiAgICAgICAgLy9hZGQgdG8gZmlyZWJhc2UgYXJyYXkgaW4gcm9vbXNmYWN0b3J5XG4gICAgfVxuXG4gICAgLy8gJHNjb3BlLnNlbmRDaGF0ID0gZnVuY3Rpb24gKGNoYXQpe1xuICAgIC8vICAgaWYgKCRyb290U2NvcGUudXNlcikge1xuICAgIC8vICAgICAvLyBjb25zb2xlLmxvZygndGhpcyBpcyB1c2VyJywgJHJvb3RTY29wZS51c2VyKVxuICAgIC8vICAgICAkc2NvcGUuY2hhdHMuJGFkZCh7XG4gICAgLy8gICAgICAgdXNlcjogJHJvb3RTY29wZS51c2VyLFxuICAgIC8vICAgICAgIG1lc3NhZ2U6IGNoYXQubWVzc2FnZVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIGNoYXQubWVzc2FnZSA9IFwiXCI7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuIH0pXG4iLCJhcHAuZmFjdG9yeSgnUm9vbXNGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlQXJyYXkpIHtcblxuICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcbiAgdmFyIHJvb21zID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKCdncm91cHMnKSk7XG5cbiAgcmV0dXJuIHtcblxuICAgIGFsbDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcm9vbXM7XG4gICAgfSxcbiAgIFxuICAgIGdldDogZnVuY3Rpb24ocm9vbUlkKSB7XG4gICAgICByZXR1cm4gcm9vbXMuJGdldFJlY29yZChyb29tSWQpO1xuICAgIH0sXG5cbiAgICBhZGQ6IGZ1bmN0aW9uKHJvb21PYmopIHtcbiAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHJvb21vYmogaW4gZmFjJywgcm9vbU9iailcbiAgICAgIHJvb21zLiRhZGQocm9vbU9iailcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZWYpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIHJlZicsIHJlZilcbiAgICAgICAgdmFyIGlkID0gcmVmLmtleSgpO1xuICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB0aGUgaWQnLCBpZClcbiAgICAgICAgcmV0dXJuIGlkO1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnYWRkZWQgcmVjb3JkIHdpdGggaWQnICsgaWQpO1xuICAgICAgICAvLyByZXR1cm4gcm9vbXMuJGluZGV4Rm9yKGlkKTtcbiAgICAgICAgLy9zdGF0ZS5nbyB0byBjaGF0IGRldGFpbCB3aXRoIG5ldyBpZFxuICAgICAgfSlcblxuICAgIH1cbiAgfTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5yb29tcycsIHtcbiAgICB1cmw6ICcvcm9vbXMnLFxuICAgIHZpZXdzOiB7XG4gICAgICAncm9vbXNWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Jvb21zL3Jvb21zLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUm9vbXNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgICAvLyByZXNvbHZlOiB7XG4gICAgLy8gICAgIFwiY3VycmVudEF1dGhcIjogW1wiQXV0aFwiLFxuICAgIC8vICAgICAgICAgZnVuY3Rpb24gKEF1dGgpIHtcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gQXV0aC4kd2FpdEZvckF1dGgoKTtcbiAgICAvLyB9XX1cbiAgfSlcbn0pOyIsIi8vIGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyLmNvbnRyb2xsZXJzJywgW10pXG5cbmFwcC5jb250cm9sbGVyKCdTZXR0aW5nc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIGN1cnJlbnRVc2VyLCAkc3RhdGUpIHtcblxudmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG5cbiAgJHNjb3BlLnVzZXIgPSBjdXJyZW50VXNlcjtcblxuICAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICBcdHJlZi51bmF1dGgoKTtcbiAgXHQkc3RhdGUuZ28oJ2xvZ2luJylcbiAgfVxuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHVybFJvdXRlclByb3ZpZGVyLCAkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5zZXR0aW5ncycsIHtcbiAgICB1cmw6ICcvc2V0dGluZ3MvOnVpZCcsXG4gICAgdmlld3M6IHtcbiAgICAgICdzZXR0aW5nc1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc2V0dGluZ3MvdXNlckluZm8uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdTZXR0aW5nc0N0cmwnXG4gICAgICB9XG4gICAgfSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBjdXJyZW50VXNlcjogZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCAkZmlyZWJhc2VPYmplY3QpIHtcbiAgICAgICAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbS91c2Vycy8nICsgJHN0YXRlUGFyYW1zLnVpZClcbiAgICAgICAgdmFyIHVzZXIgPSAkZmlyZWJhc2VPYmplY3QocmVmKVxuICAgICAgICByZXR1cm4gdXNlclxuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsImFwcC5jb250cm9sbGVyKCdSZWdpc3RlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRmaXJlYmFzZUF1dGgsIEF1dGhGYWN0b3J5LCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY1BvcHVwKSB7XG4gICAgXG4gICAgLy8gJGlvbmljTW9kYWwuZnJvbVRlbXBsYXRlVXJsKCdqcy9sb2dpbi9sb2dpbi5odG1sJywge1xuICAgIC8vIHNjb3BlOiAkc2NvcGUgfSlcbiAgICAvLyAudGhlbihmdW5jdGlvbiAobW9kYWwpIHtcbiAgICAvLyAkc2NvcGUubW9kYWwgPSBtb2RhbDtcbiAgICAvLyB9KTtcblxuXG4gICAgJHNjb3BlLnNpZ25VcCA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmICghQXV0aEZhY3Rvcnkuc2lnblVwKGNyZWRlbnRpYWxzKSkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnSW52YWxpZCBjcmVkZW50aWFscycsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6ICdUaGF0IG51bWJlciBvciBlbWFpbCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQhIFBsZWFzZSB0cnkgYWdhaW4gOiknXG4gICAgICAgICAgICB9KSAgIFxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgQXV0aEZhY3Rvcnkuc2lnblVwKGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLnJvb21zJywge3VpZDogdXNlci51aWR9KVxuICAgICAgICAgICAgfSkgICAgXG4gICAgICAgIH1cbiAgICB9XG4gICAgJHNjb3BlLnNpZ25JbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIGlmIChBdXRoRmFjdG9yeS5zaWduSW4oY3JlZGVudGlhbHMpLmVycm9yKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdJbnZhbGlkIGxvZ2luJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJ09vcHMsIHlvdSBtaWdodCBoYXZlIHNwZWxsZWQgc29tZXRoaW5nIHdyb25nISBQbGVhc2UgdHJ5IGFnYWluIDopJ1xuICAgICAgICAgICAgfSkgICBcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIEF1dGhGYWN0b3J5LnNpZ25JbihjcmVkZW50aWFscylcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3RhYi5yb29tcycsIHt1aWQ6IHVzZXIudWlkfSlcbiAgICAgICAgICAgIH0pICAgIFxuICAgICAgICB9XG4gICAgfVxufSkiLCJhcHAuY29udHJvbGxlcignVXNlckN0cmwnLCBbXCIkc2NvcGVcIiwgXCIkZmlyZWJhc2VcIiwgXCIkZmlyZWJhc2VBdXRoXCIsIGZ1bmN0aW9uKCRzY29wZSwgJGZpcmViYXNlLCAkZmlyZWJhc2VBdXRoKSB7XG5cdHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuXHRcbn1dKSJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
