angular.module('friends.controller', ['ionic', 'firebase', 'yippee.services'])

.controller('friendsController', ['$rootScope', "$scope", "$ionicModal", "$ionicPopup", "$firebaseArray", '$localstorage', "$ionicLoading", '$firebaseObject', '$state', 'ref', function($rootScope, $scope, $ionicModal, $ionicPopup, $firebaseArray, $localstorage, $ionicLoading, $firebaseObject, $state, ref) {

    $scope.listCanSwipe = true;

    $ionicModal.fromTemplateUrl('templates/addedMe.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.addedMeModal = modal;
    });

    $ionicModal.fromTemplateUrl('templates/addFriends.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.addFriendsModal = modal;
    });

    $scope.addFriend = function(friend) {
        var uEmail = $localstorage.get($rootScope.authData.uid + 'email');
        if (friend.email == uEmail) {
            $ionicPopup.alert({
                template: 'Please refrain from adding yourself!'
            });
        } else if (friend && friend.email && friend.dispname) {
            //check if friend is already added
            if ($scope.alreadyAdded(friend.email)) {
                $ionicPopup.alert({
                    template: 'This user is already in your friends list!'
                });
            } else if ($scope.alreadyRequested(friend.email)) {
                $ionicPopup.alert({
                    template: 'This user has already sent you a friend request!'
                });
            } else {
                var exists = false;
                // iterate through users in database to see if they exist
                ref.child('users').once('value', function(snapshot) {
                    snapshot.forEach(function(childSnapshot) {
                        var key = childSnapshot.key();
                        var dispname = childSnapshot.child("displayName").val();
                        var email = childSnapshot.child("email").val();
                        if ((friend.email == email) && (friend.dispname == dispname)) {
                            // this person exists in our database, so do this
                            exists = true;
                            sendRequest(email, dispname, key);
                            $scope.addFriendsModal.hide();
                            return true;
                        }
                    });
                    if (exists == false) {
                        $ionicPopup.alert({
                            template: 'This user does not exist!'
                        });
                    }
                }, onComplete);
            }
        } else
            $ionicPopup.alert({
                template: 'Please enter all fields.'
            });
    }

    // check if friend request already exists, if not then
    // creates a friend request node in database, identified by the receiver
    var sendRequest = function(email, dispname, key) {
        ref.child("friendRequests").child('' + key).child('' + $rootScope.authData.uid).once('value', function(snapshot) {
            var exists = (snapshot.val() !== null);
            if (exists) {
                $ionicPopup.alert({
                    template: 'You have already sent a friend request to this user!'
                });
            } else {
                ref.child("friendRequests").child('' + key).child('' + $rootScope.authData.uid).set({
                        reqEmail: $localstorage.get('email'),
                        reqDispName: $localstorage.get('displayName')
                    },
                    function(error) {
                        if (error) {
                            $ionicPopup.alert({
                                title: 'Error!',
                                template: '' + error
                            });
                        } else {
                            $ionicLoading.show({
                                template: 'Friend request sent!',
                                duration: 700
                            });
                        }
                    });
            }
        });
    };

    // inserts friendkey into userkey's friendlist in the database
    var insertFriend = function(email, dispname, userkey, friendkey) {
        var friend = $firebaseObject(ref.child('users').child('' + friendkey));
        friend.$loaded().then(function() {
            ref.child("friendLists").child('' + userkey).child('' + friendkey).set({
                friendEmail: email,
                friendDispName: dispname,
                friendStatus: friend.status
            });
        });
    };

    // iterates through user's friendlist, check if there is a friend with the given email
    $scope.alreadyAdded = function(email) {
        var exists = false;
        for (i = 0; i < $rootScope.friends.length; i++) {
            var frEmail = $rootScope.friends[i].friendEmail;
            if (email == frEmail) {
                exists = true;
                break;
            }
        }
        return exists;
    };

    // iterates through user's friend reqs, check if there is a friend req already
    $scope.alreadyRequested = function(email) {
        var exists = false;
        for (i = 0; i < $rootScope.friendReqs.length; i++) {
            var frEmail = $rootScope.friendReqs[i].reqEmail;
            if (email == frEmail) {
                exists = true;
                break;
            }
        }
        return exists;
    };

    //deletes friend request node in database, inserts user into friendlist for both users
    $scope.acceptRequest = function(friendReq) {
        if ($rootScope.friendReqs.length == 1) {
            $scope.addedMeModal.hide();
        }
        ref.child("friendRequests").child('' + $rootScope.authData.uid).once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var key = childSnapshot.key();
                var dispname = childSnapshot.child("reqDispName").val();
                var email = childSnapshot.child("reqEmail").val();
                if ((friendReq.reqEmail == email) && (friendReq.reqDispName == dispname)) {
                    ref.child("friendRequests").child('' + $rootScope.authData.uid).child('' + key).remove();
                    // insert friend into my friendlist
                    insertFriend(email, dispname, $rootScope.authData.uid, key);
                    // insert myself into their friendlist
                    insertFriend($localstorage.get('email'), $localstorage.get('displayName'), key, $rootScope.authData.uid);
                    return true;
                }
            });
        }, onComplete);
    };

    // deletes friend request node in database
    $scope.declineRequest = function(friendReq) {
        if ($rootScope.friendReqs.length == 1) {
            $scope.addedMeModal.hide();
        }
        ref.child("friendRequests").child('' + $rootScope.authData.uid).once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var key = childSnapshot.key();
                var dispname = childSnapshot.child("reqDispName").val();
                var email = childSnapshot.child("reqEmail").val();
                if ((friendReq.reqEmail == email) && (friendReq.reqDispName == dispname)) {
                    ref.child("friendRequests").child('' + $rootScope.authData.uid).child('' + key).remove();
                    return true;
                }
            });
        }, onComplete);
    };

    // both friends will remove each other from their friend list
    $scope.deleteFriend = function(friend) {
        // remove friend from users friend list
        ref.child("friendLists").child('' + $rootScope.authData.uid).once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var key = childSnapshot.key();
                var dispname = childSnapshot.child("friendDispName").val();
                var email = childSnapshot.child('friendEmail').val();
                if ((friend.friendEmail == email) && (friend.friendDispName == dispname)) {
                    ref.child("friendLists").child('' + $rootScope.authData.uid).child('' + key).remove();
                    ref.child("friendLists").child('' + key).child('' + $rootScope.authData.uid).remove();
                    return true;
                }
            });
        });
    };

    $scope.openChatroom = function(friend) {
        var rooms = $firebaseArray(ref.child('rooms'));
        name = friend.friendDispName;

        var userUid = $rootScope.authData.uid;
        var found = false;

        // go to existing chat
        ref.child("users").child("" + userUid).child("chats").once('value', function(chatsSnapshot) {
            chatsSnapshot.forEach(function(chatSnapshot) {
                var chatID = chatSnapshot.child("num").val();
                ref.child("rooms").child(chatID.toString()).child("users").once('value', function(chatUsersSnapshot) {
                    var numUsers = chatUsersSnapshot.numChildren();
                    if (numUsers == 2) {
                        chatUsersSnapshot.forEach(function(userSnapshot) {
                            var userName = userSnapshot.child("name").val();
                            if (name == userName) {
                                found = true;
                                $state.go('tab.chatFriends', {
                                    roomId: chatID
                                });
                            }
                        })
                    }
                })
            })
        })

        // make new chat room
        if (!found) {
            ref.child("roomcount").child("num").once('value', function(snapshot) {
                id = snapshot.val();
                //console.log(id);
                newnum = id + 1;
                //console.log(newnum);
                ref.child("roomcount").set({
                    num: newnum
                })
                ref.child("rooms").child('' + id).set({
                    id: id,
                    //name: name
                })
                ref.child('rooms').child('' + id).child('users').child('' + $rootScope.authData.uid).set({
                    name: $rootScope.displayName
                });
                if ($rootScope.authData != null) {
                    ref.child('users').child('' + $rootScope.authData.uid).child('chats').push({
                        num: id
                    });
                }

                ref.child('friendLists').child('' + $rootScope.authData.uid).once('value', function(snapshot) {
                    snapshot.forEach(function(childSnapshot) {
                        var key = childSnapshot.key();
                        //console.log(key);
                        var dispname = childSnapshot.child("friendDispName").val();
                        //console.log(dispname);
                        if (name == dispname) {
                            ref.child('users').child('' + key).child('chats').push({
                                num: id
                            })
                            ref.child('rooms').child('' + id).child('users').child('' + key).set({
                                name: dispname
                            });
                        }
                    });
                })

                $state.go('tab.chat', {roomId: id});
                //$state.go('tab.chatrooms');
            });
        }

        // rooms.$add(room).then(function(data) {

        // 	$state.go('tab.chatrooms');
        //                 //$state.go('tab.chat', {roomId: id});
        //             });

    }




    // general error handler used for callback purposes
    var onComplete = function(error) {
        if (error) {
            $ionicPopup.alert({
                title: 'Error!',
                template: '' + error
            });
        }
    };

}]);