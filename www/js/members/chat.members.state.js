app.config(function($stateProvider) {
	$stateProvider
	.state('app.tab.chat-members', {
		url: '/chat/:id/members',
		views: {
	      'roomsView': {
			templateUrl: 'js/members/chat.members.html',
	        controller: 'MembersCtrl'
	      }
	    },
	    resolve: {
	    	currentRoomId: function($stateParams) {
	    		return $stateParams.id
	    	}
	    }
	})
})