app.factory('RoomsFactory', function($firebaseArray, $firebaseAuth, AuthFactory, $firebaseObject, $q) {

  var roomsRef = new Firebase('https://boiling-fire-3161.firebaseio.com/groups/')
  var roomsArr = $firebaseArray(roomsRef);
  // var roomsArr = $firebaseArray(ref.child('groups'));
  // var roomsRef = ref.child('groups')
  var currUser = AuthFactory.getCurrentUser().uid
  var currUserRooms = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser + '/groups')
  var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser)
  var currUserRoomsArr = $firebaseArray(currUserRooms)
  var userGroupsRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser + '/groups/')

  return {
    all: function() {
      return roomsArr;
    },
    allRooms: function() {
      var deferred = $q.defer();
      roomsArr.$loaded()
      .then(function(roomsList) {
        deferred.resolve(roomsList)
      })
      .catch(function(error) {
        console.error("Error", error);
      })
      return deferred.promise;
    },
    get: function(roomId) {
      return roomsArr.$getRecord(roomId);
    },

    add: function(roomObj) {
      console.log(roomObj);
      return roomsArr.$add(roomObj)
      .then(function (ref) {
        var id = ref.key();
        currUserRooms.child(id).set({name: roomObj.name})
        var name;
        userRef.once("value", function(user) {
          name = user.child('name').val()
        })
        roomsRef.child(id).child('members').child(currUser).set({
          name: name
        })
        return id;
      })
    },
    addMember: function(id, roomId) {
      var contactRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + id)
      var roomRef = new Firebase('https://boiling-fire-3161.firebaseio.com/groups/' + roomId)
      var name;
      var roomName;
      roomRef.once("value", function (room) {
        roomName = room.child('name').val()
      })
      contactRef.once("value", function(contact) {
        name = contact.child('name').val()
      })
      roomRef.child('members').child(id).set({
        name: name
      })
      contactRef.child('groups').child(roomId).set({
        name: roomName
      })
      return id
    },
    findUserRooms: function() {
      return currUserRoomsArr;
    },
    getUserSpecificRoomIds: function () {
      var userSpecificGroupIds = [];
      userGroupsRef.once("value", function (allGroups) {
        allGroups.forEach(function (group) {
          var groupId = group.key();
          userSpecificGroupIds.push(groupId);
        })
      })
      return userSpecificGroupIds;
    }
  };
});
