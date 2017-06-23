angular.module('app.controllers', [])

    .controller('welcomeCtrl', function ($scope, $stateParams) {


    })

    .controller('loginCtrl', function ($scope, $stateParams, Auth, $ionicLoading, $ionicPopup, $state, $rootScope, $firebaseArray, $window) {

        var users_ref = firebase.database().ref("Users/");
        var users = $firebaseArray(users_ref);
        $scope.date = new Date().toDateString();

        $scope.submit = function (email, password) {

            $ionicLoading.show({
                template: 'Logging you in...'
            })

            Auth.$signInWithEmailAndPassword(email, password)
                .then(function () {

                    $ionicLoading.hide();
                    $state.go('app.pickleJar', {reload: true});

                }).catch(function (error) {

                $ionicPopup.alert({
                    title: 'Login Error. Please Try Again',
                    template: error.message
                });

                $ionicLoading.hide();
            });

        };

        function setUserData(email) {
            users.$loaded().then(function () {
                angular.forEach(users, function (user) {
                    if (user.email == email) {
                        $rootScope.email = user.email;
                        $rootScope.org = user.org;

                        if(user.type == "organizer"){
                            $state.go('organizer');
                        }else{
                        }

                    }
                });
            });
        }


    })

    .controller('signupCtrl', function ($scope, $state, Auth, $ionicLoading, $stateParams, $firebaseArray) {

        var orgs_ref = firebase.database().ref("Orgs");
        var orgs = $firebaseArray(orgs_ref);
        var m_ValidOrgName = "";
        var m_bIsUserAccessCodeValid = false;
        var m_bNewsletterStatus = false;

        $scope.OrgsLoaded = false;

        orgs.$loaded().then(function() {
            angular.forEach(orgs, function (org) {
                $scope.OrgsLoaded = true;
            });
        });

        $scope.submit = function (email, password, access) {

            $ionicLoading.show({
                template: 'Signing you up...'
            })

            IsAccessCodeInTheDB(access);

            if (m_bIsUserAccessCodeValid) {

                Auth.$createUserWithEmailAndPassword(email, password)
                    .then(function () {
                        
                        var users_ref = firebase.database().ref("Users/");
                        var users = $firebaseArray(users_ref);
                        
                        // Add user to Firebase database
                        users.$add({
                            email: email,
                            org: m_ValidOrgName,
                            newsletterStatus: m_bNewsletterStatus
                        }).then(function () {
                            
                            if(m_bNewsletterStatus){
                                emailSparkPlug(email);
                            }
                            
                            $ionicLoading.hide();
                            $state.go("app.pickleJar");
                            
                        }).catch(function (err) {
                            alert("Server Communication Error: Please try again.");
                        });

                        $ionicLoading.hide();

                    }).catch(function (error) {
                    $ionicLoading.hide();
                    alert("User Authentication Error: Pleaes try again.");
                });
            } else {
                $ionicLoading.hide();
                alert("Invalid Organization Access Code: Please contact your organizer.");
            }

        };

        $scope.selectNewsletter = function (checked) {
            m_bNewsletterStatus = checked
        }

        function emailSparkPlug(email){
            emailjs.send("default_service","sparkplug_newsletter",{name: "Jacob", notes: email})
                .then(function(response) {
                    console.log("SUCCESS. status=%d, text=%s", response.status, response.text);
                }, function(err) {
                    console.log("FAILED. error=", err);
                });
        }

        function IsAccessCodeInTheDB(access){
            angular.forEach(orgs, function(org){
                if(access == org.accessCode){
                    m_bIsUserAccessCodeValid = true;
                    m_ValidOrgName = org.name;
                }
            })
        }


    })

    .controller('pickleJarCtrl', function ($scope, $stateParams, $firebaseArray, $state, Auth, $firebaseObject,
                                           $ionicSideMenuDelegate, $window) {

        var user_auth = Auth.$getAuth();
        var users_ref = firebase.database().ref("Users/");
        var users = $firebaseArray(users_ref);
        var current_log = null;

        $scope.date = new Date().toDateString();
        $scope.total = 0;
        $scope.logs = [];

        users.$loaded().then(function () {
            angular.forEach(users, function (user) {
                if (user.email == user_auth.email) {

                    $scope.email = user.email;
                    $scope.org = user.org;
                    var log_ref = firebase.database().ref("Users/" + user.$id + "/logs/" + $scope.date);
                    var logs_ref = firebase.database().ref("Users/" + user.$id + "/logs");
                    var logs = $firebaseArray(logs_ref);
                    current_log = $firebaseObject(log_ref);

                    logs.$loaded().then(function () {
                        $scope.logs = logs;
                    });

                    current_log.$loaded().then(function () {
                        if (current_log.whine_fine == undefined) {
                            current_log.whine_fine = 0;
                        } else {
                            $scope.total = current_log.whine_fine;
                        }

                    })
                }
            });

        });

        $scope.logout = function () {

            $ionicSideMenuDelegate.toggleLeft();

            // Give the side menu some time to close
            setTimeout(function () {
                firebase.auth().signOut().then(function () {
                    $state.go("welcome", {}, {reload: true})
                    setTimeout(function () {
                        $window.location.reload(true);
                    }, 5)
                })
            }, 250);
        };

        $scope.addWhineFine = function () {
            current_log.whine_fine += 0.25;
            current_log.$save();
            $scope.total = current_log.whine_fine
        }

        $scope.toggleLeft = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.goToAbout = function () {
            $ionicSideMenuDelegate.toggleLeft();
            setTimeout(function () {
                $state.go('app.about');
            }, 250);
        }


    })

    .controller('aboutCtrl', function ($scope, $stateParams) {


    });
