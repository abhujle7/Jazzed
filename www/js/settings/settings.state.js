app.config(function($urlRouterProvider, $stateProvider) {
  $stateProvider
  .state('app.tab.settings', {
    url: '/settings/:uid',
    views: {
      'settingsView': {
        templateUrl: 'js/settings/userInfo.html',
        controller: 'SettingsCtrl'
      }
    }
  })
});