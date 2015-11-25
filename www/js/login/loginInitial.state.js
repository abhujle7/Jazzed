app.config(function($urlRouterProvider, $stateProvider) {
  $stateProvider
  .state('tab.signup', {
    url: '/signup',
    views: {
      'tab-signup': {
        templateUrl: 'templates/login.html',
        controller: 'RegisterCtrl'
      }
    }
  })
});