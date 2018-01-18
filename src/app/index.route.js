(function () {
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
          'footer@home': {
            templateUrl: 'app/main/footer.html'
          },
          'reportChart@home': {
            templateUrl: 'app/home/reportChart.html',
            controller: 'ReportChartController',
            controllerAs: 'reportChartCtrl'
          },
        }
      })
      .state('home.appDownloadPage', {
        url: '/appDownloadPage',
        views: {
          'footer@home': {
            templateUrl: 'app/main/widefooter.html'
          },
          'main@home': {
            templateUrl: 'app/components/appManagement/appDownloadPage.html'
          }
        }
      })
      .state('home.register', {
        url: '/register',
        views: {
          'footer@home': {
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
      .state('home.smsSendReport', {
        url: '/smsSendReport',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/smsSendReport.html',
            controller: 'smsSendReportController as smsSendReportCtrl'
          }
        }
      })
      .state('home.ecuNotActive', {
        url: '/ecuNotActive',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/ecuNotActive.html',
            controller: 'ecuNotActiveController as ecuNotActiveCtrl'
          }
        }
      })
      .state('home.normalUnbound', {
        url: '/normalUnbound',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/normalUnbound.html',
            controller: 'normalUnboundController as normalUnboundCtrl'
          }
        }
      })
      .state('home.intervalAndSignal', {
        url: '/intervalAndSignal',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/deviceAnalysis/intervalAndSignal.html',
            controller: 'intervalAndSignalController as intervalAndSignalCtrl'
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
          'footer@home': {
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/deviceMonitor/devicemonitor.html',
            controller: 'DeviceMonitorController',
            controllerAs: 'monitorCtrl'
          }
        }
      })
      .state('home.orgMng', {
        url: '/orgMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/orgManagement/orgMng.html',
            controller: 'orgMngController as orgMngCtrl'
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
      .state('home.updateObjectMng', {
        url: '/updateObjectMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/updateObjectManagement/updateObjectMng.html',
            controller: 'updateObjectMngController as updateObjectMngCtrl'
          }
        }
      })
      .state('home.dataAnalysis', {
        url: '/dataAnalysis/:role/:menuType',
        views: {
          'footer@home': {
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/dataAnalysis/dataAnalysis.html',
            controller: 'dataAnalysisController'
          }
        }
      })
      .state('home.deviceUpdate', {
        url: '/deviceUpdate',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/deviceUpdate/deviceUpdate.html',
            controller: 'deviceUpdateController as deviceUpdateCtrl'
          }
        }
      })
      .state('home.updateFileMng', {
        url: '/updateFileMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/deviceUpdate/updateFileMng.html',
            controller: 'updateFileMngController as updateFileMngCtrl'
          }
        }
      })
      .state('home.updateRecord', {
        url: '/updateRecord',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/deviceUpdate/updateRecord.html',
            controller: 'updateRecordController as updateRecordCtrl'
          }
        }
      })
      .state('home.machineComparison', {
        url: '/machineComparison',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/workHotAnalysis/machineComparison.html',
            controller: 'machineComparedMngController as machineComparedMngCtrl'
          }
        }
      })
      .state('home.warZone', {
        url: '/warZone',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/workHotAnalysis/warZone.html',
            controller: 'warZoneController as warZoneCtrl'
          }
        }
      })
      .state('home.machineMaintenance', {
        url: '/machineMaintenance',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/workHotAnalysis/machineMaintenance.html',
            controller: 'machineMaintenanceController as machineMaintenanceCtrl'
          }
        }
      })
      .state('home.modelsCompare', {
        url: '/modelsCompare',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/workHotAnalysis/modelsCompare.html',
            controller: 'modelsCompareController as modelsCompareCtrl'
          }
        }
      })
      .state('home.machineWorkTime', {
        url: '/machineWorkTime',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/workHotAnalysis/machineWorkTime.html',
            controller: 'machineWorkTimeController as machineWorkTimeCtrl'
          }
        }
      })
      .state('home.activeRate', {
        url: '/activeRate',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/workHotAnalysis/activeRate.html',
            controller: 'activeRateController as activeRateCtrl'
          }
        }
      })
      .state('home.utilization', {
        url: '/utilization',
        views: {
          'rightside@home': {
            templateUrl: function(){
              return 'app/components/lgBigData/utilization.html'
            },
            controller: 'utilizationController as utilizationCtrl'

          },
          'footer@home': {
            templateUrl: ''
          },
        }
      })

    //DMS系统页面集成
    $stateProvider
      .state('dms', {
        url: '/dms',
        views: {
          '@': {
            templateUrl: 'app/main/dms/dmsMainframe.html',
          }
        }
      })
      .state('dms.machineComparison', {
        url: '/machineComparison?username&password&orgLgCode',
        views: {
          'main@dms': {
            templateUrl: 'app/components/workHotAnalysis/machineComparison.html',
            controller: 'machineComparedMngController as machineComparedMngCtrl'
          }
        }
      });

    //登录页面
    $stateProvider
      .state('login', {
        url: '/login',
        views: {
          '@': {
            template: '<div ui-view="topbar"></div><div ui-view="main"></div><div ui-view="footer"></div>'
          },
          'topbar@login': {
            templateUrl: 'app/components/login/topBar.html',
            controller: 'TopBarController',
            controllerAs: 'TopBarCtrl'
          },
          'main@login': {
            templateUrl: 'app/components/login/login.html',
            controller: 'LoginController',
            controllerAs: 'loginCtrl'
          },
          'footer@login': {
            templateUrl: 'app/components/login/footer.html'
          }
        }
      })

    $urlRouterProvider.otherwise('/home');

  }
})();
