// angular.module('starter.controllers', [])

app.controller('AccountCtrl', function($scope, $state) {


var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')

  $scope.settings = {
    enableFriends: true
  };
});
