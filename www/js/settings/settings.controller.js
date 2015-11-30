// angular.module('starter.controllers', [])

app.controller('SettingsCtrl', function($scope, currentUser, $state) {

var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')

  $scope.user = currentUser;

   $scope.logout = function() {
  	ref.unauth();
  	$state.go('login')
  }

});
