app.factory('ChatFactory', function($firebase, RoomsFactory, $firebaseArray, $firebaseObject, AuthFactory) {


// this file should be in the chat folder probs
  var selectedRoomId;
  var chats;
  var ref = new Firebase('https://boiling-fire-3161.firebaseio.com/')
  var user = AuthFactory.getCurrentUser().uid
  var userRef = new Firebase('https://boiling-fire-3161.firebaseio.com/users/' + user)
  var userObj = $firebaseObject(userRef)

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.$remove(chat)
      .then(function (ref) {
        ref.key() === chat.$id;
      });
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    },
    // why is this a chat factory method?
    getSelectedRoomName: function () {
      var selectedRoom;
      // these 2 conditions do the same thing? (null is falsy)
      if (selectedRoomId && selectedRoomId != null) {
          selectedRoom = RoomsFactory.get(selectedRoomId);
          if (selectedRoom)
              return selectedRoom.name;
          else
              return null;
      } else
          return null;
    },
    selectRoom: function (roomId) {
        console.log("selecting the room with id: " + roomId);
        selectedRoomId = roomId;
        chats = $firebaseArray(ref.child('messages').child(selectedRoomId));
    },
    send: function (message) {
        console.log("sending message from (insert user here) & message is " + message);
        if (message) {
            console.log('this is the user', user)
            var chatMessage = {
                user: user,
                from: userObj.name,
                message: message,
                timestamp: Firebase.ServerValue.TIMESTAMP // is there a way to default this in firebase?
            };
            console.log('this is chats pre', chats)
            console.log('this is chatmessage', chatMessage)
            //removed validation of .write and $other

            // you should return a promise! or something
            chats.$add(chatMessage).then(function (data) {
                console.log("message added and this is data returned", data);
            })
            .catch(function(error) {
              console.error("Error:", error);
            })
        }
    }
  };
});
