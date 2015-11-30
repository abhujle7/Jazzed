app.config(function($stateProvider) {
  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html', 
    controller: 'RegisterCtrl'
  })
});