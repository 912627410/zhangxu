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
            templateUrl: 'app/main/mainframe.html'
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

      //车辆管理当前状态
      .state('rental.machineCurrentStatus', {
        url: '/machineCurrentStatus',
        views: {
          'main@rental': {
            templateUrl: 'app/components/rentalPlatform/machineMng/machineCurrentStatus.html',
            controller: 'machineCurrentStatusController',
            controllerAs: 'machineCurrentStatusCtr'
          }
        }
      })

      //车辆管理报警消息
      .state('rental.machineAlarmInfo', {
        url: '/machineAlarmInfo',
        views: {
          'main@rental': {
            templateUrl: 'app/components/rentalPlatform/machineMng/machineAlarmInfo.html',
            controller: 'machineAlarmInfoController',
            controllerAs: 'machineAlarmInfoCtr'
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
            controllerAs: 'rentalFleetMngCtr'
          }
        }
      })

      //租赁订单管理
      .state('rental.order', {
        url: '/order',
        views: {
          'main@rental': {
            templateUrl: 'app/components/rentalPlatform/fleetMng/rentalOrderMng.html',
            controller: 'rentalOrderMngController',
            controllerAs: 'rentalOrderMngCtrl'
          }
        }
      })

      //租赁订单管理--新建订单
      // .state('rental.newOrder', {
      //   url: '/newOrder',
      //   views: {
      //     'main@rental': {
      //       templateUrl: 'app/components/rentalPlatform/fleetMng/newRentalOrder.html',
      //       controller: 'newRentalOrderController',
      //       controllerAs: 'newRentalOrderCtrl'
      //     }
      //   }
      // })

      //租赁车辆管理围栏列表
      .state('rental.orgFence', {
        url: '/orgFence',
        views: {
          'main@rental': {
            templateUrl: 'app/components/rentalPlatform/machineMng/rentalFenceMng.html',
            controller: 'rentalFenceMngController',
            controllerAs: 'rentalFenceMngController'
          }
        }
      })


      //租赁客户管理
      .state('rental.customer', {
        url: '/customer',
        views: {
          'main@rental': {
            templateUrl: 'app/components/rentalPlatform/fleetMng/rentalCustomerMng.html',
            controller: 'rentalCustomerMngController',
            controllerAs: 'rentalCustomerMngController'
          }
        }
      })

      //租赁保养管理
      .state('rental.maintenance', {
        url: '/maintenance',
        views: {
          'main@rental': {
            templateUrl: 'app/components/rentalPlatform/fleetMng/rentalMaintenanceMng.html',
            controller: 'rentalMaintenanceController',
            controllerAs: 'rentalMaintenanceCtrl'
          }
        }
      })

      //租赁收入统计
      .state('rental.incomeStatistics', {
        url: '/incomeStatistics',
        views: {
          'main@rental': {
            templateUrl: 'app/components/rentalPlatform/profitStatistics/incomeStatistics.html',
            controller: 'incomeStatisticsController',
            controllerAs: 'incomeStatisticsCtr'
          }
        }
      })

      //租赁成本统计
      .state('rental.costStatistics', {
        url: '/costStatistics',
        views: {
          'main@rental': {
            templateUrl: 'app/components/rentalPlatform/profitStatistics/costStatistics.html',
            controller: 'costStatisticsController',
            controllerAs: 'costStatisticsCtr'
          }
        }
      })

      //租赁利润统计
      .state('rental.profitStatistics', {
        url: '/profitStatistics',
        views: {
          'main@rental': {
            templateUrl: 'app/components/rentalPlatform/profitStatistics/profitStatistics.html',
            controller: 'profitStatisticsController',
            controllerAs: 'profitStatisticsCtr'
          }
        }
      })


    //矿车管理系统
    $stateProvider
      .state('minemng', {
        url: '/minemng',
        views: {
          '@': {
            templateUrl: 'app/main/mineManagement/minemng.html',
            controller: 'minemngController'
          },
          'topbar@minemng': {
            templateUrl: 'app/main/mineManagement/minemngTopbar.html',
            controller: 'minemngTopbarController',
            controllerAs: 'minemngTopbarCtrl'
          },
          'main@minemng': {
            templateUrl: 'app/main/mineManagement/minemngContent.html',
            controller: 'minemngContentController',
            controllerAs: 'minemngContentCtrl'
          },
          'leftside@minemng': {
            templateUrl: 'app/main/mineManagement/minemngLeft.html'
          },
          'rightside@minemng': {
            templateUrl: 'app/components/mineManagement/minemngHome/minemngHome.html',
            controller: 'minemngHomeController',
            controllerAs: 'minemngHomeCtrl'
          }
        }
      })
      //调度管理
      .state('minemng.dispatchMng', {
        url: '/dispatchMng',
        views: {
          'rightside@minemng': {
            templateUrl: 'app/components/mineManagement/workPlanManagement/dispatchMng.html',
            controller: 'dispatchMngController',
            controllerAs: 'dispatchMngCtrl'
          }
        }
      })
      //调度历史
      .state('minemng.dispatchHistory', {
        url: '/dispatchHistory',
        views: {
          'rightside@minemng': {
            templateUrl: 'app/components/mineManagement/workPlanManagement/dispatchHistory.html',
            controller: 'dispatchHistoryController',
            controllerAs: 'dispatchHistoryCtrl'
          }
        }
      })
      //工作面管理
      .state('minemng.minemngWorkSurfaceMng', {
        url: '/minemngWorkSurfaceMng',
        views: {
          'rightside@minemng': {
            templateUrl: 'app/components/mineManagement/workSurfaceManagement/minemngWorkSurfaceMng.html',
            controller: 'minemngWorkSurfaceMngController',
            controllerAs: 'minemngWorkSurfaceMngCtrl'
          }
        }
      })
      //趟数
      .state('minemng.minemngTrip', {
        url: '/minemngTrip',
        views: {
          'rightside@minemng': {
            templateUrl: 'app/components/mineManagement/minemngHome/minemngTrip.html',
            controller: 'minemngTripController',
            controllerAs: 'minemngTripCtrl'
          }
        }
      })
      //油耗
      .state('minemng.minemngFuel', {
        url: '/minemngFuel',
        views: {
          'rightside@minemng': {
            templateUrl: 'app/components/mineManagement/minemngHome/minemngFuel.html',
            controller: 'minemngFuelController',
            controllerAs: 'minemngFuelCtrl'
          }
        }
      })
      //用户管理
      .state('minemng.minemngUserMng', {
        url: '/minemngUserMng',
        views: {
          'rightside@minemng': {
            templateUrl: 'app/components/mineManagement/userManagement/minemngUserMng.html',
            controller: 'minemngUserMngController',
            controllerAs: 'minemngUserMngCtrl'
          }
        }
      })
    //Check Point
      .state('minemng.minemngCheckPointMng', {
        url: '/minemngCheckPointMng',
        views: {
          'rightside@minemng': {
            templateUrl: 'app/components/mineManagement/checkPointManagement/checkPointMng.html',
            controller: 'checkPointMngController',
            controllerAs: 'checkPointMngCtrl'
          }
        }
      })
      //终端信息管理
      .state('minemng.minemngTerminalMng', {
          url: '/minemngTerminalMng',
          views: {
            'rightside@minemng': {
              templateUrl: 'app/components/mineManagement/terminalManagement/minemngTerminalMng.html',
              controller: 'minemngTerminalMngController',
              controllerAs: 'minemngTerminalMngCtrl'
            }
          }
        })
      //车辆管理
      .state('minemng.mineMachine', {
        url: '/machinemng',
        views: {
          'rightside@minemng': {
            templateUrl: 'app/components/mineManagement/machineManagement/minemngMachine.html',
            controller: 'minemngMachineController',
            controllerAs: 'minemngMachineCtrl'
          }
        }
      })
     //车队管理
    .state('minemng.mineMachineFleet', {
      url: '/mineMachineFleet',
      views: {
        'rightside@minemng': {
          templateUrl: 'app/components/mineManagement/fleetManagement/minemngFleet.html',
          controller: 'minemngFleetController',
          controllerAs: 'minemngFleetCtrl'
        }
      }
     });


    //物联网系统
    $stateProvider
      .state('home', {
        url: '/home',
        views: {
          '@': {
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
          }
        }
      })

      //app下载页面
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

      //注册页面
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

      //用户信息查看
      .state('home.profile', {
        url: '/profile',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/userManagement/profile.html',
            controller: 'profileController as profileCtrl'
          }
        }
      })

      //用户管理
      .state('home.userinfomng', {
        url: '/userinfomng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/userManagement/userMng.html',
            controller: 'userMngController as userMngController'
          }
        }
      })

      //车辆管理
      .state('home.machinemng', {
        url: '/machinemng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/machineManagement/machinemng.html',
            controller: 'machineMngController as machineMngCtrl'
          }
        }
      })

      //长时间未回传列表
      .state('home.idleDeviceReport', {
        url: '/idleDeviceReport',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/idle.device.html',
            controller: 'idleDeviceController as idleDeviceCtrl'
          }
        }
      })

      //
      .state('home.attendance', {
        url: '/attendance',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/attendance.html',
            controller: 'attendanceController as attendanceCtrl'
          }
        }
      })

      //超速报警
      .state('home.machineSpeeding', {
        url: '/machineSpeeding',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/machineSpeedingInfo.html',
            controller: 'machineSpeedingController as machineSpeedingCtrl'
          }
        }
      })

      //空挡滑行
      .state('home.machineNeutralSliding', {
        url: '/machineNeutralSliding',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/machineNeutralSlidingInfo.html',
            controller: 'machineNeutralSlidingController as machineNeutralSlidingCtrl'
          }
        }
      })

      //短信发送报表
      .state('home.smsSendReport', {
        url: '/smsSendReport',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/smsSendReport.html',
            controller: 'smsSendReportController as smsSendReportCtrl'
          }
        }
      })

      //ecu未激活列表
      .state('home.ecuNotActive', {
        url: '/ecuNotActive',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/ecuNotActive.html',
            controller: 'ecuNotActiveController as ecuNotActiveCtrl'
          }
        }
      })

      //未绑定列表
      .state('home.normalUnbound', {
        url: '/normalUnbound',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/report/normalUnbound.html',
            controller: 'normalUnboundController as normalUnboundCtrl'
          }
        }
      })

      //系统参数配置列表
      .state('home.sysconfigmng', {
        url: '/sysconfigmng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/sysconfigManagement/sysconfigmng.html',
            controller: 'sysconfigMngController as sysconfigMngCtrl'
          }
        }
      })

      //sim卡管理
      .state('home.simMng', {
        url: '/simMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/simManagement/simMng.html',
            controller: 'simMngController as simMngCtrl'
          }
        }
      })

      //设备管理
      .state('home.deviceinfoMng', {
        url: '/deviceinfoMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/deviceinfoManagement/deviceinfoMng.html',
            controller: 'deviceinfoMngController as deviceinfoMngCtrl'
          }
        }
      })

      //消息通知
      .state('home.notification', {
        url: '/notification',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/notification/notification.html',
            controller: 'NotificationController as notificationCtrl'
          }
        }
      })

      //保养通知
      .state('home.maintainNotice', {
        url: '/maintainNotice',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/deviceMonitor/maintainNotice.html',
            controller: 'maintainNoticeController as maintainNoticeCtrl'
          }
        }
      })

      //设备监控
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

      //组织管理
      .state('home.orgMng', {
        url: '/orgMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/orgManagement/orgMng.html',
            controller: 'orgMngController as orgMngCtrl'
          }
        }
      })

      //角色管理
      .state('home.roleMng', {
        url: '/roleMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/roleManagement/roleMng.html',
            controller: 'roleMngController as roleMngCtrl'
          }
        }
      })

      //车辆类型管理
      .state('home.machineTypeMng', {
        url: '/machineTypeMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/machineTypeManagement/machineTypeMng.html',
            controller: 'machineTypeMngController as machineTypeMngCtrl'
          }

        }
      })

      //权限管理
      .state('home.privilegeMng', {
        url: '/privilegeMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/privilegeManagement/privilegeMng.html',
            controller: 'privilegeMngController as privilegeMngCtrl'
          }
        }
      })

      //调拨
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

      //车队工作点
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

      //车队工作记录
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

      //车队地图监控
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

      //车队列表监控
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

      //车队管理
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

      //车队油耗配置
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

      //车队称重数据
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

      //车队燃料消耗
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

      //车队利润统计
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

      //数据分析
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

      //模板管理
      .state('home.templateMng', {
        url: '/templateMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/templateRegistry/templateMng.html',
            controller: 'templateMngController as templateMngController'
          }
        }
      })

      //模板新建
      .state('home.templateMng.new', {
        url: '/templateMng/new',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/templateRegistry/newTemplate.html',
            controller: 'newTemplateController as newTemplateCtrl'
          }
        }
      })

      //模板更新
      .state('home.templateMng.update', {
        url: '/templateMng/update',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/templateRegistry/updateTemplate.html',
            controller: 'updateTemplateController as updateTemplateCtrl'
          }
        }
      })

      //模板注册
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

      //设备远程升级
      .state('home.deviceUpdate', {
        url: '/deviceUpdate',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/deviceUpdate/deviceUpdate.html',
            controller: 'deviceUpdateController as deviceUpdateCtrl'
          }
        }
      })

      //远程升级--升级文件管理
      .state('home.updateFileMng', {
        url: '/updateFileMng',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/deviceUpdate/updateFileMng.html',
            controller: 'updateFileMngController as updateFileMngCtrl'
          }
        }
      })

      //更新日志
      .state('home.updateRecord', {
        url: '/updateRecord',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/deviceUpdate/updateRecord.html',
            controller: 'updateRecordController as updateRecordCtrl'
          }
        }
      })

      //app版本管理
      .state('home.appVersion', {
        url: '/appVersion',
        views: {
          'rightside@home': {
            templateUrl: 'app/components/appManagement/appVersion.html',
            controller: 'appVersionController as appVersionCtrl'
          }
        }
      });

    //默认去尝试自动登录
    $urlRouterProvider.otherwise('/entry');

  }

})();
