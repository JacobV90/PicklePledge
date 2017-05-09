angular.module('app.controllers', [])

.controller('welcomeCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('loginCtrl', ['$scope', '$stateParams', 'Auth', '$ionicLoading', "$ionicPopup", "$state","$rootScope", "$firebaseArray",
function ($scope, $stateParams, Auth, $ionicLoading, $ionicPopup, $state, $rootScope, $firebaseArray) {

    var users_ref = firebase.database().ref("Users/");
    var users = $firebaseArray(users_ref);
    $scope.date = new Date().toDateString();

  $scope.submit = function(email, password){

    $ionicLoading.show({
      template: 'Logging you in...'
    })

    Auth.$signInWithEmailAndPassword(email, password)
        .then(function (authData) {
        setUserData(email);
    }).catch(function (error) {
        $ionicPopup.alert({
          title: 'Login Error',
          template: error.message
        })
        $ionicLoading.hide();
        $sta
    });

  };

  function setUserData(email){
      users.$loaded().then(function(){
          angular.forEach(users, function(user){
              if(user.email == email){
                  $rootScope.email = user.email;
                  $rootScope.org = user.org;
                  $state.go('pickleJar',{reload: true});
                  $ionicLoading.hide();
              }
          });
      });
  }


}])


.controller('signupCtrl', ['$scope', '$state', 'Auth', '$ionicLoading', "$stateParams", "$firebaseArray",
function ($scope, $state, Auth, $ionicLoading, $stateParams, $firebaseArray) {

    var accessCode = "";

    var db_ref = firebase.database().ref();

    db_ref.child('Access').on('value', function(data){
        accessCode = data.val();
    });

  $scope.type = $stateParams.type;

  $scope.submit = function(email, password, access){

    $ionicLoading.show({
      template: 'Signing you up...'
    })

    if(access.localeCompare(accessCode.toString()) === 0){

        Auth.$createUserWithEmailAndPassword(email, password)
            .then(function (newUser) {

                $ionicLoading.hide();

                if($scope.type.localeCompare('user') === 0){
                    $state.go('chooseOrganization');
                }else{
                    $state.go('registerOrg');
                }

            }).catch(function (error) {
                $ionicLoading.hide();
                alert(error);
            });
    }else{
        $ionicLoading.hide();
        alert("Invalid access code");
    }

  };

  $scope.selectNewsletter = function(checked){
    console.log(checked);
  }


}])

.controller('registerOrgCtrl', function($scope, $ionicLoading, Auth, $firebaseArray){

  var orgs_ref = firebase.database().ref('Orgs/');
  var orgs = $firebaseArray(orgs_ref);
  $scope.orgsReady = false;
  $scope.email = Auth.email;

  orgs.$loaded().then(function(){
    $scope.orgsReady = true;
  });

    $scope.submit = function(orgName){

        $ionicLoading.show({
            template: 'Registering your organization...'
        });

        var found = findOrg(orgName);

        if(!found){

            orgs.$add({
                name: orgName,
                email: $scope.email
            })

            $ionicLoading.hide();

        }else{

            $ionicLoading.hide();

            alert("Organization name is already in use");
        }

    };

  function findOrg(orgName){
      angular.forEach(orgs, function(org){
          if(orgName.$viewValue === org.name){
              console.log("wtf");
              return true;
          }
      });
      return false;
  }


})


.controller('chooseOrganizationCtrl', function ($scope, $stateParams, $firebaseArray, $state, SearchFilter, Auth, $rootScope) {

    var orgs_ref = firebase.database().ref("Orgs");
    var orgs = $firebaseArray(orgs_ref);
    var date = new Date().toDateString();


    var user_auth = Auth.$getAuth();
    var users_ref = firebase.database().ref("Users/");
    var users = $firebaseArray(users_ref);
    var current_user = null;
    var selectedOrg;


    users.$loaded().then(function(){
        angular.forEach(users, function(user){
            if(user.email == user_auth.email){
                console.log(user.$id)
                var current_user_ref = firebase.database().ref("Users/"+user.$id+"/");
                var log_ref = firebase.database().ref("Users/"+user.$id+"/logs/"+date);
                current_user = $firebaseObject(current_user_ref);
                current_log = $firebaseObject(log_ref);
            }
        })
    })

  $scope.orgs = [];

  orgs.$loaded()
    .then(function(){
        setOrgList();
    });

  $scope.filterList = function(search){
    if(search != ""){
      $scope.orgs = SearchFilter(orgs_ref).getSearchResults(search);
    }
    else{
      $scope.orgs = [];
      setOrgList();
    }
  }

  $scope.selectOrg = function(name){
    selectedOrg = name;
    var index = 0;
    angular.forEach($scope.orgs, function(org){
      if(org.name != selectedOrg){
        $scope.orgs[index].checked = false;
      }
      ++index;
    })
  }

  $scope.submitOrg = function(){


      console.log(Auth.email);
    if(selectedOrg){

        var users_ref = firebase.database().ref("Users/");
        var users = $firebaseArray(users_ref);

        $rootScope.email = user_auth.email;
        $rootScope.org = selectedOrg;

        users.$add({
            email: user_auth.email,
            org: selectedOrg
        }).then(function(){

            $state.go("pickleJar");
        }).catch(function(err){
            console.log(err);
        });

    }else{
      console.log("org not selected");
    }
  }

  function setOrgList(){
    angular.forEach(orgs, function(org) {
        $scope.orgs.push({
          name: org.name,
          checked: false
        })
    })
  }

})

.controller('pickleJarCtrl', ['$scope', '$stateParams', '$firebaseArray', '$state', 'Auth','$firebaseObject', "$ionicSideMenuDelegate", "Storage", "$rootScope",// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $firebaseArray, $state, Auth, $firebaseObject,  $ionicSideMenuDelegate, $rootScope) {

  var user_auth = Auth.$getAuth();
  var users_ref = firebase.database().ref("Users/");
  var users = $firebaseArray(users_ref);
  $scope.date = new Date().toDateString();
  var current_log = null;

  $scope.total = 0;
  $scope.email = "";
  $scope.org = "";
  $scope.logs = [];

  users.$loaded().then(function(){
    angular.forEach(users, function(user){
      if(user.email == user_auth.email){
          var log_ref = firebase.database().ref("Users/"+user.$id+"/logs/"+$scope.date);
          var logs_ref = firebase.database().ref("Users/"+user.$id+"/logs");
          var logs = $firebaseArray(logs_ref);
          current_log = $firebaseObject(log_ref);

          logs.$loaded().then(function(){
              $scope.logs = logs;
          });

          current_log.$loaded().then(function(){
              if(current_log.whine_fine == undefined){
                  current_log.whine_fine = 0;
              }else{
                  $scope.total = current_log.whine_fine;
              }

          })
      }
    });

    $scope.total = current_log.whine_fine;

  });


  $scope.logout = function(){
    firebase.auth().signOut().then(function(){

      $scope.email = "";
      $scope.org = "";
      $state.go("welcome", {reload: true})
    })
  };

  $scope.addWhineFine = function(){
      current_log.whine_fine += 0.25;
      current_log.$save();
      $scope.total = current_log.whine_fine
  }

    $scope.toggleLeft = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };

  $scope.goToAbout = function(){
      $state.go('about');
  }


}])

.controller('aboutCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
