'use strict';
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
window.app = angular.module('starter', ['ionic', "firebase"]);

app.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
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
});

app.config(function ($urlRouterProvider) {
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');
});

app.factory("User", ["$firebaseObject", function ($firebaseObject) {
  // create a new service based on $firebaseObject
  var User = $firebaseObject.$extend({
    // these methods exist on the prototype, so we can access the data using `this`
    getFullName: function getFullName() {
      return this.firstName + " " + this.lastName;
    }
  });
  return function (userId) {
    var ref = new Firebase("https://<YOUR-FIREBASE-APP>.firebaseio.com/users/").child(userId);
    // create an instance of User (the new operator is required)
    return new User(ref);
  };
}]);
'use strict';
// angular.module('starter.services', [])

app.factory('Chats', function () {
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
    all: function all() {
      return chats;
    },
    remove: function remove(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function get(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});

app.config(function ($stateProvider) {
  $stateProvider.state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  });
});
// angular.module('starter.controllers', [])

app.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
});
app.config(function ($stateProvider) {

  $stateProvider.state('tab.chat-detail', {
    url: '/chats/:chatId',
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  });
});
// angular.module('starter.controllers', [])

app.controller('AccountCtrl', function ($scope) {
  $scope.settings = {
    enableFriends: true
  };
});

app.config(function ($stateProvider) {
  $stateProvider.state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  });
});
// angular.module('starter.controllers', [])

app.controller('DashCtrl', function ($scope) {});
app.config(function ($stateProvider) {

  $stateProvider.state('tab.dash', {
    url: '/dash',
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  });
});
// angular.module('starter.controllers', [])

app.controller('ChatsCtrl', function ($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function (chat) {
    Chats.remove(chat);
  };
});

app.config(function ($stateProvider) {

  $stateProvider.state('tab.chats', {
    url: '/chats',
    views: {
      'tab-chats': {
        templateUrl: 'templates/tab-chats.html',
        controller: 'ChatsCtrl'
      }
    }
  });
});
app.controller('LoginCtrl', function ($scope) {
  $scope.contacts = ["person1", "person2", "person3"];
  $scope.groups = ["bart", "whiskey", "lloo"];
});

