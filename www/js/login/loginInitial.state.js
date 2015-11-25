app.config(function($urlRouterProvider, $stateProvider) {
  $stateProvider
  .state('tab.login', {
    url: '/login',
    views: {
      'tab-login': {
        templateUrl: 'templates/loginInitial.html',
        controller: 'LoginCtrl'
      }
    }
  })
});
