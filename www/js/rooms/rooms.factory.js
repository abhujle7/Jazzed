app.factory('RoomsFactory', function($firebaseArray, $firebaseAuth, AuthFactory) {

  var roomsRef = new Firebase('https://boiling-fire-3161.firebaseio.com/groups/')
  var roomsArr = $firebaseArray(roomsRef);
  // var roomsArr = $firebaseArray(ref.child('groups'));
  // var roomsRef = ref.child('groups')
  var currUser = AuthFactory.getCurrentUser().uid
  var currUserRooms = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + currUser + '/groups')

  return {

    all: function() {
      return roomsArr;
    },
   
    get: function(roomId) {
      return roomsArr.$getRecord(roomId);
    },

    add: function(roomObj) {
      console.log('this is roomobj in fac', roomObj)
      return roomsArr.$add(roomObj)
      .then(function (ref) {
        console.log('this is the ref', ref)
        var id = ref.key();
        console.log('this is the id in fac', id)
        currUserRooms.child(id).set({name: roomObj.name})
        $firebaseArray(roomsRef.child(id).child('members')).$add(currUser) //also want to add all selected users
        return id;
      })
        // console.log('added record with id' + id);
        // return rooms.$indexFor(id);
        //state.go to chat detail with new id

    }
  };
});
