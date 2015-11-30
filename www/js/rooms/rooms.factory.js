app.factory('RoomsFactory', function($firebaseArray) {

  var ref = new Firebase('https://boiling-fire-3161.firebaseio.com')
  var rooms = $firebaseArray(ref.child('rooms'));

  return {
    all: function() {
      return rooms;
    },
    // remove: function(chat) {
    //   chats.splice(chats.indexOf(chat), 1);
    // },
    get: function(roomId) {
      return rooms.$getRecord(roomId);
    }
  };
});
