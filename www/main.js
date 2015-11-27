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
  $urlRouterProvider.otherwise('/tab/dash');
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
'use strict';
// angular.module('starter.services', [])

app.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Anup',
    lastText: 'Roti is the best',
    face: 'https://avatars3.githubusercontent.com/u/13772252?v=3&s=460'
  }, {
    id: 1,
    name: 'Josh',
    lastText: 'I like guitar Hero and burritos',
    face: 'https://avatars3.githubusercontent.com/u/13457236?v=3&s=460'
  }, {
    id: 2,
    name: 'Silvia',
    lastText: 'We should go to the Financier',
    face: 'https://avatars2.githubusercontent.com/u/13826062?v=3&s=460'
  }, {
    id: 3,
    name: 'David',
    lastText: 'Lets play Avalon',
    face: 'https://avatars3.githubusercontent.com/u/5333764?v=3&s=460'
  //   id: 4,
  //   name: 'to tu',
  //   lastText: 'This is wicked good ice cream.',
  //   face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});

app.config(function($stateProvider) {
	$stateProvider
		.state('tab', {
		url: '/tab',
		abstract: true,
		templateUrl: 'templates/tabs.html'
		})
})
// angular.module('starter.controllers', [])

app.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

app.config(function($stateProvider) {
  $stateProvider
  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })
});
// angular.module('starter.controllers', [])

app.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})


app.config(function($stateProvider) {

  $stateProvider
  .state('tab.chats', {
    url: '/chats',
    views: {
      'tab-chats': {
        templateUrl: 'templates/tab-chats.html',
        controller: 'ChatsCtrl'
      }
    }
  })
});
// angular.module('starter.controllers', [])

app.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})
app.config(function($stateProvider) {

  $stateProvider

  .state('tab.chat-detail', {
    url: '/chats/:chatId',
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  })
});
// angular.module('starter.controllers', [])

