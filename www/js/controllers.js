angular.module('app.controllers', [])

    .controller('welcomeCtrl', function ($scope, $stateParams) {


    })

    .controller('loginCtrl', function ($scope, $stateParams, Auth, $ionicLoading, $ionicPopup, $state, $rootScope, $firebaseArray, Storage) {

        var users_ref = firebase.database().ref("Users/");
        var users = $firebaseArray(users_ref);

        $scope.date = new Date().toDateString();

        $scope.submit = function (email, password) {

            $ionicLoading.show({
                template: 'Logging you in...'
            })

            Auth.$signInWithEmailAndPassword(email, password)
                .then(function () {
                    setUserData(email)
                }).catch(function (error) {

                $ionicPopup.alert({
                    title: 'Login Error. Please Try Again',
                    template: error.message
                });
                $ionicLoading.hide();
            });

            $ionicLoading.hide();

        };

        function setUserData(email){
            var users_ref = firebase.database().ref("Users/");
            var users = $firebaseArray(users_ref);

            users.$loaded().then(function(){
                angular.forEach(users, function (user) {
                    if (user.email == email) {
                        $rootScope.org = user.org;
                        $rootScope.email = user.email;
                        Storage.setData('id', user.$id);
                        $ionicLoading.hide();
                        $state.go('app.pickleJar');
                    }
                });
                $ionicLoading.hide();
            })
        }

    })

    .controller('signupCtrl', function ($scope, $state, Auth, $ionicLoading, $stateParams, $firebaseArray, $rootScope) {

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
                            email: email.toLowerCase(),
                            org: m_ValidOrgName,
                            newsletterStatus: m_bNewsletterStatus
                        }).then(function () {

                        $rootScope.org = m_ValidOrgName;
                        $rootScope.email = email.toLowerCase();
                            
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
                                           $ionicSideMenuDelegate, Storage, $document) {

        $scope.date = new Date().toDateString();
        $scope.total = 0;

        var current_log = null;
        var currentLogFound = false;
        var gif = null;
        var logCount = 0;

        var logs_ref = firebase.database().ref("Users/" + Storage.getData('id') + "/logs");
        logs_ref.on("child_added", function(data){
            logCount = data.numChildren();
        });

        var logs = $firebaseArray(logs_ref);
        logs.$loaded().then(function (data) {
            data.forEach(function(log){
                if(log.date == $scope.date){
                    var log_ref = firebase.database().ref("Users/" + Storage.getData('id') + "/logs/" + log.$id);
                    current_log = $firebaseObject(log_ref);
                    currentLogFound = true;
                    setupCurrentLog();
                }
            });
        });

        $(document).ready(function() {
            gif = document.getElementById('gif');
        });

        $scope.addWhineFine = function () {
            updateLog();
        };

        $scope.toggleLeft = function () {
            $ionicSideMenuDelegate.toggleLeft();
        };

        function startGif(){
            gif.play();
            setTimeout(function(){
                gif.pause();
            }, 1750)
        }

        function updateLog(){
            if(currentLogFound){
                current_log.whine_fine += 0.25;
                current_log.$save();
                $scope.total = current_log.whine_fine;
            }else{
                logs.$add({
                    id: logCount + 1,
                    whine_fine: 0.25,
                    date: $scope.date
                }).then(function(data){
                    logs.forEach(function(log){
                        if(log.date == $scope.date){
                            var log_ref = firebase.database().ref("Users/" + Storage.getData('id') + "/logs/" + log.$id);
                            current_log = $firebaseObject(log_ref);
                            currentLogFound = true;
                            setupCurrentLog();
                        }
                    })
                }).catch(function(err){
                    console.log(err)
                })

            }
            startGif();
        }

        function setupCurrentLog(){
            current_log.$loaded().then(function (data) {
                if (data.whine_fine == undefined) {
                    current_log.whine_fine = 0;
                }
                $scope.total = data.whine_fine;
            });
        }

    })
    .controller('sideMenuCtrl', function ($scope, $state, $ionicSideMenuDelegate, $stateParams, $firebaseArray, Storage, $window) {

        var logs_ref = firebase.database().ref("Users/" + Storage.getData('id') + "/logs");
        var logs = $firebaseArray(logs_ref);

        logs.$loaded().then(function () {
            $scope.logs = logs;
        });

        logs.sort(compare);

        logs.$watch(function() { logs.sort(compare); });

        $scope.goToAbout = function () {
            $ionicSideMenuDelegate.toggleLeft();
            setTimeout(function () {
                $state.go('app.about');
            }, 250);
        };

        $scope.logout = function () {

            $ionicSideMenuDelegate.toggleLeft();

            // Give the side menu some time to close
            setTimeout(function () {
                firebase.auth().signOut().then(function () {
                    Storage.clearData('id');
                    $state.go("welcome", {}, {reload: true})
                    setTimeout(function(){
                        $window.location.reload();
                    }, 5)
                })
            }, 250);
        };

        function compare(a, b) {
            return -1 * a.id.toString().localeCompare(b.id.toString());
        }
    })

    .controller('aboutCtrl', function ($scope, $stateParams, $rootScope) {

    });
