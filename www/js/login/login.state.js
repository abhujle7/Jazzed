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