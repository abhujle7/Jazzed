app.config(function($stateProvider) {
	$stateProvider
	.state('app.tab.chat-addMembers', {
		url: '/chat/:id/members/addMembers',
		views: {
	      'roomsView': {
			templateUrl: 'js/members/chat.addMembers.html',
	        controller: 'AddMembersCtrl'
	      }
	    },
	    resolve: {
	    	currentRoomId: function($stateParams) {
	    		return $stateParams.id
	    	}
	    }
	})
})