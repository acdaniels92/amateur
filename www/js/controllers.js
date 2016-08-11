

angular.module('coach.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $ionicPopup, $sessionStorage, $window) {

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
    $scope.$evalAsync(function(){
       var myWindow = $window.open("", "_self");
    });
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

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
      $scope.$evalAsync(function(){
         var myWindow = $window.open("", "_self");
         myWindow.document.write(response.data);
      });
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
  $scope.teamData = {};

  $ionicModal.fromTemplateUrl('templates/makeTeam.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.addTeamModal = modal;
  });
  console.log($scope.$storage.uid);
  firebase.database().ref('/teams/' + $scope.$storage.uid).on('value', function(data) {
    $scope.teamData = data.val();
  });

  $scope.closeTeam = function() {
    $scope.addTeamModal.hide();
  };

  $scope.addTeam = function() {
    $scope.addTeamModal.show();
  };

  $scope.makeTeam = function() {
    firebase.database().ref('/teams/' + $scope.$storage.uid).push({
      name: $scope.newTeamData.teamName,
      sport: $scope.newTeamData.sport
    });
    $scope.teamData.$add({
      "name": $scope.newTeamData.teamName,
      "sport": $scope.newTeamData.sport
    });
    $timeout(function() {
      $scope.closeTeam();
    }, 1000);
  };

  $scope.setTeam = function(teamId) {
    $scope.subTeamPage = true;
    $scope.subTeamId = teamId;
  };
})

.controller('TeamCtrl', function($scope, $firebaseArray) {

});
