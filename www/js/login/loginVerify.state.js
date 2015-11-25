app.config(function($urlRouterProvider, $stateProvider) {
  $stateProvider
  .state('tab.loginVerify', {
    url: '/login',
    views: {
      'tab-loginVerify': {
        templateUrl: 'templates/loginVerify.html',
        controller: 'LoginCtrl'
      }
    }
  })
});
