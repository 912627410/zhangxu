(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {

    //自动登录入口,默认视图
    $stateProvider
      .state('entry', {
        url: '/entry',
        views: {
          '': {
            templateUrl: 'app/components/entry/entry.html',
            controller: 'entryController',
            controllerAs: 'entryCtrl'
          }
        }
      })

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
          },
        }
      })

    //选择系统界面
    $stateProvider
      .state('selectApp', {
        url: '/selectApp',
        views: {
          '@': {
            template: '<div ui-view="topbar"></div><div ui-view="main"></div>'
          },
          'topbar@selectApp': {
            templateUrl: 'app/main/selectAppTopBar.html',
            controller: 'selectAppTopBarController',
            controllerAs: 'selectAppTopBarCtr'
          },
          'main@selectApp': {
            templateUrl: 'app/main/selectApp.html',
            controller: 'selectAppController',
            controllerAs: 'selectAppCtr'
          }

        }

      })

    //租赁系统
    $stateProvider
      .state('rental', {
        url: '/rental',
        views: {
          '@': {
            templateUrl: 'app/main/rentalPlatform/rentalPlatform.html',
            controller: 'rentalPlatformController'
          },
          'topbar@rental': {
            templateUrl: 'app/main/rentalPlatform/rentalPlatformTopbar.html',
            controller: 'rentalPlatformTopbarController',
            controllerAs: 'rentalPlatformTopbarCtr'
          },
          'main@rental': {
            templateUrl: 'app/main/rentalPlatform/machineMng.html',
            controller: 'rentalMachineMngController',
            controllerAs: 'rentalMachineMngCtr'
          }
        }
      })
      .state('rental.machineHistoryData', {
        url: '/machineHistoryData',
        views: {
          'main@rental': {
            templateUrl: 'app/components/rentalPlatform/machineMng/machineHistoryData.html',
            controller: 'machineHistoryDataController',
            controllerAs: 'machineHistoryDataCtr'
          }
        }
      })
      .state('rental.machineLifeCycle', {
      url: '/machineLifeCycle',
      views: {
        'main@rental': {
          templateUrl: 'app/components/rentalPlatform/machineMng/machineLifeCycle.html',
          controller: 'machineLifeCycleController',
          controllerAs: 'machineLifeCycleCtr'
        }
      }
    })
      //租赁车队管理
      .state('rental.fleet', {
        url: '/fleet',
        views: {
          'main@rental': {
            templateUrl: 'app/components/rentalPlatform/fleetMng/rentalFleetMng.html',
            controller: 'rentalFleetMngController',
            controllerAs: 'rentalFleetMngController'
          }
        }
      })

    //物联网系统
    $stateProvider
      .state('home', {
        url: '/home',
        views: {
          '': {
            templateUrl: 'app/main/mainframe.html',
            controller: 'MainController',
            controllerAs: 'mainCtrl'
          },
          'topbar@home': {
            templateUrl: 'app/main/topbar.html',
            controller: 'homeTopbarController',
            controllerAs: 'homeTopbarCtl'
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
            templateUrl: 'app/main/footer.html'
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
            templateUrl: 'app/main/footer.html'
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
      .state('home.machineSpeeding', {
        url: '/machineSpeeding',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/machineSpeedingInfo.html',
            controller: 'machineSpeedingController as machineSpeedingCtrl'
          }
        }
      })
      .state('home.machineNeutralSliding', {
        url: '/machineNeutralSliding',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/machineNeutralSlidingInfo.html',
            controller: 'machineNeutralSlidingController as machineNeutralSlidingCtrl'
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
      .state('home.machineTypeMng', {
        url: '/machineTypeMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/machineTypeManagement/machineTypeMng.html',
            controller: 'machineTypeMngController as machineTypeMngCtrl'
          }

        }
      })
      .state('home.privilegeMng', {
        url: '/privilegeMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/privilegeManagement/privilegeMng.html',
            controller: 'privilegeMngController as privilegeMngCtrl'
          }


        }
      })
      .state('home.machineMove', {
        url: '/machineMove',
        views: {
          'footer@home': {
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/fleetManagement/machineMove.html',
            controller: 'machineMoveController',
            controllerAs: 'machineMoveCtrl'
          }
        }
      })
      .state('home.workPoint', {
        url: '/workPoint',
        views: {
          'footer@home': {
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/fleetMonitor/workPoint.html',
            controller: 'workPointController',
            controllerAs: 'workPointCtrl'
          }
        }
      })
      .state('home.workRecord', {
        url: '/workRecord',
        views: {
          'footer@home': {
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/revenueManagement/workRecord.html',
            controller: 'workRecordController',
            controllerAs: 'workRecordCtrl'
          }
        }
      })
      .state('home.fleetMapMonitor', {
        url: '/fleetMapMonitor',
        views: {
          'footer@home': {
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/fleetMonitor/fleetMapMonitor.html',
            controller: 'fleetMapMonitorController',
            controllerAs: 'fleetMapMonitorCtrl'
          }
        }
      })
      .state('home.fleetLineMonitor', {
        url: '/fleetLineMonitor',
        views: {
          'footer@home': {
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/fleetMonitor/fleetLineMonitor.html',
            controller: 'fleetLineMonitorController',
            controllerAs: 'fleetLineMonitorCtrl'
          }
        }
      })
      .state('home.fleetMng', {
        url: '/fleetMng',
        views: {
          'footer@home': {
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/fleetManagement/fleetMng.html',
            controller: 'fleetMngController',
            controllerAs: 'fleetMngCtrl'
          }
        }
      })
      .state('home.fuelConfig', {
        url: '/fuelConfig',
        views: {
          'footer@home': {
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
          'footer@home': {
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/revenueManagement/weightData.html',
            controller: 'weightDataController',
            controllerAs: 'weightDataCtrl'
          }
        }
      })
      .state('home.fuelConsumption', {
        url: '/fuelConsumption',
        views: {
          'footer@home': {
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/revenueManagement/fuelConsumption.html',
            controller: 'fuelConsumptionController',
            controllerAs: 'fuelConsumptionCtrl'
          }
        }
      })
      .state('home.profit', {
        url: '/profit',
        views: {
          'footer@home': {
            templateUrl: 'app/main/footer.html'
          },
          'rightside@home': {
            templateUrl: 'app/components/revenueManagement/profit.html',
            controller: 'profitController',
            controllerAs: 'profitCtrl'
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
      .state('home.deviceparameter', {
        url: '/deviceparameter',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/deviceParameter/deviceparameter.html',
            controller: 'devivceparameterController as devivceparameterCtrl'
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
      .state('home.machineWorkingHours', {
        url: '/machineWorkingHours',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/trackRecordManagement/machineWorkingHours.html',
            controller: 'machineWorkingHoursController as machineWorkingHoursController'
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
      .state('home.templateMng', {
        url: '/templateMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/templateRegistry/templateMng.html',
            controller: 'templateMngController as templateMngController'
          }
        }
      })
      .state('home.templateMng.new', {
        url: '/templateMng/new',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/templateRegistry/newTemplate.html',
            controller: 'newTemplateController as newTemplateCtrl'
          }
        }
      })
      .state('home.templateMng.update', {
        url: '/templateMng/update',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/templateRegistry/updateTemplate.html',
            controller: 'updateTemplateController as updateTemplateCtrl'
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
      .state('home.machineComparison', {
        url: '/machineComparison',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/workHotAnalysis/machineComparison.html',
            controller: 'machineComparedMngController as machineComparedMngCtrl'
          }
        }
      })

    //默认去尝试自动登录
    $urlRouterProvider.otherwise('/entry');

  }

})();
