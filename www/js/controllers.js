angular.module('app.controllers', [])

.controller('welcomeCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('loginCtrl', ['$scope', '$stateParams', 'Auth', '$ionicLoading', "$ionicPopup", "$state",
function ($scope, $stateParams, Auth, $ionicLoading, $ionicPopup, $state) {

  $scope.submit = function(email, password){

    $ionicLoading.show({
      template: 'Logging you in...'
    })

    Auth.$signInWithEmailAndPassword(email, password)
        .then(function (authData) {
        console.log("Logged in as:" + authData.uid);
        $ionicLoading.hide();
        $state.go('pickleJar')
    }).catch(function (error) {
        $ionicPopup.alert({
          title: 'Login Error',
          template: error.message
        })
        $ionicLoading.hide();
    });

  }

}])

.controller('signupCtrl', ['$scope', '$state', 'Auth', '$ionicLoading', '$firebaseArray','$rootScope',
function ($scope, $state, Auth, $ionicLoading, $firebaseArray, $rootScope) {

  var users_ref = firebase.database().ref("Users");
  var users = $firebaseArray(users_ref);

  $scope.submit = function(email, password){

    $ionicLoading.show({
      template: 'Signing you up...'
    })

    Auth.$createUserWithEmailAndPassword(email, password)
        .then(function (newUser) {

          $ionicLoading.hide()

            users.$add({
                email: email,
                org: ""
            }).then(function(){

                $state.go('chooseOrganization', {
                    reload: true
                })
            });

    }).catch(function (error) {
          $ionicLoading.hide()
          alert(error)
    });
  }

  $scope.selectNewsletter = function(checked){
    console.log(checked);
  }


}])

.controller('registerOrgCtrl', function($scope, $stateParams, $ionicLoading, Auth, $firebaseArray){

  var db_ref = firebase.database().ref();
  var orgs_ref = db_ref.child('Orgs');
  var orgs = $firebaseArray(orgs_ref);
  var accessCode;

  db_ref.child('Access').on('value', function(data){
    accessCode = data.val();
  })

  $scope.submit = function(orgName, email, password, code){

    if(code == accessCode){

      $ionicLoading.show({
        template: 'Registering your organization...'
      })

      Auth.$createUserWithEmailAndPassword(email, password)
          .then(function (newUser) {

            $ionicLoading.hide()

            $state.go('chooseOrganization', {
              email: email
            },{
              reload: false
            })

      }).catch(function (error) {
            $ionicLoading.hide()
            alert(error)
      });

    }else{
      console.log("oops invalid access code");
    }

  }
})

.controller('chooseOrganizationCtrl', ['$scope', "$firebaseArray", "$state", "SearchFilter",'Auth','$firebaseObject', "$ionicLoading",
function ($scope, $firebaseArray, $state, SearchFilter, Auth, $firebaseObject, $ionicLoading) {

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
                var log_ref = firebase.database().ref("Users/"+user.$id+"/"+date);
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
    if(selectedOrg){

      current_user.org = selectedOrg;
      current_user.$save();

      current_log.whine_fine = 0;
      current_log.$save();

      console.log(current_user)

        $state.go('pickleJar')

    }else{
      console.log("org not selected")
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

}])

.controller('pickleJarCtrl', ['$scope', '$stateParams', '$firebaseArray', '$state', 'Auth','$firebaseObject', "$ionicSideMenuDelegate",// The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $firebaseArray, $state, Auth, $firebaseObject,  $ionicSideMenuDelegate) {

  var user_auth = Auth.$getAuth();
  var users_ref = firebase.database().ref("Users/");
  var users = $firebaseArray(users_ref);
  var current_user;
  $scope.total = 0;
  $scope.date = new Date().toDateString();
  var current_log = null;


  users.$loaded().then(function(){
    angular.forEach(users, function(user){
      if(user.email == user_auth.email){
          var log_ref = firebase.database().ref("Users/"+user.$id+"/"+$scope.date);
          current_log = $firebaseObject(log_ref);
          console.log(user.$id)
      }
    });

    $scope.total = current_log.whine_fine;

  });

    $scope.toggleLeftSideMenu = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };

  $scope.logout = function(){
    firebase.auth().signOut().then(function(){
      $state.go("login", {reload: true})
    })
  };

  $scope.addWhineFine = function(){
      current_log.whine_fine += 0.25;
      current_log.$save(current_user);
      $scope.total = current_log.whine_fine;
  }


}])

.controller('aboutCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])
