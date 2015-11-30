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
        console.log(AuthFactory.signUp(credentials))
        if (!AuthFactory.signUp(credentials)) {
            $scope.error = $ionicPopup.alert({
                title: 'Invalid Phone Number',
                template: 'That number is already registered! Please try again :)'
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguZmFjdG9yeS5qcyIsImNoYXQuZmFjdG9yeS5qcyIsInRhYlN0YXRlLmpzIiwiYWNjb3VudC9hY2NvdW50LmNvbnRyb2xsZXIuanMiLCJjaGF0L2NoYXQuY29udHJvbGxlci5qcyIsImNoYXQvdGFiLmNoYXQuc3RhdGUuanMiLCJkYXNoL2Rhc2guY29udHJvbGxlci5qcyIsImV2ZW50cy9ldmVudHMuY29udHJvbGxlci5qcyIsImV2ZW50cy9ldmVudHMuc3RhdGUuanMiLCJsb2dpbi9sb2dpbi5jb250cm9sbGVyLmpzIiwibG9naW4vbG9naW4uc3RhdGUuanMiLCJyb29tcy9jcmVhdGVOZXdSb29tLnN0YXRlLmpzIiwicm9vbXMvcm9vbXMuY29udHJvbGxlci5qcyIsInJvb21zL3Jvb21zLmZhY3RvcnkuanMiLCJyb29tcy9yb29tcy5zdGF0ZS5qcyIsInNldHRpbmdzL3NldHRpbmdzLmNvbnRyb2xsZXIuanMiLCJzZXR0aW5ncy9zZXR0aW5ncy5zdGF0ZS5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyLmNvbnRyb2xsZXIuanMiLCJjb250cm9sbGVycy91c2VyLmNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuLy8gSW9uaWMgU3RhcnRlciBBcHBcblxuLy8gYW5ndWxhci5tb2R1bGUgaXMgYSBnbG9iYWwgcGxhY2UgZm9yIGNyZWF0aW5nLCByZWdpc3RlcmluZyBhbmQgcmV0cmlldmluZyBBbmd1bGFyIG1vZHVsZXNcbi8vICdzdGFydGVyJyBpcyB0aGUgbmFtZSBvZiB0aGlzIGFuZ3VsYXIgbW9kdWxlIGV4YW1wbGUgKGFsc28gc2V0IGluIGEgPGJvZHk+IGF0dHJpYnV0ZSBpbiBpbmRleC5odG1sKVxuLy8gdGhlIDJuZCBwYXJhbWV0ZXIgaXMgYW4gYXJyYXkgb2YgJ3JlcXVpcmVzJ1xuLy8gJ3N0YXJ0ZXIuc2VydmljZXMnIGlzIGZvdW5kIGluIHNlcnZpY2VzLmpzXG4vLyAnc3RhcnRlci5jb250cm9sbGVycycgaXMgZm91bmQgaW4gY29udHJvbGxlcnMuanNcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlcicsIFsnaW9uaWMnLCBcImZpcmViYXNlXCIsIFwidWkucm91dGVyXCJdKVxuXG4gXG4gXG5hcHAucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtKSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgaWYgKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuXG4gICAgfVxuICAgIGlmICh3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICAvLyBvcmcuYXBhY2hlLmNvcmRvdmEuc3RhdHVzYmFyIHJlcXVpcmVkXG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG4gICAgfVxuICB9KTtcbn0pXG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHVybFJvdXRlclByb3ZpZGVyKSB7XG4gIC8vIGlmIG5vbmUgb2YgdGhlIGFib3ZlIHN0YXRlcyBhcmUgbWF0Y2hlZCwgdXNlIHRoaXMgYXMgdGhlIGZhbGxiYWNrXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9sb2dpbicpO1xufSk7XG4iLCJhcHAuZmFjdG9yeShcIkF1dGhGYWN0b3J5XCIsIGZ1bmN0aW9uKCRmaXJlYmFzZU9iamVjdCwgJGZpcmViYXNlQXV0aCwgJGZpcmViYXNlQXJyYXkpIHtcbiAgICB2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcbiAgICB2YXIgYXV0aCA9ICRmaXJlYmFzZUF1dGgocmVmKTtcbiAgICB2YXIgdXNlcnMgPSByZWYuY2hpbGQoJ3VzZXJzJylcbiAgICB2YXIgcGhvbmVOdW1zID0gW11cbiAgICB1c2Vycy5vbmNlKFwidmFsdWVcIiwgZnVuY3Rpb24oYWxsVXNlcnMpIHtcbiAgICAgIGFsbFVzZXJzLmZvckVhY2goZnVuY3Rpb24ob25lVXNlcikge1xuICAgICAgICB2YXIgcGhvbmUgPSBvbmVVc2VyLmNoaWxkKCdwaG9uZScpLnZhbCgpLnJlcGxhY2UoL1xcRC8sIFwiXCIpO1xuICAgICAgICBwaG9uZU51bXMucHVzaChwaG9uZSlcbiAgICAgIH0pXG4gICAgfSlcbiAgICByZXR1cm4ge1xuICAgICAgc2lnblVwOiBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICBpZiAocGhvbmVOdW1zLmluZGV4T2YoY3JlZGVudGlhbHMucGhvbmUucmVwbGFjZSgvXFxELywgXCJcIikpID09PSAtMSkge1xuICAgICAgICAgIHJldHVybiBhdXRoLiRjcmVhdGVVc2VyKHtlbWFpbDogY3JlZGVudGlhbHMuZW1haWwsIHBhc3N3b3JkOiBjcmVkZW50aWFscy5wYXNzd29yZH0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgICAgaWYgKCF1c2VyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdXNlci5uYW1lID0gY3JlZGVudGlhbHMubmFtZTtcbiAgICAgICAgICAgIHVzZXIucGhvbmUgPSBjcmVkZW50aWFscy5waG9uZTtcbiAgICAgICAgICAgIHVzZXIuZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgICAgIHVzZXJzLmNoaWxkKHVzZXIudWlkKS5zZXQoe1xuICAgICAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgICAgIHBob25lOiB1c2VyLnBob25lLnJlcGxhY2UoL1xcRC8sIFwiXCIpLFxuICAgICAgICAgICAgICBlbWFpbDogdXNlci5lbWFpbFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHBob25lTnVtcy5wdXNoKGNyZWRlbnRpYWxzLnBob25lLnJlcGxhY2UoL1xcRC8sIFwiXCIpKVxuICAgICAgICAgICAgcmV0dXJuIHVzZXJcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgICAgICBpZiAoIWlucHV0KSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgfSBcbiAgICAgICAgICAgIHZhciBlbWFpbCA9IGNyZWRlbnRpYWxzLmVtYWlsO1xuICAgICAgICAgICAgdmFyIHBhc3N3b3JkID0gY3JlZGVudGlhbHMucGFzc3dvcmQ7XG4gICAgICAgICAgICByZXR1cm4gYXV0aC4kYXV0aFdpdGhQYXNzd29yZCh7XG4gICAgICAgICAgICAgIGVtYWlsOiBlbWFpbCxcbiAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGNvbnNvbGUuZXJyb3IpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBnZXRDdXJyZW50VXNlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiByZWYuZ2V0QXV0aCgpXG4gICAgICB9LFxuICAgICAgc2lnbkluOiBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICB2YXIgZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgdmFyIHBhc3N3b3JkID0gY3JlZGVudGlhbHMucGFzc3dvcmQ7XG4gICAgICAgIHJldHVybiBhdXRoLiRhdXRoV2l0aFBhc3N3b3JkKHtcbiAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChjb25zb2xlLmVycm9yKVxuICAgICAgfVxuICAgIH1cbiAgfSk7IiwiYXBwLmZhY3RvcnkoJ0NoYXRGYWN0b3J5JywgZnVuY3Rpb24oJGZpcmViYXNlLCBSb29tc0ZhY3RvcnkpIHtcblxuICB2YXIgc2VsZWN0ZWRSb29tSWQ7XG4gIHZhciBjaGF0cztcbiAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG5cbiAgcmV0dXJuIHtcbiAgICBhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNoYXRzO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihjaGF0KSB7XG4gICAgICBjaGF0cy4kcmVtb3ZlKGNoYXQpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgIHJlZi5rZXkoKSA9PT0gY2hhdC4kaWQ7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldDogZnVuY3Rpb24oY2hhdElkKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYXRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjaGF0c1tpXS5pZCA9PT0gcGFyc2VJbnQoY2hhdElkKSkge1xuICAgICAgICAgIHJldHVybiBjaGF0c1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICBnZXRTZWxlY3RlZFJvb21OYW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc2VsZWN0ZWRSb29tO1xuICAgICAgaWYgKHNlbGVjdGVkUm9vbUlkICYmIHNlbGVjdGVkUm9vbUlkICE9IG51bGwpIHtcbiAgICAgICAgICBzZWxlY3RlZFJvb20gPSBSb29tc0ZhY3RvcnkuZ2V0KHNlbGVjdGVkUm9vbUlkKTtcbiAgICAgICAgICBpZiAoc2VsZWN0ZWRSb29tKVxuICAgICAgICAgICAgICByZXR1cm4gc2VsZWN0ZWRSb29tLm5hbWU7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZVxuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG4gICAgc2VsZWN0Um9vbTogZnVuY3Rpb24gKHJvb21JZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbGVjdGluZyB0aGUgcm9vbSB3aXRoIGlkOiBcIiArIHJvb21JZCk7XG4gICAgICAgIHNlbGVjdGVkUm9vbUlkID0gcm9vbUlkO1xuICAgICAgICBpZiAoIWlzTmFOKHJvb21JZCkpIHtcbiAgICAgICAgICAgIGNoYXRzID0gJGZpcmViYXNlQXJyYXkocmVmLmNoaWxkKCdyb29tcycpLmNoaWxkKHNlbGVjdGVkUm9vbUlkKS5jaGlsZCgnY2hhdHMnKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHNlbmQ6IGZ1bmN0aW9uIChmcm9tLCBtZXNzYWdlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwic2VuZGluZyBtZXNzYWdlIGZyb20gOlwiICsgZnJvbS5kaXNwbGF5TmFtZSArIFwiICYgbWVzc2FnZSBpcyBcIiArIG1lc3NhZ2UpO1xuICAgICAgICBpZiAoZnJvbSAmJiBtZXNzYWdlKSB7XG4gICAgICAgICAgICB2YXIgY2hhdE1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgZnJvbTogZnJvbS5kaXNwbGF5TmFtZSxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogRmlyZWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2hhdHMuJGFkZChjaGF0TWVzc2FnZSkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibWVzc2FnZSBhZGRlZFwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICB9O1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlclxuXHRcdC5zdGF0ZSgndGFiJywge1xuXHRcdHVybDogJy90YWInLFxuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdGNhY2hlOiBmYWxzZSxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL3RhYnMuaHRtbCdcblx0XHR9KVxufSkiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSkge1xuXG5cbnZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuXG4gICRzY29wZS5zZXR0aW5ncyA9IHtcbiAgICBlbmFibGVGcmllbmRzOiB0cnVlXG4gIH07XG4gIFxuICAkc2NvcGUucGxhY2VzID0gZnVuY3Rpb24oKSB7XG4gIFx0eWVscC5zZWFyY2goeyB0ZXJtOiAnbWV4aWNhbicsIGxvY2F0aW9uOiAnQnJvb2tseW4nIH0pXG4udGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICBjb25zb2xlLmxvZyhkYXRhKTtcbn0pXG4gIH1cblxufSk7XG4iLCJhcHAuY29udHJvbGxlcignQ2hhdEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsIENoYXRGYWN0b3J5LCAkc3RhdGUpIHtcblxuICAkc2NvcGUuSU0gPSB7XG4gICAgdGV4dE1lc3NhZ2U6IFwiXCJcbiAgfTtcblxuICBDaGF0RmFjdG9yeS5zZWxlY3RSb29tKCRzdGF0ZS5wYXJhbXMucm9vbUlkKTtcblxuICB2YXIgcm9vbU5hbWUgPSBDaGF0RmFjdG9yeS5nZXRTZWxlY3RlZFJvb21OYW1lKCk7XG5cbiAgaWYgKHJvb21OYW1lKSB7XG4gICAgICAkc2NvcGUucm9vbU5hbWUgPSBcIiAtIFwiICsgcm9vbU5hbWU7XG4gICAgICAkc2NvcGUuY2hhdHMgPSBDaGF0RmFjdG9yeS5hbGwoKTtcbiAgfVxuXG4gICRzY29wZS5zZW5kTWVzc2FnZSA9IGZ1bmN0aW9uIChtc2cpIHtcbiAgICAgIGNvbnNvbGUubG9nKG1zZyk7XG4gICAgICBDaGF0RmFjdG9yeS5zZW5kKCRzY29wZS5kaXNwbGF5TmFtZSwgbXNnKTtcbiAgICAgICRzY29wZS5JTS50ZXh0TWVzc2FnZSA9IFwiXCI7XG4gIH1cblxuICAkc2NvcGUucmVtb3ZlID0gZnVuY3Rpb24gKGNoYXQpIHtcbiAgICAgIENoYXRGYWN0b3J5LnJlbW92ZShjaGF0KTtcbiAgfVxuXG4gICAgLy8gJHNjb3BlLnNlbmRDaGF0ID0gZnVuY3Rpb24gKGNoYXQpe1xuICAgIC8vICAgaWYgKCRyb290U2NvcGUudXNlcikge1xuICAgIC8vICAgICAvLyBjb25zb2xlLmxvZygndGhpcyBpcyB1c2VyJywgJHJvb3RTY29wZS51c2VyKVxuICAgIC8vICAgICAkc2NvcGUuY2hhdHMuJGFkZCh7XG4gICAgLy8gICAgICAgdXNlcjogJHJvb3RTY29wZS51c2VyLFxuICAgIC8vICAgICAgIG1lc3NhZ2U6IGNoYXQubWVzc2FnZVxuICAgIC8vICAgICB9KTtcbiAgICAvLyAgIGNoYXQubWVzc2FnZSA9IFwiXCI7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuIH0pXG5cbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5jaGF0Jywge1xuICAgIHVybDogJy9jaGF0JyxcbiAgICB2aWV3czoge1xuICAgICAgJ3Jvb21zVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jaGF0L2NoYXQuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDaGF0Q3RybCdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KTsiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignRGFzaEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZSkge1xuXHQkc3RhdGUuZ28oJ3RhYi5jaGF0cycpXG59KSIsImFwcC5jb250cm9sbGVyKCdFdmVudHNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBSb29tc0ZhY3RvcnksIENoYXRGYWN0b3J5LCAkc3RhdGUpIHtcblxuXG4gfSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLmV2ZW50cycsIHtcbiAgICB1cmw6ICcvZXZlbnRzJyxcbiAgICB2aWV3czoge1xuICAgICAgJ2V2ZW50c1ZpZXcnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZXZlbnRzL2V2ZW50cy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0V2ZW50c0N0cmwnXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAkc2NvcGUuY29udGFjdHMgPSBbXCJwZXJzb24xXCIsIFwicGVyc29uMlwiLCBcInBlcnNvbjNcIl07XG4gICRzY29wZS5jaGF0cyA9IFtcImJhcnRcIiwgXCJ3aGlza2V5XCIsIFwibGxvb1wiXTtcbn0pXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgnbG9naW4nLCB7XG4gICAgdXJsOiAnL2xvZ2luJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLCBcbiAgICBjb250cm9sbGVyOiAnUmVnaXN0ZXJDdHJsJ1xuICB9KVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5jcmVhdGVOZXdSb29tJywge1xuICAgIHVybDogJy9jcmVhdGVOZXdSb29tJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3Jvb21zVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9yb29tcy9jcmVhdGVOZXdSb29tLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUm9vbXNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsImFwcC5jb250cm9sbGVyKCdSb29tc0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIFJvb21zRmFjdG9yeSwgQ2hhdEZhY3RvcnksICRzdGF0ZSkge1xuXG4gICAgLy8gJGlvbmljTW9kYWwuZnJvbVRlbXBsYXRlVXJsKCdqcy9sb2dpbi9sb2dpbi5odG1sJywge1xuICAgIC8vICAgICBzY29wZTogJHNjb3BlLFxuICAgIC8vICAgICBhbmltYXRpb246ICdzbGlkZS1pbi11cCdcbiAgICAvLyB9KVxuICAgIC8vIC50aGVuKGZ1bmN0aW9uIChtb2RhbCkge1xuICAgIC8vICRzY29wZS5tb2RhbCA9IG1vZGFsO1xuICAgIC8vIH0pO1xuXG4gICAgJHNjb3BlLnJvb21zID0gUm9vbXNGYWN0b3J5LmFsbCgpO1xuXG4gICAgJHNjb3BlLmNyZWF0ZVJvb20gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygndGFiLmNyZWF0ZU5ld1Jvb20nKTtcbiAgICB9XG5cbiAgICAkc2NvcGUub3BlblJvb20gPSBmdW5jdGlvbiAocm9vbUlkKSB7XG4gICAgICBjb25zb2xlLmxvZygndGhpcyBpcyByb29taWQnLCByb29tSWQpXG4gICAgICAkc3RhdGUuZ28oJ3RhYi5jaGF0Jywge1xuICAgICAgICByb29tSWQ6IHJvb21JZFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmFkZENvbnRhY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vYWRkIHRvIGZpcmViYXNlIGFycmF5IGluIHJvb21zZmFjdG9yeVxuICAgIH1cblxuICAgICRzY29wZS5zYXZlTmV3Um9vbSA9IGZ1bmN0aW9uIChyb29tT2JqKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSByb29tb2JqJywgcm9vbU9iailcbiAgICAgICAgcmV0dXJuIFJvb21zRmFjdG9yeS5hZGQocm9vbU9iaikudGhlbihmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIGlkJywgaWQpXG4gICAgICAgIH0pXG5cbiAgICAgICAgXG4gICAgICAgIC8vYWRkIHRvIGZpcmViYXNlIGFycmF5IGluIHJvb21zZmFjdG9yeVxuICAgIH1cblxuICAgIC8vICRzY29wZS5zZW5kQ2hhdCA9IGZ1bmN0aW9uIChjaGF0KXtcbiAgICAvLyAgIGlmICgkcm9vdFNjb3BlLnVzZXIpIHtcbiAgICAvLyAgICAgLy8gY29uc29sZS5sb2coJ3RoaXMgaXMgdXNlcicsICRyb290U2NvcGUudXNlcilcbiAgICAvLyAgICAgJHNjb3BlLmNoYXRzLiRhZGQoe1xuICAgIC8vICAgICAgIHVzZXI6ICRyb290U2NvcGUudXNlcixcbiAgICAvLyAgICAgICBtZXNzYWdlOiBjaGF0Lm1lc3NhZ2VcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICBjaGF0Lm1lc3NhZ2UgPSBcIlwiO1xuICAgIC8vICAgfVxuICAgIC8vIH1cbiB9KVxuIiwiYXBwLmZhY3RvcnkoJ1Jvb21zRmFjdG9yeScsIGZ1bmN0aW9uKCRmaXJlYmFzZUFycmF5KSB7XG5cbiAgdmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG4gIHZhciByb29tcyA9ICRmaXJlYmFzZUFycmF5KHJlZi5jaGlsZCgnZ3JvdXBzJykpO1xuXG4gIHJldHVybiB7XG5cbiAgICBhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJvb21zO1xuICAgIH0sXG4gICBcbiAgICBnZXQ6IGZ1bmN0aW9uKHJvb21JZCkge1xuICAgICAgcmV0dXJuIHJvb21zLiRnZXRSZWNvcmQocm9vbUlkKTtcbiAgICB9LFxuXG4gICAgYWRkOiBmdW5jdGlvbihyb29tT2JqKSB7XG4gICAgICBjb25zb2xlLmxvZygndGhpcyBpcyByb29tb2JqIGluIGZhYycsIHJvb21PYmopXG4gICAgICByb29tcy4kYWRkKHJvb21PYmopXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSByZWYnLCByZWYpXG4gICAgICAgIHZhciBpZCA9IHJlZi5rZXkoKTtcbiAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgdGhlIGlkJywgaWQpXG4gICAgICAgIHJldHVybiBpZDtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2FkZGVkIHJlY29yZCB3aXRoIGlkJyArIGlkKTtcbiAgICAgICAgLy8gcmV0dXJuIHJvb21zLiRpbmRleEZvcihpZCk7XG4gICAgICAgIC8vc3RhdGUuZ28gdG8gY2hhdCBkZXRhaWwgd2l0aCBuZXcgaWRcbiAgICAgIH0pXG5cbiAgICB9XG4gIH07XG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIucm9vbXMnLCB7XG4gICAgdXJsOiAnL3Jvb21zJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3Jvb21zVmlldyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9yb29tcy9yb29tcy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1Jvb21zQ3RybCdcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gcmVzb2x2ZToge1xuICAgIC8vICAgICBcImN1cnJlbnRBdXRoXCI6IFtcIkF1dGhcIixcbiAgICAvLyAgICAgICAgIGZ1bmN0aW9uIChBdXRoKSB7XG4gICAgLy8gICAgICAgICAgICAgcmV0dXJuIEF1dGguJHdhaXRGb3JBdXRoKCk7XG4gICAgLy8gfV19XG4gIH0pXG59KTsiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignU2V0dGluZ3NDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBjdXJyZW50VXNlciwgJHN0YXRlKSB7XG5cbnZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuXG4gICRzY29wZS51c2VyID0gY3VycmVudFVzZXI7XG5cbiAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgXHRyZWYudW5hdXRoKCk7XG4gIFx0JHN0YXRlLmdvKCdsb2dpbicpXG4gIH1cblxufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCR1cmxSb3V0ZXJQcm92aWRlciwgJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIuc2V0dGluZ3MnLCB7XG4gICAgdXJsOiAnL3NldHRpbmdzLzp1aWQnLFxuICAgIHZpZXdzOiB7XG4gICAgICAnc2V0dGluZ3NWaWV3Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3NldHRpbmdzL3VzZXJJbmZvLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnU2V0dGluZ3NDdHJsJ1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgY3VycmVudFVzZXI6IGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgJGZpcmViYXNlT2JqZWN0KSB7XG4gICAgICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20vdXNlcnMvJyArICRzdGF0ZVBhcmFtcy51aWQpXG4gICAgICAgIHZhciB1c2VyID0gJGZpcmViYXNlT2JqZWN0KHJlZilcbiAgICAgICAgcmV0dXJuIHVzZXJcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KTsiLCJhcHAuY29udHJvbGxlcignUmVnaXN0ZXJDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkZmlyZWJhc2VBdXRoLCBBdXRoRmFjdG9yeSwgJHN0YXRlLCAkcm9vdFNjb3BlLCAkaW9uaWNQb3B1cCkge1xuICAgIFxuICAgIC8vICRpb25pY01vZGFsLmZyb21UZW1wbGF0ZVVybCgnanMvbG9naW4vbG9naW4uaHRtbCcsIHtcbiAgICAvLyBzY29wZTogJHNjb3BlIH0pXG4gICAgLy8gLnRoZW4oZnVuY3Rpb24gKG1vZGFsKSB7XG4gICAgLy8gJHNjb3BlLm1vZGFsID0gbW9kYWw7XG4gICAgLy8gfSk7XG5cblxuICAgICRzY29wZS5zaWduVXAgPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICBjb25zb2xlLmxvZyhBdXRoRmFjdG9yeS5zaWduVXAoY3JlZGVudGlhbHMpKVxuICAgICAgICBpZiAoIUF1dGhGYWN0b3J5LnNpZ25VcChjcmVkZW50aWFscykpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0ludmFsaWQgUGhvbmUgTnVtYmVyJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJ1RoYXQgbnVtYmVyIGlzIGFscmVhZHkgcmVnaXN0ZXJlZCEgUGxlYXNlIHRyeSBhZ2FpbiA6KSdcbiAgICAgICAgICAgIH0pICAgXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBBdXRoRmFjdG9yeS5zaWduVXAoY3JlZGVudGlhbHMpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCd0YWIucm9vbXMnLCB7dWlkOiB1c2VyLnVpZH0pXG4gICAgICAgICAgICB9KSAgICBcbiAgICAgICAgfVxuICAgIH1cbiAgICAkc2NvcGUuc2lnbkluID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgQXV0aEZhY3Rvcnkuc2lnbkluKGNyZWRlbnRpYWxzKVxuICAgICAgICAudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ3RhYi5yb29tcycsIHt1aWQ6IHVzZXIudWlkfSlcbiAgICAgICAgfSlcbiAgICB9XG59KSIsImFwcC5jb250cm9sbGVyKCdVc2VyQ3RybCcsIFtcIiRzY29wZVwiLCBcIiRmaXJlYmFzZVwiLCBcIiRmaXJlYmFzZUF1dGhcIiwgZnVuY3Rpb24oJHNjb3BlLCAkZmlyZWJhc2UsICRmaXJlYmFzZUF1dGgpIHtcblx0dmFyIHJlZiA9IG5ldyBGaXJlYmFzZSgnaHR0cHM6Ly9ib2lsaW5nLWZpcmUtMzE2MS5maXJlYmFzZWlvLmNvbScpXG5cdFxufV0pIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