app.config(function ($urlRouterProvider, $stateProvider) {
  $stateProvider.state('tab.login', {
    url: '/login',
    views: {
      'tab-login': {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }
    }
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImZpcmUuZmFjdG9yeS5qcyIsIm1haW4uZmFjdG9yeS5qcyIsInRhYlN0YXRlLmpzIiwiY2hhdC5kZXRhaWwvY2hhdC5kZXRhaWwuY29udHJvbGxlci5qcyIsImNoYXQuZGV0YWlsL3RhYi5jaGF0LmRldGFpbC5zdGF0ZS5qcyIsImFjY291bnQvYWNjb3VudC5jb250cm9sbGVyLmpzIiwiYWNjb3VudC90YWIuYWNjb3VudC5zdGF0ZS5qcyIsImRhc2gvZGFzaC5jb250cm9sbGVyLmpzIiwiZGFzaC90YWIuZGFzaC5zdGF0ZS5qcyIsImNoYXRzL2NoYXRzLmNvbnRyb2xsZXIuanMiLCJjaGF0cy90YWIuY2hhdHMuc3RhdGUuanMiLCJsb2dpbi9sb2dpbi5jb250cm9sbGVyLmpzIiwibG9naW4vbG9naW4uc3RhdGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBQSxDQUFBOzs7Ozs7OztBQVFBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsWUFBQTs7O0FBR0EsUUFBQSxNQUFBLENBQUEsT0FBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLHdCQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxhQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7S0FFQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQTs7QUFFQSxlQUFBLENBQUEsWUFBQSxFQUFBLENBQUE7S0FDQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQTs7QUFFQSxvQkFBQSxDQUFBLFNBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUM3QkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxpQkFBQSxFQUNBLFVBQUEsZUFBQSxFQUFBOztBQUVBLE1BQUEsSUFBQSxHQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUE7O0FBRUEsZUFBQSxFQUFBLHVCQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsU0FBQSxHQUFBLEdBQUEsR0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBLENBQUE7QUFDQSxTQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsUUFBQSxHQUFBLEdBQUEsSUFBQSxRQUFBLENBQUEsbURBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTs7QUFFQSxXQUFBLElBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQ0EsQ0FBQSxDQUFBO0FDZkEsWUFBQSxDQUFBOzs7QUFHQSxHQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsRUFBQSxZQUFBOzs7O0FBSUEsTUFBQSxLQUFBLEdBQUEsQ0FBQTtBQUNBLE1BQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxFQUFBLE1BQUE7QUFDQSxZQUFBLEVBQUEsa0JBQUE7QUFDQSxRQUFBLEVBQUEsNkRBQUE7R0FDQSxFQUFBO0FBQ0EsTUFBQSxFQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsTUFBQTtBQUNBLFlBQUEsRUFBQSxpQ0FBQTtBQUNBLFFBQUEsRUFBQSw2REFBQTtHQUNBLEVBQUE7QUFDQSxNQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxRQUFBO0FBQ0EsWUFBQSxFQUFBLCtCQUFBO0FBQ0EsUUFBQSxFQUFBLDZEQUFBO0dBQ0EsRUFBQTtBQUNBLE1BQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxFQUFBLE9BQUE7QUFDQSxZQUFBLEVBQUEsa0JBQUE7QUFDQSxRQUFBLEVBQUEsNERBQUE7Ozs7O0dBS0EsQ0FBQSxDQUFBOztBQUVBLFNBQUE7QUFDQSxPQUFBLEVBQUEsZUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7QUFDQSxVQUFBLEVBQUEsZ0JBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7QUFDQSxPQUFBLEVBQUEsYUFBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsS0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsS0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEVBQUE7QUFDQSxpQkFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7U0FDQTtPQUNBO0FBQ0EsYUFBQSxJQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDakRBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUNBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsTUFBQTtBQUNBLFlBQUEsRUFBQSxJQUFBO0FBQ0EsZUFBQSxFQUFBLHFCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7QUNMQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNKQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGdCQUFBLENBRUEsS0FBQSxDQUFBLGlCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsZ0JBQUE7QUFDQSxTQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSw0QkFBQTtBQUNBLGtCQUFBLEVBQUEsZ0JBQUE7T0FDQTtLQUNBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7QUNYQSxHQUFBLENBQUEsVUFBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQ05BLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUNBLEtBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsVUFBQTtBQUNBLFNBQUEsRUFBQTtBQUNBLG1CQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLDRCQUFBO0FBQ0Esa0JBQUEsRUFBQSxhQUFBO09BQ0E7S0FDQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7O0FDVEEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7QUNGQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGdCQUFBLENBRUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxPQUFBO0FBQ0EsU0FBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQTtBQUNBLG1CQUFBLEVBQUEseUJBQUE7QUFDQSxrQkFBQSxFQUFBLFVBQUE7T0FDQTtLQUNBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7QUNYQSxHQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUE7Ozs7Ozs7OztBQVNBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQ2ZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFFBQUE7QUFDQSxTQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSwwQkFBQTtBQUNBLGtCQUFBLEVBQUEsV0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNaQSxHQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsQ0FBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEsTUFBQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDSEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFFBQUE7QUFDQSxTQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSxzQkFBQTtBQUNBLGtCQUFBLEVBQUEsV0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0Jztcbi8vIElvbmljIFN0YXJ0ZXIgQXBwXG5cbi8vIGFuZ3VsYXIubW9kdWxlIGlzIGEgZ2xvYmFsIHBsYWNlIGZvciBjcmVhdGluZywgcmVnaXN0ZXJpbmcgYW5kIHJldHJpZXZpbmcgQW5ndWxhciBtb2R1bGVzXG4vLyAnc3RhcnRlcicgaXMgdGhlIG5hbWUgb2YgdGhpcyBhbmd1bGFyIG1vZHVsZSBleGFtcGxlIChhbHNvIHNldCBpbiBhIDxib2R5PiBhdHRyaWJ1dGUgaW4gaW5kZXguaHRtbClcbi8vIHRoZSAybmQgcGFyYW1ldGVyIGlzIGFuIGFycmF5IG9mICdyZXF1aXJlcydcbi8vICdzdGFydGVyLnNlcnZpY2VzJyBpcyBmb3VuZCBpbiBzZXJ2aWNlcy5qc1xuLy8gJ3N0YXJ0ZXIuY29udHJvbGxlcnMnIGlzIGZvdW5kIGluIGNvbnRyb2xsZXJzLmpzXG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXInLCBbJ2lvbmljJywgXCJmaXJlYmFzZVwiXSlcblxuYXBwLnJ1bihmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxuICAgIGlmICh3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcblxuICAgIH1cbiAgICBpZiAod2luZG93LlN0YXR1c0Jhcikge1xuICAgICAgLy8gb3JnLmFwYWNoZS5jb3Jkb3ZhLnN0YXR1c2JhciByZXF1aXJlZFxuICAgICAgU3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuICAgIH1cbiAgfSk7XG59KVxuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCR1cmxSb3V0ZXJQcm92aWRlcikge1xuICAvLyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvdGFiL2Rhc2gnKTtcbn0pO1xuIiwiYXBwLmZhY3RvcnkoXCJVc2VyXCIsIFtcIiRmaXJlYmFzZU9iamVjdFwiLFxuICBmdW5jdGlvbigkZmlyZWJhc2VPYmplY3QpIHtcbiAgICAvLyBjcmVhdGUgYSBuZXcgc2VydmljZSBiYXNlZCBvbiAkZmlyZWJhc2VPYmplY3RcbiAgICB2YXIgVXNlciA9ICRmaXJlYmFzZU9iamVjdC4kZXh0ZW5kKHtcbiAgICAgIC8vIHRoZXNlIG1ldGhvZHMgZXhpc3Qgb24gdGhlIHByb3RvdHlwZSwgc28gd2UgY2FuIGFjY2VzcyB0aGUgZGF0YSB1c2luZyBgdGhpc2BcbiAgICAgIGdldEZ1bGxOYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmlyc3ROYW1lICsgXCIgXCIgKyB0aGlzLmxhc3ROYW1lO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBmdW5jdGlvbih1c2VySWQpIHtcbiAgICAgIHZhciByZWYgPSBuZXcgRmlyZWJhc2UoXCJodHRwczovLzxZT1VSLUZJUkVCQVNFLUFQUD4uZmlyZWJhc2Vpby5jb20vdXNlcnMvXCIpLmNoaWxkKHVzZXJJZCk7XG4gICAgICAvLyBjcmVhdGUgYW4gaW5zdGFuY2Ugb2YgVXNlciAodGhlIG5ldyBvcGVyYXRvciBpcyByZXF1aXJlZClcbiAgICAgIHJldHVybiBuZXcgVXNlcihyZWYpO1xuICAgIH1cbiAgfVxuXSk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuc2VydmljZXMnLCBbXSlcblxuYXBwLmZhY3RvcnkoJ0NoYXRzJywgZnVuY3Rpb24oKSB7XG4gIC8vIE1pZ2h0IHVzZSBhIHJlc291cmNlIGhlcmUgdGhhdCByZXR1cm5zIGEgSlNPTiBhcnJheVxuXG4gIC8vIFNvbWUgZmFrZSB0ZXN0aW5nIGRhdGFcbiAgdmFyIGNoYXRzID0gW3tcbiAgICBpZDogMCxcbiAgICBuYW1lOiAnQW51cCcsXG4gICAgbGFzdFRleHQ6ICdSb3RpIGlzIHRoZSBiZXN0JyxcbiAgICBmYWNlOiAnaHR0cHM6Ly9hdmF0YXJzMy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xMzc3MjI1Mj92PTMmcz00NjAnXG4gIH0sIHtcbiAgICBpZDogMSxcbiAgICBuYW1lOiAnSm9zaCcsXG4gICAgbGFzdFRleHQ6ICdJIGxpa2UgZ3VpdGFyIEhlcm8gYW5kIGJ1cnJpdG9zJyxcbiAgICBmYWNlOiAnaHR0cHM6Ly9hdmF0YXJzMy5naXRodWJ1c2VyY29udGVudC5jb20vdS8xMzQ1NzIzNj92PTMmcz00NjAnXG4gIH0sIHtcbiAgICBpZDogMixcbiAgICBuYW1lOiAnU2lsdmlhJyxcbiAgICBsYXN0VGV4dDogJ1dlIHNob3VsZCBnbyB0byB0aGUgRmluYW5jaWVyJyxcbiAgICBmYWNlOiAnaHR0cHM6Ly9hdmF0YXJzMi5naXRodWJ1c2VyY29udGVudC5jb20vdS8xMzgyNjA2Mj92PTMmcz00NjAnXG4gIH0sIHtcbiAgICBpZDogMyxcbiAgICBuYW1lOiAnRGF2aWQnLFxuICAgIGxhc3RUZXh0OiAnTGV0cyBwbGF5IEF2YWxvbicsXG4gICAgZmFjZTogJ2h0dHBzOi8vYXZhdGFyczMuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3UvNTMzMzc2ND92PTMmcz00NjAnXG4gIC8vICAgaWQ6IDQsXG4gIC8vICAgbmFtZTogJ3RvIHR1JyxcbiAgLy8gICBsYXN0VGV4dDogJ1RoaXMgaXMgd2lja2VkIGdvb2QgaWNlIGNyZWFtLicsXG4gIC8vICAgZmFjZTogJ2ltZy9taWtlLnBuZydcbiAgfV07XG5cbiAgcmV0dXJuIHtcbiAgICBhbGw6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGNoYXRzO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihjaGF0KSB7XG4gICAgICBjaGF0cy5zcGxpY2UoY2hhdHMuaW5kZXhPZihjaGF0KSwgMSk7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGNoYXRJZCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGF0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY2hhdHNbaV0uaWQgPT09IHBhcnNlSW50KGNoYXRJZCkpIHtcbiAgICAgICAgICByZXR1cm4gY2hhdHNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlclxuXHRcdC5zdGF0ZSgndGFiJywge1xuXHRcdHVybDogJy90YWInLFxuXHRcdGFic3RyYWN0OiB0cnVlLFxuXHRcdHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3RhYnMuaHRtbCdcblx0XHR9KVxufSkiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignQ2hhdERldGFpbEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgQ2hhdHMpIHtcbiAgJHNjb3BlLmNoYXQgPSBDaGF0cy5nZXQoJHN0YXRlUGFyYW1zLmNoYXRJZCk7XG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuXG4gIC5zdGF0ZSgndGFiLmNoYXQtZGV0YWlsJywge1xuICAgIHVybDogJy9jaGF0cy86Y2hhdElkJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3RhYi1jaGF0cyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvY2hhdC1kZXRhaWwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDaGF0RGV0YWlsQ3RybCdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KTsiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgJHNjb3BlLnNldHRpbmdzID0ge1xuICAgIGVuYWJsZUZyaWVuZHM6IHRydWVcbiAgfTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5hY2NvdW50Jywge1xuICAgIHVybDogJy9hY2NvdW50JyxcbiAgICB2aWV3czoge1xuICAgICAgJ3RhYi1hY2NvdW50Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90YWItYWNjb3VudC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0FjY291bnRDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsIi8vIGFuZ3VsYXIubW9kdWxlKCdzdGFydGVyLmNvbnRyb2xsZXJzJywgW10pXG5cbmFwcC5jb250cm9sbGVyKCdEYXNoQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSkge30pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG5cbiAgLnN0YXRlKCd0YWIuZGFzaCcsIHtcbiAgICB1cmw6ICcvZGFzaCcsXG4gICAgdmlld3M6IHtcbiAgICAgICd0YWItZGFzaCc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdGFiLWRhc2guaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdEYXNoQ3RybCdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KTsiLCIvLyBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKVxuXG5hcHAuY29udHJvbGxlcignQ2hhdHNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBDaGF0cykge1xuICAvLyBXaXRoIHRoZSBuZXcgdmlldyBjYWNoaW5nIGluIElvbmljLCBDb250cm9sbGVycyBhcmUgb25seSBjYWxsZWRcbiAgLy8gd2hlbiB0aGV5IGFyZSByZWNyZWF0ZWQgb3Igb24gYXBwIHN0YXJ0LCBpbnN0ZWFkIG9mIGV2ZXJ5IHBhZ2UgY2hhbmdlLlxuICAvLyBUbyBsaXN0ZW4gZm9yIHdoZW4gdGhpcyBwYWdlIGlzIGFjdGl2ZSAoZm9yIGV4YW1wbGUsIHRvIHJlZnJlc2ggZGF0YSksXG4gIC8vIGxpc3RlbiBmb3IgdGhlICRpb25pY1ZpZXcuZW50ZXIgZXZlbnQ6XG4gIC8vXG4gIC8vJHNjb3BlLiRvbignJGlvbmljVmlldy5lbnRlcicsIGZ1bmN0aW9uKGUpIHtcbiAgLy99KTtcblxuICAkc2NvcGUuY2hhdHMgPSBDaGF0cy5hbGwoKTtcbiAgJHNjb3BlLnJlbW92ZSA9IGZ1bmN0aW9uKGNoYXQpIHtcbiAgICBDaGF0cy5yZW1vdmUoY2hhdCk7XG4gIH07XG59KVxuXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCd0YWIuY2hhdHMnLCB7XG4gICAgdXJsOiAnL2NoYXRzJyxcbiAgICB2aWV3czoge1xuICAgICAgJ3RhYi1jaGF0cyc6IHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdGFiLWNoYXRzLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2hhdHNDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pOyIsImFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgJHNjb3BlLmNvbnRhY3RzID0gW1wicGVyc29uMVwiLCBcInBlcnNvbjJcIiwgXCJwZXJzb24zXCJdO1xuICAkc2NvcGUuZ3JvdXBzID0gW1wiYmFydFwiLCBcIndoaXNrZXlcIiwgXCJsbG9vXCJdO1xufSlcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHVybFJvdXRlclByb3ZpZGVyLCAkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAuc3RhdGUoJ3RhYi5sb2dpbicsIHtcbiAgICB1cmw6ICcvbG9naW4nLFxuICAgIHZpZXdzOiB7XG4gICAgICAndGFiLWxvZ2luJzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
