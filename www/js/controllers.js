// So we're currently using firebase to handle our authentication and data storage.
// Then most things are being passed to a module called ngStorage to handle
// session based storage which persists as you change between pages.
// This is not optimal code!!!

// This is an ionic project, which is an extension of Cordova which is an extension of Angular JS.
// I gave you all the shit so you could google it if needed.

angular.module('coach.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPopup, $sessionStorage, $location) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $scope.$storage = $sessionStorage;

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
    $location.path('/teams');
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };
  //If the user is logged in, show them their teams page
  if($sessionStorage.loggedIn) {
    $location.path('app/teams');
  }
  //Otherwise take them to the login page
  else {
    $location.path('app/login');
  }
  //Remove all session objects and remove Firebase auth token
  $scope.logout = function() {
    firebase.auth().signOut().then(function() {
      delete $scope.$storage;

      $sessionStorage.$reset();
    }, function(error) {
      console.log(error.message);
    });
  };

  // Perform the login action when the user submits the login form
  $scope.doRegister = function() {
    firebase.auth().createUserWithEmailAndPassword($scope.loginData.email, $scope.loginData.password).then(function(result) {
      console.dir(result);
      if($scope.loginData.name) {
        firebase.auth().currentUser.updateProfile({displayName: $scope.loginData.name}).then(function() {
          $sessionStorage.displayName = $scope.loginData.name;
        }, function(error) {
          console.log(error.code);
          var alertPopup = $ionicPopup.alert({
            title: 'Registration Failed!',
            template: 'Please resolve the following errors to continue: ' + error.message
          });
        });
      }
      $scope.$storage.loggedIn = true;
      $scope.closeLogin();
    }).catch(function(error) {
      console.log(error.code);
      var alertPopup = $ionicPopup.alert({
        title: 'Registration Failed!',
        template: 'Please resolve the following errors to continue: ' + error.message
      });
    });
  };

  $scope.doLogin = function() {
    firebase.auth().signInWithEmailAndPassword($scope.loginData.email, $scope.loginData.password).then(function(result) {
      console.dir(result);
      $sessionStorage.uid = result.uid;
      $sessionStorage.email = $scope.loginData.email;
      if(result.displayName) {
        $sessionStorage.displayName = result.displayName;
      }
      $sessionStorage.loggedIn = true;
      $scope.$storage.loggedIn = true;
      $scope.closeLogin();
    }).catch(function(error) {
      console.log(error.code);
      var alertPopup = $ionicPopup.alert({
        title: 'Login Failed!',
        template: 'Please resolve the following errors to continue: ' + error.message
      });
    });
  };

  $scope.googleLogin = function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('email');
    //provider.addScope('https://www.googleapis.com/auth/gmail.send');
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user.providerData;
      console.dir(user);
      console.log(token);
      $sessionStorage.displayName = user[0].displayName;
      $sessionStorage.email = user[0].email;
      $sessionStorage.uid = user[0].uid;
      $sessionStorage.loggedIn = true;
      $scope.$storage.loggedIn = true;
      $scope.closeLogin();
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
    });
  };

})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('TeamsCtrl', function($scope, $ionicModal, $sessionStorage) {
  $scope.$storage = $sessionStorage;
  $scope.newTeamData = {};
  if($scope.teamData) {
    delete $scope.teamData;
  }
  $scope.teamData = [];

  $ionicModal.fromTemplateUrl('templates/makeTeam.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.addTeamModal = modal;
  });

  firebase.auth().onAuthStateChanged(function(user){
    $scope.updateTeamList();
  });

  $scope.updateTeamList = function() {
    delete $scope.teamData
    $scope.teamData = [];
    firebase.database().ref('teams/' + $scope.$storage.uid).once('value').then(function(snapshot) {
      console.dir(snapshot.val());
      snapshot.forEach(function(childSnapshot) {
        $scope.teamData.push({'teamId': childSnapshot.key, 'team': childSnapshot.val()});
      });
    });
  };

  $scope.closeTeam = function() {
    $scope.addTeamModal.hide();
  };

  $scope.addTeam = function() {
    $scope.addTeamModal.show();
  };

  $scope.makeTeam = function() {
    firebase.database().ref('/teams/' + $scope.$storage.uid).push({
      name: $scope.newTeamData.teamName,
      sport: 'basketball'
    });
    $scope.closeTeam();
    $scope.updateTeamList();
  };

  $scope.setTeam = function(teamId) {
    $sessionStorage.subTeamId = teamId;
  };
})

.controller('TeamCtrl', function($scope, $ionicModal, $firebaseArray, $sessionStorage) {
  $scope.$storage = $sessionStorage;

  $ionicModal.fromTemplateUrl('templates/addPlayer.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.addPlayerModal = modal;
  });

  firebase.database().ref('teams/' + $scope.$storage.uid + '/' + $scope.$storage.subTeamId).once('value').then(function(snapshot) {
    console.dir(snapshot.val());
    $scope.selectedTeam = snapshot.val();
  });

  $scope.setPlayer = function(playerId) {
    $sessionStorage.playerId = teamId;
  };

  $scope.addPlayer = function() {
    $scope.addPlayerModal.show();
  };

  $scope.makePlayer = function() {
    firebase.database().ref('/teams/' + $scope.$storage.uid + '/' + $scope.$storage.subTeamId + '/players').push({
      name: $scope.newTeamData.teamName,
      sport: 'basketball'
    });
    $scope.closeTeam();
    $scope.updateTeamList();
  };
})

.controller('PlayerCtrl', function($scope, $firebaseArray, $sessionStorage) {
  $scope.$storage = $sessionStorage;
  
});
