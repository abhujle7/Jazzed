app.controller('ChatCtrl', function($scope, ChatFactory, $stateParams, RoomsFactory, AuthFactory, $firebaseObject, EventFactory, $state, PollsFactory, $ionicScrollDelegate, currentRoomId, $ionicPopover, $rootScope) {

  $ionicScrollDelegate.scrollBottom();

  var currUser = AuthFactory.getCurrentUser().uid
  var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser)
  var userObj = $firebaseObject(userRef)
  
  $scope.IM = {
    textMessage: ""
  };


  $scope.polls = PollsFactory.all()
  $scope.events = EventFactory.all()
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
      $state.go('app.tab.createNewEvent');
  }

  $scope.goToSeatgeek = function() {
    $state.go('app.tab.search')
  }

  $scope.goToShowtimes = function() {
    $state.go('app.tab.movies')
  }

  $scope.goToYelp = function() {
    $state.go('app.tab.yelp')
  }

  $scope.goToPollDetail = function (pollObj) {
    $state.go('app.tab.pollDetail', {id: pollObj.$id, eventid: pollObj.event.id})
  }

  $scope.goToPoll = function (event) {
    $state.go('app.tab.polls', {eventid: event.$id})
  }

  $scope.goToAddContacts = function() {
    $state.go('app.tab.contacts', {roomid: currentRoomId})
  }

  var template = '<ion-popover-view><ion-header-bar><h1 class="title">Group Settings</h1></ion-header-bar><ion-content><div class="list"><label class="item" ng-click="revealPolls()">View Live Polls</label><label class="item" ng-click="revealList()">Suggest Event</label><label class="item" ng-click="goToAddContacts()">Invite Contacts to Group</label></div></ion-content></ion-popover-view>';


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

