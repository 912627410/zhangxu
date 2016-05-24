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
        },
        resolve: {
          //'permission': ["permissions", "serviceResource", "$filter", function(permissions, serviceResource, $filter) {
          //  return serviceResource.getPermission().then(function(data) {
          //    permissions.setPermissions($filter("array2obj")(data.content, "permission"));
          //  });
          //}]


          permission: function(permissions,serviceResource,$filter){
            console.log("this is in index start");
            var rspdata= serviceResource.getPermission();
            console.log("33333==="+rspdata.data);
            rspdata.then(function (data) {
              console.log("data=="+data.content);

              var permissionList=$filter("array2obj")(data.content, "permission");
              console.log(permissionList['device:homegpsdata']);

               permissions.setPermissions(permissionList);
            }, function (reason) {
              console.log("555");
              Notification.error('获取设备信息失败');
            })
            console.log("this is in index start");
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
            templateUrl: 'app/components/userManagement/userinfomng.html',
            controller: 'userMngController as userMngCtrl'
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

    ;

    $urlRouterProvider.otherwise('/home');
  }

})();
