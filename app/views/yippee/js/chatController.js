angular.module('chat.controller', ['ionic', 'firebase', 'yippee.services', 'chatroom.controller'])


.factory('chats', function($firebase, $firebaseArray, $firebaseObject) {

    var selectedRoomId;
    var ref = new Firebase("https://vivid-inferno-2137.firebaseio.com/");
    var chats;

    return {
        all: function() {
            return chats;
        },
        remove: function(chat) {
            chats.$remove(chat).then(function(ref) {
                ref.key() === chat.$id; // true item has been removed
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
        getSelectedRoomName: function() {
            var selectedRoom;
            // console.log(""+selectedRoomId);
            if (selectedRoomId && selectedRoomId != null) {
                selectedRoom = $firebaseObject(ref.child('rooms').child(selectedRoomId));
                if (selectedRoom) {
                    var name;
                    ref.child('rooms').child(selectedRoomId).once('value', function(snapshot) {
                        // console.log(snapshot.val());
                        obj = snapshot.val();
                        name = obj.name;
                    })
                    return name;
                } else
                    return null;
            } else
                return null;
        },
        selectRoom: function(roomId) {
            console.log("selecting the room with id: " + roomId);
            selectedRoomId = roomId;
            if (!isNaN(roomId)) {
                chats = $firebaseArray(ref.child('rooms').child(selectedRoomId).child('chats'));
            }
        },
        send: function(from, message) {

            console.log("sending message from :" + from + " & message is " + message);
            if (from && message) {
                var chatMessage = {
                    from: from,
                    message: message,
                    createdAt: Firebase.ServerValue.TIMESTAMP
                };
                chats.$add(chatMessage).then(function(data) {
                    console.log("message added");
                });
            }
        }
    }
})



.controller('chatController', function($rootScope, $scope, chats, $state, $ionicModal, $firebaseArray, $ionicScrollDelegate, $ionicPopup) {

    $scope.IM = {
        textMessage: ""
    };

    var roomId = $state.params.roomId;
    //must select room id before 
    chats.selectRoom(roomId);
    var ref = new Firebase("https://vivid-inferno-2137.firebaseio.com/");
    // fetch friends so I can add them to chat later.
    $scope.friends = $firebaseArray(ref.child('friendLists').child('' + $rootScope.authData.uid));
    // Fetching Chat Records only if a Room is Selected
    $scope.chats = chats.all();

    // send message via factory and set text back to empty
    $scope.addMessage = function(msg) {
        console.log(msg);
        chats.send($rootScope.displayName, msg);
        $scope.IM.textMessage = "";
    }

    // test image to display via shareBreakLocation in break controller
    $scope.test = function() {
        var obj = {
            detail: {
                image_url: "http://res.cloudinary.com/urbandictionary/image/upload/a_exif,c_fit,h_200,w_200/v1395991705/gjn81wvxqsq6yzcwubok.png",
                name: "Best Kappa Restaurant",
                location: {
                    address: ["1234 Kappa Dr."]
                }
            }
        }
        chats.send($rootScope.displayName, obj);
        $scope.IM.textMessage = "";
        msgInput.one('blur', function() {
            msgInput[0].focus();
        })
    }

    //remove an existing chat from a chatroom via factory
    $scope.remove = function(chat) {
        chats.remove(chat);
    }

    // set a modal for adding friends to chat
    $ionicModal.fromTemplateUrl('templates/addFriendtoChat.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.addFriendtoChatModal = modal;
    });

    //add an a friend into an existing chat
    $scope.addFriendtoChat = function(friend) {
        //console.log(friend.$id);
        ref.child('rooms').child(roomId).child('users').once("value", function(snapshot) {
            // check if friend already in the chat
            if (!snapshot.child('' + friend.$id).exists()) {
                ref.child('users').child('' + friend.$id).child('chats').push({
                    num: roomId
                })
                ref.child('rooms').child(roomId).child('users').child('' + friend.$id).set({
                    name: friend.friendDispName
                })
            } else {
                // if friend already in chat, then don't let them add into chat
                $ionicPopup.alert({
                    template: 'Your friend is already in this chat!'
                });
            }
        });

    }

    // send message bar resizing stuff
    var footerBar;
    var viewScroll;
    var msgInput;

    // get send message bar DOM after entering view
    $scope.$on('$ionicView.enter', function() {
        footerBar = document.body.querySelector('#messages-view .bar-footer');
        //scroller = document.body.querySelector('#messages-view .scroll-content');
        //msgInput = angular.element(footerBar.querySelector('textarea'));
    });

    // scroll to bottom before entering view
    $scope.$on('$ionicView.beforeEnter', function() {
        viewScroll = $ionicScrollDelegate.$getByHandle('scroller');
        viewScroll.scrollBottom(false);
    })

    // resizes message input bar 
    $scope.$on('taResize', function(e, ta) {
        //console.log(ta);
        if (!ta) return;
        // gets height of textarea input
        var taHeight = ta[0].offsetHeight;
        //console.log(taHeight);
        if (!footerBar) return;

        var newHeight = taHeight + 10;
        // limits height of input to 44px
        newHeight = (newHeight > 44) ? newHeight : 44;
        // sets footer bar to new height 
        footerBar.style.height = newHeight + 'px';
        //scroller.style.bottom = newHeight + 10 + 'px';
    });

    // hide tab bar when keyboard is open
    window.addEventListener('native.keyboardshow', function() {
        document.body.classList.add('keyboard-open')
    })

    window.addEventListener('native.keyboardhide', function() {
        viewScroll.scrollBottom(true);
    });
})
