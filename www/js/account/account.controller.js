// angular.module('starter.controllers', [])

app.controller('AccountCtrl', function($scope, currentUser) {
  $scope.user = currentUser
});
