/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineAlarmInfoController', machineAlarmInfoController);

  /** @ngInject */
  function machineAlarmInfoController($rootScope, $scope, $window, $location, $anchorScroll, $uibModal, serviceResource, languages, commonFactory,
                                      RENTAL_ALARM_MSG_URL, RENTAL_ALARM_MSG_DATA_URL, RENTAL_MACHINE_MONITOR_URL, ALERT_TREND_URL, RENTAL_NOTIFICATION_URL) {
    var vm = this;
    //定义报警类型,1:围栏报警 2:保养提醒 3:离线提醒(长时间未回传数据)
    vm.fenceAlarm = 0;//围栏报警
    vm.machineAlarm = 0;//车辆报警
    vm.keepAlarm = 0;//保养报警
    vm.offLineAlarm = 0;//离线报警
    vm.allNotificationNumber = 0;//所有的报警
    vm.noProcessNumber = 0;//未处理报警
    vm.processedNumber = 0;//已处理报警
    vm.pageSize = 9;
    //搜索条件定义
    vm.searchConditions = {}
    //定义页面导航
    $scope.navs = [{
      "title": "rental", "alias": "rentalCurrentLocate", "icon": "fa-map"
    }, {
      "title": "rental.machineCurrentStatus", "alias": "currentState", "icon": "fa-signal"
    }, {
      "title": "rental.machineAlarmInfo", "alias": "alarmInformation", "icon": "fa-exclamation-triangle"
    }];
    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 15 - 90 - 15 - 7 - 25;//50 topBar的高,15间距,90msgBox高,15间距,8 预留
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
    }
    //初始化高度
    vm.adjustWindow($window.innerHeight);
    /**
     * 名称转到某个视图
     * @param view 视图名称
     */
    vm.gotoView = function (view) {
      $rootScope.$state.go(view);
    }
    /**
     * 根据类型获取报警信息的数量
     * @param type
     */
    vm.getAlarmCountByType = function (alarmType) {
      if (alarmType == 4) {//车辆报警单独处理

        return;
      }
      var restCallUrl = RENTAL_ALARM_MSG_URL;

      if (alarmType != null && alarmType != undefined) {
        restCallUrl += "?alarmType=" + alarmType;
      }

      var respData = serviceResource.restCallService(restCallUrl, "GET");
      respData.then(function (data) {
        var msgNum = data.content;
        if (alarmType == 1) {
          vm.fenceAlarm = msgNum;
        }
        if (alarmType == 2) {
          vm.keepAlarm = msgNum;//保养报警
        }
        if (alarmType == 3) {
          vm.offLineAlarm = msgNum;//离线报警
        }
      }, function (reason) {
        Notification.error(languages.findKey('rentalGetDataError'));
      })
    }
    vm.getAlarmCountByType(1);//围栏报警
    vm.getAlarmCountByType(2);//保养提醒
    vm.getAlarmCountByType(3);//离线提醒
    vm.getAlarmCountByType(4);//车辆报警

    /**
     * 根据状态获取报警数量
     *
     * @param status
     */
    vm.getAlarmCountByStatus = function (status) {
      var restCallUrl = RENTAL_ALARM_MSG_URL;
      if (status != null && status != undefined) {
        restCallUrl += "?status=" + status;
      }
      var respData = serviceResource.restCallService(restCallUrl, "GET");
      respData.then(function (data) {
        if (status == null || status == undefined) {
          vm.allNotificationNumber = data.content;//所有的报警
        }
        if (status == true) {
          vm.processedNumber = data.content;//已处理报警
        }
        if (status == false) {
          vm.noProcessNumber = data.content;//未处理报警
        }
      }, function (reason) {
        Notification.error(languages.findKey('rentalGetDataError'));
      })
    }
    vm.getAlarmCountByStatus(undefined);
    vm.getAlarmCountByStatus(true);
    vm.getAlarmCountByStatus(false);


    /**
     * 获取报警消息
     * @param currentPage
     * @param pageSize
     * @param totalElements
     * @param searchConditions
     */
    vm.getMsgByAlarmType = function (currentPage, pageSize, totalElements, searchConditions) {
      var restCallURL = RENTAL_ALARM_MSG_DATA_URL;
      var pageUrl = currentPage || 0;
      var sizeUrl = pageSize || vm.pageSize;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl;
      if (totalElements != null || totalElements != undefined) {
        restCallURL += "&totalElements=" + totalElements;
      }
      if (searchConditions != null) {
        restCallURL = commonFactory.processSearchConditions(restCallURL, searchConditions);
      }
      var notificationDataPromis = serviceResource.restCallService(restCallURL, "GET");
      notificationDataPromis.then(function (data) {
        vm.notificationList = data.content;
        vm.totalElements = data.totalElements;
        vm.currentPage = data.number + 1;
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    }

    //初始化加载
    if ($rootScope.alarmType) {
      vm.searchConditions.alarmType = $rootScope.alarmType;
      $rootScope.alarmType = null;
      vm.getMsgByAlarmType(0, vm.pageSize, null, vm.searchConditions);
    } else {
      vm.getMsgByAlarmType(0, vm.pageSize, null, null);
    }

    /**
     * 按照报警类型筛选
     * @param alarmType
     */
    vm.loadMsgDataByType = function (alarmType) {
      vm.searchConditions = {};
      if (alarmType == null || alarmType == undefined) {
        vm.getMsgByAlarmType(0, vm.pageSize, null, null);
      } else {
        vm.searchConditions.alarmType = alarmType;
        vm.getMsgByAlarmType(0, vm.pageSize, null, vm.searchConditions);
      }
    }

    /**
     * 按照处理状态筛选
     * @param alarmStatus
     */
    vm.loadMsgDataByStatus = function (alarmStatus) {
      vm.searchConditions = {};
      if (alarmStatus == null || alarmStatus == undefined) {
        vm.getMsgByAlarmType(0, vm.pageSize, null, null);
      } else {
        vm.searchConditions.status = alarmStatus;
        vm.getMsgByAlarmType(0, vm.pageSize, null, vm.searchConditions);
      }
    }
    /**
     * 打开车辆监控窗口
     *
     * @param deviceNum
     */
    vm.machineMonitor = function (deviceNum) {
      var restCallUrl = RENTAL_MACHINE_MONITOR_URL + "?deviceNum=" + deviceNum;
      var deviceDataPromis = serviceResource.restCallService(restCallUrl, "GET");
      deviceDataPromis.then(function (data) {
        //打开模态框
        $rootScope.currentOpenModal = $uibModal.open({
          animation: true,
          backdrop: false,
          templateUrl: 'app/components/rentalPlatform/machineMng/machineMonitor.html',
          controller: 'machineMonitorController',
          controllerAs: 'vm',
          openedClass: 'hide-y',//class名 加载到整个页面的body 上面可以取消右边的滚动条
          windowClass: 'top-spacing',//class名 加载到ui-model 的顶级div上面
          size: 'super-lgs',
          resolve: { //用来向controller传数据
            deviceInfo: function () {
              return data.content;
            }
          }
        });
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    }

    /**
     *  处理报警信息
     *
     * @param status
     */
    vm.processRentalNotificationDeal = function (notification, index) {
      var restCallUrl = RENTAL_NOTIFICATION_URL + "?id=" + notification.id + "&dealStatus=" + notification.processStatus;
      var notificationPromis = serviceResource.restCallService(restCallUrl, "UPDATE");
      notificationPromis.then(function (data) {

        if (data.content == true && notification.processStatus==true) {
          //标记为已处理成功
          vm.notificationList.splice(index, 1);
          vm.noProcessNumber += 1;
          vm.processedNumber -= 1;
        }
        if (data.content == true && notification.processStatus==false) {
          //标记为已处理成功
          vm.notificationList.splice(index, 1);
          vm.noProcessNumber -= 1;
          vm.processedNumber += 1;
        }

      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    }

    /**
     * miniMap
     */
    var miniMap = document.getElementsByClassName('miniChart'),
      miniMap1 = echarts.init(miniMap[0]),
      miniMap2 = echarts.init(miniMap[1]),
      miniMap3 = echarts.init(miniMap[2]),
      miniMap4 = echarts.init(miniMap[3]);

    function creatMiniChart(chart, alarmType) {

      var restCallURL = ALERT_TREND_URL;
      restCallURL += '?alarmType=' + alarmType;
      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        function getLocalTime(nS) {
          return new Date(parseInt(nS)).toLocaleString().substr(0, 10)
        }

        for (var i = 0; i < 7; i++) {
          data.content.alarmDates[i] = getLocalTime(data.content.alarmDates[i])
        }

        var option = {
          tooltip: {
            // showContent: false,
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              lineStyle: {
                color: 'rgba(124, 181, 236, 0.5)'
              }
            }
          },
          grid: {
            top: '35%',
            left: '',
            right: '6%',
            bottom: '-10%',
            containLabel: true
          },
          xAxis: {
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: 'rgba(124, 181, 236, 0.5)'
              }
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            },
            data: data.content.alarmDates
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            }
          },
          series: {
            name: '提醒数量',
            type: 'line',
            label: {
              emphasis: {
                show: true,
                textStyle: {
                  color: 'rgba(124, 181, 236, 1)'
                },
                formatter: function (param) {
                  return param.data[3];
                },
                position: 'top'
              }
            },
            itemStyle: {
              normal: {
                opacity: 0
              },
              emphasis: {
                color: 'rgba(124, 181, 236, 1)',
                borderColor: '#fff',
                borderWidth: 2,
                opacity: 1
              }
            },
            lineStyle: {
              normal: {
                width: 1,
                color: 'rgba(124, 181, 236, 1)'
              }
            },
            areaStyle: {
              normal: {
                color: 'rgba(124, 181, 236, 0.25)'
              }
            },
            data: data.content.countList,
            smooth: true,
            smoothMonotone: 'x'
          }
        };
        chart.setOption(option);
      }, function () {
        console.log('gg')
      });

    }

    creatMiniChart(miniMap1, 1);
    creatMiniChart(miniMap2, 4);
    creatMiniChart(miniMap3, 2);
    creatMiniChart(miniMap4, 3);

  }
})();
