app.controller('MembersCtrl', function($scope, currentRoomId, $firebaseArray, $state) {
	var membersRef = new Firebase('https://boiling-fire-3161.firebaseio.com/groups/' + currentRoomId + '/members/')
	$scope.members = []
	membersRef.once("value", function(snapshot) {
		snapshot.forEach(function(member) {
			$scope.members.push(member.val())
		})
	})
	$scope.goToAddMembers = function() {
		$state.go('app.tab.chat-addMembers', {id: currentRoomId})
	}
})