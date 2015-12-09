app.controller('ChatCtrl', function($scope, ChatFactory, $stateParams, RoomsFactory, AuthFactory, $firebaseObject, EventFactory, $state, PollsFactory, $ionicScrollDelegate, currentRoomId, $ionicPopover, $rootScope, $interval) {

  $ionicScrollDelegate.scrollBottom();
  $rootScope.currentRoom = $stateParams.id;
  var currUser = AuthFactory.getCurrentUser().uid
  var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser)
  var userObj = $firebaseObject(userRef)
  
  $scope.IM = {
    textMessage: ""
  };

  //takes in pollobj finds associated date and time and converts and returns them
  $scope.pollDateExpired = false;
  $scope.pollTimeExpired = false;

  $scope.currentPollDate = function (pollObj) {
    var diff = moment.unix(pollObj.expiration.date).fromNow();
    return diff;
    // var daysLeft = moment().unix() - pollObj.expiration.date
    // var endDay = moment().unix(pollObj.expiration.date).format("MM/DD/YYYY")
    // return (moment.unix(pollObj.expiration.date)).fromNow(true);
    // return moment.unix(daysLeft).format("MM/DD/YYYY")
    // var currDay = moment();
    // var endDay = moment(pollObj.expiration.date)
    // var diff = currDay.diff(endDay, 'days')
    // return moment.unix(diff)
    // return moment.unix(daysLeft)
    // return moment().unix() - moment.unix(pollObj.expiration.date).format("MM/DD/YYYY")
  }

  // $scope.currentPollDate = function (pollObj) {
  //   return $interval(function () {
  //     console.log('in interval')
  //   var daysLeft = moment().unix() - pollObj.expiration.date
  //   if (daysLeft > 0) {
  //     console.log('in while')
  //     return moment.unix(daysLeft).format("MM/DD/YYYY")
  //   }
  //   $scope.pollDateExpired = true;
  //   }, 10000);
  // }

 // $scope.currentPollTime = function (pollObj) {
 //    return $interval(function () {
 //    var timeLeft = moment().unix() - pollObj.expiration.time
 //    while (timeLeft > 0) {
 //      return moment.unix(timeLeft).format("MM/DD/YYYY")
 //    }
 //    $scope.pollTimeExpired = true;
 //    }, 1000);
 //  }

  $scope.currentPollAttending = function (pollObj) {
    if (!pollObj.responses.attending) {
      return 0;
    }
    return pollObj.responses.attending;
  }

   $scope.currentPollNotAttending = function (pollObj) {
    if (!pollObj.responses.notAttending) {
      return 0;
    }
    return pollObj.responses.notAttending;
  }

  $scope.polls = PollsFactory.all()
  // var polls = PollsFactory.all();
  // $scope.getGroupSpecificPolls = function (pollsArray) {
  //     var groupPolls = [];
  //     console.log('this is pollsArray', pollsArray, pollsArray[0].groups)
  //   for (var i = 0; i < pollsArray.length; i++) {
  //     console.log('in for', pollsArray, pollsArray[i])
  //     if (pollsArray[i].groups == currentRoomId) {
  //       console.log('in if', pollsArray[i].groups)
  //       groupPolls.push(pollsArray[i])
  //     }
  //   }
  //   console.log('this is groupPolls', groupPolls)
  //   return groupPolls;
  // };

  // $scope.groupPolls = $scope.getGroupSpecificPolls(polls);

  $scope.events = EventFactory.all()
  console.log('in chat ctrl events..', $scope.events)
  $scope.listVisibility = false;
  $scope.pollVisibility = false;
  $scope.chatVisibility = true;
  
  $scope.revealPolls = function () {
    $scope.pollVisibility = true;
    $scope.listVisibility = false;
    $scope.chatVisibility = false;
  }
  $scope.revealList = function () {
    $scope.listVisibility = true;
    $scope.pollVisibility = false;
    $scope.chatVisibility = false;
  }

  $scope.hideList = function () {
    $scope.listVisibility = false;
    $scope.chatVisibility = true;
  }

   $scope.hidePoll = function () {
    $scope.pollVisibility = false;
    $scope.chatVisibility = true;
  }

  ChatFactory.selectRoom($stateParams.id);

  var roomName = ChatFactory.getSelectedRoomName();
  
  if (roomName) {
      $scope.roomName = roomName;
      $scope.chats = ChatFactory.all();
  }

  $scope.sendMessage = function (msg) {
      ChatFactory.send(msg);
      $scope.IM.textMessage = "";
  }

  $scope.remove = function (chat) {
      ChatFactory.remove(chat);
  }

  $scope.createEvent = function() {
      $state.go('app.tab.chat-createNewEvent');
  }

  $scope.goToSeatgeek = function() {
    $state.go('app.tab.search', {id: currentRoomId})
  }

  $scope.goToShowtimes = function() {
    $state.go('app.tab.movies', {id: currentRoomId})
  }

  $scope.goToYelp = function() {
    $state.go('app.tab.yelp', {id: currentRoomId})
  }

  $scope.goToPollDetail = function (pollObj) {
    $state.go('app.tab.chat-pollDetail', {pollid: pollObj.$id, eventid: pollObj.event.id, id: currentRoomId})
  }

  $scope.goToPoll = function (event) {
    $state.go('app.tab.chat-polls', {id: currentRoomId, eventid: event.$id})
  }


  $scope.goToViewMembers = function() {
    $state.go('app.tab.chat-members', {id: currentRoomId})
  }

  var template = '<style>.popover { height:200px; width: 180px; }</style><ion-popover-view><ion-header-bar><h1 class="title corn-blue">Group Settings</h1></ion-header-bar><ion-content><div class="list"><label class="item" ng-click="revealPolls()"><h3 class="grey">View Live Polls</h3></label><label class="item" ng-click="revealList()"><h3 class="grey">Suggest Event</h3></label><label class="item" ng-click="goToViewMembers()"><h3 class="grey">View & Add Members</h3></label></div></ion-content></ion-popover-view>';


  $scope.popover = $ionicPopover.fromTemplate(template, {
    scope: $scope,
  })

   $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };

  $scope.closePopover = function() {
    $scope.popover.hide();
  };

  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });

})

