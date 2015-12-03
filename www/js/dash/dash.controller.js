// angular.module('starter.controllers', [])


// do you still need this?
app.controller('DashCtrl', function($scope, $state) {
	$state.go('tab.chats')
})