app.controller('DashCtrl', function($scope, $state) {
	$state.go('tab.login')
})
app.config(function($stateProvider) {
  $stateProvider
  .state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
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
      'tab-login': {
        templateUrl: 'templates/login.html',
        controller: 'RegisterCtrl'
      }
    }
  })
});
app.controller('RegisterCtrl', function($scope, $firebaseAuth, AuthFactory, $state) {
    $scope.signUp = function(credentials) {
        AuthFactory.signUp(credentials)
    }
    $scope.signIn = function(credentials) {
        AuthFactory.signIn(credentials)
        .then(function(user) {
            $state.go('tab.dash')
        })
    }
})
app.controller('UserCtrl', ["$scope", "$firebase", "$firebaseAuth", function($scope, $firebase, $firebaseAuth) {
	var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')
	
}])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImF1dGguZmFjdG9yeS5qcyIsIm1haW4uZmFjdG9yeS5qcyIsInRhYlN0YXRlLmpzIiwiYWNjb3VudC9hY2NvdW50LmNvbnRyb2xsZXIuanMiLCJhY2NvdW50L3RhYi5hY2NvdW50LnN0YXRlLmpzIiwiY2hhdHMvY2hhdHMuY29udHJvbGxlci5qcyIsImNoYXRzL3RhYi5jaGF0cy5zdGF0ZS5qcyIsImNoYXQuZGV0YWlsL2NoYXQuZGV0YWlsLmNvbnRyb2xsZXIuanMiLCJjaGF0LmRldGFpbC90YWIuY2hhdC5kZXRhaWwuc3RhdGUuanMiLCJkYXNoL2Rhc2guY29udHJvbGxlci5qcyIsImRhc2gvdGFiLmRhc2guc3RhdGUuanMiLCJsb2dpbi9sb2dpbi5jb250cm9sbGVyLmpzIiwibG9naW4vbG9naW4uc3RhdGUuanMiLCJjb250cm9sbGVycy9zaWdudXAtY29udHJvbGxlci5qcyIsImNvbnRyb2xsZXJzL3VzZXItY29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1ZBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vLyBJb25pYyBTdGFydGVyIEFwcFxuXG4vLyBhbmd1bGFyLm1vZHVsZSBpcyBhIGdsb2JhbCBwbGFjZSBmb3IgY3JlYXRpbmcsIHJlZ2lzdGVyaW5nIGFuZCByZXRyaWV2aW5nIEFuZ3VsYXIgbW9kdWxlc1xuLy8gJ3N0YXJ0ZXInIGlzIHRoZSBuYW1lIG9mIHRoaXMgYW5ndWxhciBtb2R1bGUgZXhhbXBsZSAoYWxzbyBzZXQgaW4gYSA8Ym9keT4gYXR0cmlidXRlIGluIGluZGV4Lmh0bWwpXG4vLyB0aGUgMm5kIHBhcmFtZXRlciBpcyBhbiBhcnJheSBvZiAncmVxdWlyZXMnXG4vLyAnc3RhcnRlci5zZXJ2aWNlcycgaXMgZm91bmQgaW4gc2VydmljZXMuanNcbi8vICdzdGFydGVyLmNvbnRyb2xsZXJzJyBpcyBmb3VuZCBpbiBjb250cm9sbGVycy5qc1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyJywgWydpb25pYycsIFwiZmlyZWJhc2VcIl0pXG5cbmFwcC5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICBpZiAod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucyAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG5cbiAgICB9XG4gICAgaWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG4gIH0pO1xufSlcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkdXJsUm91dGVyUHJvdmlkZXIpIHtcbiAgLy8gaWYgbm9uZSBvZiB0aGUgYWJvdmUgc3RhdGVzIGFyZSBtYXRjaGVkLCB1c2UgdGhpcyBhcyB0aGUgZmFsbGJhY2tcbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL3RhYi9kYXNoJyk7XG59KTtcbiIsImFwcC5mYWN0b3J5KFwiQXV0aEZhY3RvcnlcIiwgZnVuY3Rpb24oJGZpcmViYXNlT2JqZWN0LCAkZmlyZWJhc2VBdXRoLCAkZmlyZWJhc2VBcnJheSkge1xuICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoJ2h0dHBzOi8vYm9pbGluZy1maXJlLTMxNjEuZmlyZWJhc2Vpby5jb20nKVxuICAgIHZhciBhdXRoID0gJGZpcmViYXNlQXV0aChyZWYpO1xuICAgIHZhciB1c2VycyA9IHJlZi5jaGlsZCgndXNlcnMnKVxuICAgIHJldHVybiB7XG4gICAgICBzaWduVXA6IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgIHJldHVybiBhdXRoLiRjcmVhdGVVc2VyKHtlbWFpbDogY3JlZGVudGlhbHMuZW1haWwsIHBhc3N3b3JkOiBjcmVkZW50aWFscy5wYXNzd29yZH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICB1c2VyLm5hbWUgPSBjcmVkZW50aWFscy5uYW1lO1xuICAgICAgICAgIHVzZXIucGhvbmUgPSBjcmVkZW50aWFscy5waG9uZTtcbiAgICAgICAgICB1c2VyLmVtYWlsID0gY3JlZGVudGlhbHMuZW1haWw7XG4gICAgICAgICAgdXNlcnMuY2hpbGQodXNlci51aWQpLnNldCh7XG4gICAgICAgICAgICBuYW1lOiB1c2VyLm5hbWUsXG4gICAgICAgICAgICBwaG9uZTogdXNlci5waG9uZSxcbiAgICAgICAgICAgIGVtYWlsOiB1c2VyLmVtYWlsXG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm4gdXNlclxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgICB2YXIgcGFzc3dvcmQgPSBjcmVkZW50aWFscy5wYXNzd29yZDtcbiAgICAgICAgICByZXR1cm4gYXV0aC4kYXV0aFdpdGhQYXNzd29yZCh7XG4gICAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgICB9KVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goY29uc29sZS5lcnJvcilcbiAgICAgIH0sXG4gICAgICBnZXRDdXJyZW50VXNlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlZi5nZXRBdXRoKCkpXG4gICAgICAgIHJldHVybiByZWYuZ2V0QXV0aCgpXG4gICAgICB9LFxuICAgICAgc2lnbkluOiBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICB2YXIgZW1haWwgPSBjcmVkZW50aWFscy5lbWFpbDtcbiAgICAgICAgdmFyIHBhc3N3b3JkID0gY3JlZGVudGlhbHMucGFzc3dvcmQ7XG4gICAgICAgIHJldHVybiBhdXRoLiRhdXRoV2l0aFBhc3N3b3JkKHtcbiAgICAgICAgICBlbWFpbDogZW1haWwsXG4gICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChjb25zb2xlLmVycm9yKVxuICAgICAgfVxuICAgIH1cbiAgfSk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuc2VydmljZXMnLCBbXSlcblxuYXBwLmZhY3RvcnkoJ0NoYXRzJywgZnVuY3Rpb24oKSB7XG4gIC8vIE1pZ2h0IHVzZSBhIHJlc291cmNlIGhlcmUgdGhhdCByZXR1cm5zIGEgSlNPTiBhcnJheVxuXG4gIC8vIFNvbWUgZmFrZSB0ZXN0aW5nIGRhdGFcbiAgdmFyIGNoYXRzID0gW3tcbiAgICBpZDogMCxcbiAgICBuYW1lOiAnQW51cCcsXG4gICAgbGFzdFRleHQ6ICdSb3RpIGlzIHRoZSBiZXN0JyxcbiAgICBmYWNlOiAnaHR0cHM6Ly9hdmF0YXJzMy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xMzc3MjI1Mj92PTMmcz00NjAnXG4gIH0sIHtcbiAgICBpZDogMSxcbiAgICBuYW1lOiAnSm9zaCcsXG4gICAgbGFzdFRleHQ6ICdJIGxpa2UgZ3VpdGFyIEhlcm8gYW5kIGJ1cnJpdG9zJyxcbiAgICBmYWNlOiAnaHR0cHM6Ly9hdmF0YXJzMy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xMzQ1NzIzNj92PTMmcz00NjAnXG4gIH0sIHtcbiAgICBpZDogMixcbiAgICBuYW1lOiAnU2lsdmlhJyxcbiAgICBsYXN0VGV4dDogJ1dlIHNob3VsZCBnbyB0byB0aGUgRmluYW5jaWVyJyxcbiAgICBmYWNlOiAnaHR0cHM6Ly9hdmF0YXJzMi5naXRodWJ1c2VyY29udGVudC5jb20vdS8xMzgyNjA2Mj92PTMmcz00NjAnXG4gIH0sIHtcbiAgICBpZDogMyxcbiAgICBuYW1lOiAnRGF2aWQnLFxuICAgIGxhc3RUZXh0OiAnTGV0cyBwbGF5IEF2YWxvbicsXG4gICAgZmFjZTogJ2h0dHBzOi8vYXZhdGFyczMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvNTMzMzc2ND92PTMmcz00NjAnXG4gIC8vICAgaWQ6IDQsXG4gIC8vICAgbmFtZTogJ3RvIHR1JyxcbiAgLy8gICBsYXN0VGV4dDogJ1RoaXMgaXMgd2lja2VkIGdvb2QgaWNlIGNyZWFtLicsXG4gIC8vICAgZmFjZTogJ2ltZy9taWtlLnBuZydcbiAgfV07XG5cbiAgcmV0dXJuIHtcbiAgICBhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNoYXRzO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihjaGF0KSB7XG4gICAgICBjaGF0cy5zcGxpY2UoY2hhdHMuaW5kZXhPZihjaGF0KSwgMSk7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGNoYXRJZCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGF0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY2hhdHNbaV0uaWQgPT09IHBhcnNlSW50KGNoYXRJZCkpIHtcbiAgICAgICAgICByZXR1cm4gY2hhdHNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlclxuXHRcdC5zdGF0ZSgndGFiJywge1xuXHRcdHVybDogJy90YWInLFxuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3RhYnMuaHRtbCdcblx0XHR9KVxufSkiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgJHNjb3BlLnNldHRpbmdzID0ge1xuICAgIGVuYWJsZUZyaWVuZHM6IHRydWVcbiAgfTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5hY2NvdW50Jywge1xuICAgIHVybDogJy9hY2NvdW50JyxcbiAgICB2aWV3czoge1xuICAgICAgJ3RhYi1hY2NvdW50Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90YWItYWNjb3VudC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0FjY291bnRDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsIi8vIGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyLmNvbnRyb2xsZXJzJywgW10pXG5cbmFwcC5jb250cm9sbGVyKCdDaGF0c0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsIENoYXRzKSB7XG4gIC8vIFdpdGggdGhlIG5ldyB2aWV3IGNhY2hpbmcgaW4gSW9uaWMsIENvbnRyb2xsZXJzIGFyZSBvbmx5IGNhbGxlZFxuICAvLyB3aGVuIHRoZXkgYXJlIHJlY3JlYXRlZCBvciBvbiBhcHAgc3RhcnQsIGluc3RlYWQgb2YgZXZlcnkgcGFnZSBjaGFuZ2UuXG4gIC8vIFRvIGxpc3RlbiBmb3Igd2hlbiB0aGlzIHBhZ2UgaXMgYWN0aXZlIChmb3IgZXhhbXBsZSwgdG8gcmVmcmVzaCBkYXRhKSxcbiAgLy8gbGlzdGVuIGZvciB0aGUgJGlvbmljVmlldy5lbnRlciBldmVudDpcbiAgLy9cbiAgLy8kc2NvcGUuJG9uKCckaW9uaWNWaWV3LmVudGVyJywgZnVuY3Rpb24oZSkge1xuICAvL30pO1xuXG4gICRzY29wZS5jaGF0cyA9IENoYXRzLmFsbCgpO1xuICAkc2NvcGUucmVtb3ZlID0gZnVuY3Rpb24oY2hhdCkge1xuICAgIENoYXRzLnJlbW92ZShjaGF0KTtcbiAgfTtcbn0pXG5cbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5jaGF0cycsIHtcbiAgICB1cmw6ICcvY2hhdHMnLFxuICAgIHZpZXdzOiB7XG4gICAgICAndGFiLWNoYXRzJzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90YWItY2hhdHMuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDaGF0c0N0cmwnXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiLy8gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuY29udHJvbGxlcnMnLCBbXSlcblxuYXBwLmNvbnRyb2xsZXIoJ0NoYXREZXRhaWxDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMsIENoYXRzKSB7XG4gICRzY29wZS5jaGF0ID0gQ2hhdHMuZ2V0KCRzdGF0ZVBhcmFtcy5jaGF0SWQpO1xufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcblxuICAuc3RhdGUoJ3RhYi5jaGF0LWRldGFpbCcsIHtcbiAgICB1cmw6ICcvY2hhdHMvOmNoYXRJZCcsXG4gICAgdmlld3M6IHtcbiAgICAgICd0YWItY2hhdHMnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2NoYXQtZGV0YWlsLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2hhdERldGFpbEN0cmwnXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiLy8gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuY29udHJvbGxlcnMnLCBbXSlcblxuYXBwLmNvbnRyb2xsZXIoJ0Rhc2hDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGUpIHtcblx0JHN0YXRlLmdvKCd0YWIubG9naW4nKVxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgndGFiLmRhc2gnLCB7XG4gICAgdXJsOiAnL2Rhc2gnLFxuICAgIHZpZXdzOiB7XG4gICAgICAndGFiLWRhc2gnOiB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3RhYi1kYXNoLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnRGFzaEN0cmwnXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSkge1xuICAkc2NvcGUuY29udGFjdHMgPSBbXCJwZXJzb24xXCIsIFwicGVyc29uMlwiLCBcInBlcnNvbjNcIl07XG4gICRzY29wZS5jaGF0cyA9IFtcImJhcnRcIiwgXCJ3aGlza2V5XCIsIFwibGxvb1wiXTtcbn0pXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCR1cmxSb3V0ZXJQcm92aWRlciwgJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIubG9naW4nLCB7XG4gICAgdXJsOiAnL2xvZ2luJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3RhYi1sb2dpbic6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdSZWdpc3RlckN0cmwnXG4gICAgICB9XG4gICAgfVxuICB9KVxufSk7IiwiYXBwLmNvbnRyb2xsZXIoJ1JlZ2lzdGVyQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJGZpcmViYXNlQXV0aCwgQXV0aEZhY3RvcnksICRzdGF0ZSkge1xuICAgICRzY29wZS5zaWduVXAgPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICBBdXRoRmFjdG9yeS5zaWduVXAoY3JlZGVudGlhbHMpXG4gICAgfVxuICAgICRzY29wZS5zaWduSW4gPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICBBdXRoRmFjdG9yeS5zaWduSW4oY3JlZGVudGlhbHMpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLmRhc2gnKVxuICAgICAgICB9KVxuICAgIH1cbn0pIiwiYXBwLmNvbnRyb2xsZXIoJ1VzZXJDdHJsJywgW1wiJHNjb3BlXCIsIFwiJGZpcmViYXNlXCIsIFwiJGZpcmViYXNlQXV0aFwiLCBmdW5jdGlvbigkc2NvcGUsICRmaXJlYmFzZSwgJGZpcmViYXNlQXV0aCkge1xuXHR2YXIgcmVmID0gbmV3IEZpcmViYXNlKCdodHRwczovL2JvaWxpbmctZmlyZS0zMTYxLmZpcmViYXNlaW8uY29tJylcblx0XG59XSkiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
