angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider



      .state('welcome', {
    url: '/welcome',
    templateUrl: 'templates/welcome.html',
    controller: 'welcomeCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl',
    params:{
      type: null
    }
  })

  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html'
  })

  .state('registerOrg', {
    url: '/registration',
    templateUrl: 'templates/addOrganization.html',
    controller: 'registerOrgCtrl'
  })

  .state('chooseOrganization', {
    url: '/organization',
    templateUrl: 'templates/chooseOrganization.html',
    controller: 'chooseOrganizationCtrl',
    params:{
      email: null
    }
  })


  .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/pickleJar.html',
      controller: 'pickleJarCtrl'
  })

  .state('app.pickleJar', {
      url: '/picklejar',
      views: {
          'menuContent': {
              templateUrl: 'templates/pickle_jar.html',
              controller: 'pickleJarCtrl'
          }
      },
      resolve: {
        "currentAuth": ["Auth", function (Auth) {
                return Auth.$requireSignIn();
            }]
    },
      cache: false
  })

  .state('app.about', {
    url: '/about',
      views: {
          'menuContent': {
              templateUrl: 'templates/about.html',
              controller: 'aboutCtrl'
          }
      }
  })

$urlRouterProvider.otherwise('/welcome')



});
