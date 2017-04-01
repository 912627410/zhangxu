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
          },
          'reportChart@home': {
            templateUrl: 'app/home/reportChart.html',
            controller: 'ReportChartController',
            controllerAs: 'reportChartCtrl'
          },
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
      .state('home.appDownloadPage', {
        url: '/appDownloadPage',
        views: {
          'footer@home':{
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
      .state('home.attendance', {
        url: '/attendance',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/attendance.html',
            controller: 'attendanceController as attendanceCtrl'
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
      .state('home.machineMove', {
        url: '/machineMove',
        views: {
          'footer@home':{
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/fleetManagement/machineMove.html',
            controller: 'machineMoveController',
            controllerAs: 'machineMoveCtrl'
          }
        }
      })

      .state('home.workplane', {
        url: '/workplane',
        views: {
          'footer@home':{
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/fleetManagement/workplaneMng.html',
            controller: 'workplaneMngController',
            controllerAs: 'workplaneMngCtrl'
          }
        }
      })

      .state('home.fleetMng', {
        url: '/fleetMng',
        views: {
          'footer@home':{
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/fleetManagement/fleetMng.html',
            controller: 'fleetMngController',
            controllerAs: 'fleetMngCtrl'
          }
        }
      })

      .state('home.revenue', {
        url: '/revenue',
        views: {
          'footer@home':{
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/revenueManagement/revenueMng.html',
            controller: 'revenueMngController',
            controllerAs: 'revenueMngController'
          }
        }
      })

      .state('home.cost', {
        url: '/cost',
        views: {
          'footer@home':{
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/costManagement/costMng.html',
            controller: 'costMngController',
            controllerAs: 'costMngController'
          }
        }
      })
      .state('home.fuelConfig', {
        url: '/fuelConfig',
        views: {
          'footer@home':{
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/fuelConfigManagement/fuelConfigMng.html',
            controller: 'fuelConfigMngController',
            controllerAs: 'fuelConfigMngController'
          }
        }
      })
      .state('home.weightData', {
        url: '/weightData',
        views: {
          'footer@home':{
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/revenueManagement/weightData.html',
            controller: 'weightDataController',
            controllerAs: 'weightDataCtrl'
          }
        }
      })
      .state('home.dataAnalysis', {
        url: '/dataAnalysis/:role/:menuType',
        views: {
          'footer@home':{
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/dataAnalysis/dataAnalysis.html',
            controller: 'dataAnalysisController'
          }
        }
      })
      .state('home.deviceparameter',{
      url: '/deviceparameter',
      views: {
        'rightside@home': {
          templateUrl: 'app/components/deviceParameter/deviceparameter.html',
          controller: 'devivceparameterController as devivceparameterCtrl'
        }
      }
    })


      .state('home.dullmachinemng', {
        url: '/dullmachinemng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/trackRecordManagement/dullmachineMng.html',
            controller: 'dullmachineMngController as dullmachineMngController'
          }
        }
      })
      .state('home.trackRecordAnalyzemng', {
        url: '/trackRecordAnalyzemng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/trackRecordManagement/trackRecordAnalyzemng.html',
            controller: 'trackRecordAnalyzeMngController as trackRecordAnalyzeMngController'
          }
        }
      })
      .state('home.workStartmng', {
        url: '/workStartmng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/workHotAnalysis/workStartMng.html',
            controller: 'workStartMngController as workStartMngController'
          }
        }
      })
      .state('home.barDistributionmng', {
        url: '/barDistributionmng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/workHotAnalysis/barDistributionMng.html',
            controller: 'barDistributionMngController as barDistributionMngController'
          }
        }
      })
      .state('home.machineworkreport', {
        url: '/machineworkreportmng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/workHotAnalysis/machineworkreportMng.html',
            controller: 'machineworkreportMngController as machineworkreportMngController'
          }
        }
      })

      .state('home.machineworklive', {
        url: '/machineworklivemng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/workHotAnalysis/machineworkliveMng.html',
            controller: 'machineworkliveMngController as machineworkliveMngController'
          }
        }
      })

      .state('home.MachineClustering', {
        url: '/MachineClusteringmng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/MachineClusteringMng.html',
            controller: 'MachineClusteringMngController as MachineClusteringMngController'
          }
        }
      })



      .state('home.VersionInformation', {
        url: '/templateRegistry',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/templateRegistry/VersionInformation.html',
            controller: 'VersionInfoMngController as VersionInfoMngController'
          }
        }
      })
    .state('home.templateRegistry', {
      url: '/templateRegistry',
      views: {
        'rightside@home': {
          templateUrl: 'app/components/templateRegistry/templateRegistry.html',
          controller: 'templateRegistryMngController as templateRegistryMngController'
        }
      }
    })





    ;
    $urlRouterProvider.otherwise('/home');
  }

})();
