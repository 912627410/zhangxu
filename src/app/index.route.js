(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/home',
        views: {
          '': {
            templateUrl: 'app/main/mainframe.html'
          },
          'topbar@home': {
            templateUrl: 'app/main/topbar.html',
            controller: 'MainController',
            controllerAs: 'mainCtrl'
          },
          'main@home': {
            templateUrl: 'app/home/home.html'
          },
          'leftside@home': {
            templateUrl: 'app/main/leftside.html'
          },
          'rightside@home': {
            templateUrl: 'app/home/homecontent.html'
          },
          'homemap@home': {
            templateUrl: 'app/home/homemap.html',
            controller: 'HomeMapController',
            controllerAs: "homeMapCtrl"
          },
          'homestaticbox@home': {
            templateUrl: 'app/home/homestaticbox.html',
            controller: 'HomeController',
            controllerAs: 'homeCtrl'
          },
          'footer@home':{
            templateUrl: 'app/main/footer.html'
          }
        }
      })
      .state('home.login', {
        url: '/login',
        views: {
          'footer@home':{
            templateUrl: 'app/main/widefooter.html'
          },
          'main@home': {
            templateUrl: 'app/components/login/login.html',
            controller: 'LoginController',
            controllerAs: 'loginCtrl'
          }
        }
      })
      .state('home.register', {
        url: '/register',
        views: {
          'footer@home':{
            templateUrl: 'app/main/widefooter.html'
          },
          'main@home': {
            templateUrl: 'app/components/register/register.html',
            controller: 'RegisterController',
            controllerAs: 'registerCtrl'
          }
        }
      })
      .state('home.profile', {
        url: '/profile',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/userManagement/profile.html',
            controller: 'profileController as profileCtrl'
          }
        }
      })
      .state('home.userinfomng', {
        url: '/userinfomng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/userManagement/userMng.html',
            controller: 'userMngController as userMngController'
          }
        }
      })
      .state('home.machinemng', {
        url: '/machinemng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/machineManagement/machinemng.html',
            controller: 'machineMngController as machineMngCtrl'
          }
        }
      })
      .state('home.idleDeviceReport', {
        url: '/idleDeviceReport',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/idle.device.html',
            controller: 'idleDeviceController as idleDeviceCtrl'
          }
        }
      })
      .state('home.sysconfigmng', {
        url: '/sysconfigmng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/sysconfigManagement/sysconfigmng.html',
            controller: 'sysconfigMngController as sysconfigMngCtrl'
          }
        }
      })
      .state('home.simMng', {
        url: '/simMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/simManagement/simMng.html',
            controller: 'simMngController as simMngCtrl'
          }
        }
      })
      .state('home.deviceinfoMng', {
        url: '/deviceinfoMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/deviceinfoManagement/deviceinfoMng.html',
            controller: 'deviceinfoMngController as deviceinfoMngCtrl'
          }
        },

      })
      .state('home.notification', {
        url: '/notification',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/notification/notification.html',
            controller: 'NotificationController as notificationCtrl'
          }
        }
      })
      .state('home.maintainNotice', {
        url: '/maintainNotice',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/deviceMonitor/maintainNotice.html',
            controller: 'maintainNoticeController as maintainNoticeCtrl'
          }
        }
      })
      .state('home.monitor', {
        url: '/monitor',
        views: {
          'footer@home':{
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/deviceMonitor/devicemonitor.html',
            controller: 'DeviceMonitorController',
            controllerAs: 'monitorCtrl'
          }
        }
      })
      .state('home.roleMng', {
        url: '/roleMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/roleManagement/roleMng.html',
            controller: 'roleMngController as roleMngCtrl'
          }

        }
      })
      .state('home.priviligeMng', {
        url: '/priviligeMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/priviligeManagement/priviligeMng.html',
            controller: 'priviligeMngController as priviligeMngCtrl'
          }


        }
      })

    ;

    $urlRouterProvider.otherwise('/home');
  }

})();
