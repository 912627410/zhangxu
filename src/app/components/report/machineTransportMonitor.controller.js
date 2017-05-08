(function () {
  'use strict';

  angular
  .module('GPSCloud')
  .controller('machineTransportMonitorController', machineTransportMonitorController);

  /** @ngInject */
  function machineTransportMonitorController($rootScope, $scope ,$filter, NgTableParams, ngTableDefaults, Notification, serviceResource, MACHINE_TRANSPORTINFO_URL) {

    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.speedAlertMonitor = false; // 超速报警实时监控开关
    vm.neutralSlideMonitor = false; // 空档滑行实时监控开关

    ngTableDefaults.params.count = 15;
    ngTableDefaults.settings.counts = [];

    /**
     * 重置起止时间
     */
    vm.initDate = function () {
      var startDate = new Date();
      startDate.setDate(startDate.getDate() - 1);
      vm.startDate = startDate;
      vm.endDate = new Date();
    };

    vm.initDate();


    vm.speedAlertList = [];
    vm.neutralSlideList = [];

    // 日期控件相关
    // date picker
    vm.startDateOpenStatus = {
      opened: false
    };

    vm.startDateOpen = function ($event) {
      vm.startDateOpenStatus.opened = true;
    };

    vm.endDateOpenStatus = {
      opened: false
    };

    vm.endDateOpen = function ($event) {
      vm.endDateOpenStatus.opened = true;
    };

    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    /**
     * 超速报警分页查询
     * @param page
     * @param size
     * @param sort
     * @param type 1：超速报警  2：空档滑行
     */
    vm.query = function (page, size, sort, type) {
      var restCallURL = MACHINE_TRANSPORTINFO_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 15;
      var sortUrl = sort || "locateDateTime,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != vm.startDate) {
        var startDate = new Date(vm.startDate.getTime() + 1000*3600*24);
        restCallURL += "&search_DGTE_locateDateTime=" + $filter('date')(startDate, 'yyyy-MM-dd');
      }
      if (null != vm.endDate ) {
        restCallURL += "&search_DLTE_locateDateTime=" + $filter('date')(vm.endDate, 'yyyy-MM-dd');
      }
      if(null != vm.queryLicenseId){
        restCallURL += "&search_LIKES_licenseId=" + $filter('uppercase')(vm.queryLicenseId);
      }

      if(type == "1") {
        restCallURL += "&search_EQ_type=1";
        var OverSpeedData = serviceResource.restCallService(restCallURL, "GET");
        OverSpeedData.then(function (data) {
          if(data.content.length == 0) {
            Notification.warning("查询结果为空");
            return;
          }
          vm.overSpeedTable = new NgTableParams({
          }, {
            dataset: data.content
          });
          vm.overSpeedPage = data.page;
          vm.overSpeedPageNumber = data.page.number + 1;
          Notification.success("查询成功");
        }, function (reason) {
          Notification.error(reason.data.message);
        });
      } else if (type == "2") {
        restCallURL += "&search_EQ_type=2";
        var neutralSlideData = serviceResource.restCallService(restCallURL, "GET");
        neutralSlideData.then(function (data) {
          if(data.content.length == 0) {
            Notification.warning("查询结果为空");
            return;
          }
          vm.neutralSlideTable = new NgTableParams({
          }, {
            dataset: data.content
          });
          vm.neutralSlidePage = data.page;
          vm.neutralSlidePageNumber = data.page.number + 1;
          Notification.success("查询成功");
        }, function (reason) {
          Notification.error(reason.data.message);
        });
      }
    };

    vm.query(null, null, null, 1);
    vm.query(null, null, null, 2);

    /**
     * 重置
     */
    vm.reset = function () {
      vm.queryLicenseId = null;
      vm.initDate();
    };

    /**
     * 超速报警实时监控
     * @type {WebSocket}
       */
    var wsSpeedAlert = new WebSocket("ws://139.196.153.4:8080/webSocketServer/speedAlertRealTimeMonitor");
    wsSpeedAlert.onmessage = function (evt) {
      if(evt.data == "1") {
        Notification.success("开启成功,请打开图表");
        vm.speedAlertMonitor = true;
      } else if (evt.data == "0") {
        Notification.warning("超速报警实时监控关闭成功");
        vm.speedAlertMonitor = false;
      } else {
        var obj = JSON.parse(evt.data);
        var data = {
          x: obj.locateDateTime,
          y: obj.gpsSpeed*0.01,
          licenseId: obj.licenseId,
          deviceNum: obj.deviceNum
        };
        vm.speedAlertList.push(data);
        vm.overSpeedCharts();
      }
    };

    /**
     * 开启超速报警实时监控
     */
    vm.speedAlertReload = function () {
      wsSpeedAlert.send(JSON.stringify({
        type: 1,
        content:vm.operatorInfo.authtoken
      }));
    };

    /**
     * 关闭超速报警实时监控
     * @param evt
       */
    vm.speedAlertClose = function (evt) {
      wsSpeedAlert.send(JSON.stringify({
        type: 0,
        content:vm.operatorInfo.authtoken
      }));
    };

    wsSpeedAlert.onerror = function (evt) {
      console.log("wsSpeedAlert WebSocketError!");
    };

    /**
     * 空档滑行实时监控
     * @type {WebSocket}
       */
    var wsNeutralSlide = new WebSocket("ws://139.196.153.4:8080/webSocketServer/neutralSlideRealTimeMonitor");
    wsNeutralSlide.onmessage = function (evt) {
      if(evt.data == "1") {
        Notification.success("开启成功,请打开图表");
        vm.neutralSlideMonitor = true;
      } else if (evt.data == "0") {
        Notification.warning("空档滑行实时监控关闭成功");
        vm.neutralSlideMonitor = false;
      } else {
        var obj = JSON.parse(evt.data);
        var data = {
          x: obj.locateDateTime,
          y: obj.gpsSpeed*0.01,
          licenseId: obj.licenseId,
          deviceNum: obj.deviceNum,
          engineRotate: obj.engineRotate
        };
        vm.neutralSlideList.push(data);
        vm.neutralSlideCharts();
      }
      $scope.$apply();
    };

    /**
     * 开启空档滑行实时监控
     */
    vm.neutralSlideReload = function () {
      wsNeutralSlide.send(JSON.stringify({
        type: 1,
        content:vm.operatorInfo.authtoken
      }));
    };

    /**
     * 关闭空档滑行实时监控
     * @param evt
       */
    vm.neutralSlideClose = function (evt) {
      wsNeutralSlide.send(JSON.stringify({
        type: 0,
        content:vm.operatorInfo.authtoken
      }));
    };

    wsNeutralSlide.onerror = function (evt) {
      console.log("NeutralSlide WebSocketError!");
    };


    /**
     * 关闭当前页面, 停止实时监控
     */
    $scope.$on("$destroy",function () {
      wsSpeedAlert.close();
      wsNeutralSlide.close();
    });


    vm.overSpeedConfig = {
      title: {
        text:'超速报警实时监控'
      }
    };

    vm.neutralSlideConfig = {
      title: {
        text:'空档滑行实时监控'
      }
    };

    /**
     * 超速时间监控图
     */
    vm.overSpeedCharts = function () {
      Highcharts.setOptions({
        // 所有语言文字相关配置都设置在 lang 里
        lang: {
          resetZoom: '重置',
          resetZoomTitle: '重置缩放比例'
        }
      });
      vm.overSpeedConfig = {
        options: {
          chart: {
            type: 'scatter',
            zoomType: 'xy',
            // width: 840
            height: 420
          },
          plotOptions: {
            scatter: {
              marker: {
                radius: 5,
                states: {
                  hover: {
                    enabled: true,
                    lineColor: 'rgb(100,100,100)'
                  }
                }
              },
              states: {
                hover: {
                  marker: {
                    enabled: false
                  }
                }
              },
              tooltip: {
                headerFormat: '<b style="color: red;font-size: 14px;">超速报警</b><br/><br/>',
                shared: true,
                pointFormatter: function () {
                  var datefmt = new Date(this.x);
                  return '<b>设备号: </b>' + this.deviceNum + '<br/><b>整车编号: </b>' + this.licenseId
                    + '<br/><b>速度: </b>' + this.y + 'KM/H<br/><b>日期: </b>' + $filter('date')(datefmt, 'yyyy-MM-dd HH:mm:ss');
                }
              }
            },
            line: {
              dataLabels: {
                enabled: true
              },
              enableMouseTracking: true
            },
            series: {
              cursor: "pointer"
            }
          },
          legend: { // 图例
            enabled: false
          }
        },
        //时间转为string格式显示处理
        xAxis: {
          title: {
            enabled: true,
            text: '日期'
          },
          showLastLabel: true,
          type: 'datetime',
          labels: {
            formatter: function () {
              return $filter('date')(new Date(this.value), 'yyyy-MM-dd HH:mm:ss');
            }
          }
        },
        yAxis: {
          title: {
            text: '速度(KM/H)'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true,
          type: 'linear',
          labels: {
            formatter: function () {
              return this.value;
            }
          }
        },
        series: [{
          color: 'rgba(205, 51, 51, .5)',
          turboThreshold: 100000,
          data: vm.speedAlertList
        }],
        title: {
          text:'超速报警实时监控'
        },
        credits: { // 版权信息
          enabled:false
        }
      };
    };

    /**
     * 空档滑行监控图
     */
    vm.neutralSlideCharts = function () {
      Highcharts.setOptions({
        // 所有语言文字相关配置都设置在 lang 里
        lang: {
          resetZoom: '重置',
          resetZoomTitle: '重置缩放比例'
        }
      });
      vm.neutralSlideConfig = {
        options: {
          chart: {
            type: 'scatter',
            zoomType: 'xy',
            // width: 840
            height: 420
          },
          plotOptions: {
            scatter: {
              marker: {
                radius: 5,
                states: {
                  hover: {
                    enabled: true,
                    lineColor: 'rgb(100,100,100)'
                  }
                }
              },
              states: {
                hover: {
                  marker: {
                    enabled: false
                  }
                }
              },
              tooltip: {
                headerFormat: '<b style="color: red;font-size: 14px;">空档滑行</b><br/><br/>',
                shared: true,
                pointFormatter: function () {
                  var datefmt = new Date(this.x);
                  return '<b>设备号: </b>' + this.deviceNum + '<br/><b>整车编号: </b>' + this.licenseId
                    + '<br/><b>速度: </b>' + this.y + 'KM/H<br/><b>发动机转速: </b>' + this.engineRotate
                    + 'rpm<br><b>日期: </b>' + $filter('date')(datefmt, 'yyyy-MM-dd HH:mm:ss');
                }
              }
            },
            line: {
              dataLabels: {
                enabled: true
              },
              enableMouseTracking: true
            },
            series: {
              cursor: "pointer"
            }
          },
          legend: { // 图例
            enabled: false
          }
        },
        //时间转为string格式显示处理
        xAxis: {
          title: {
            enabled: true,
            text: '日期'
          },
          showLastLabel: true,
          type: 'datetime',
          labels: {
            formatter: function () {
              return $filter('date')(new Date(this.value), 'yyyy-MM-dd HH:mm:ss');
            }
          }
        },
        yAxis: {
          title: {
            text: '速度(KM/H)'
          },
          startOnTick: true,
          endOnTick: true,
          showLastLabel: true,
          type: 'linear',
          labels: {
            formatter: function () {
              return this.value;
            }
          }
        },
        series: [{
          color: 'rgba(205, 51, 51, .5)',
          turboThreshold: 100000,
          data: vm.neutralSlideList
        }],
        title: {
          text:'空档滑行实时监控'
        },
        credits: { // 版权信息
          enabled:false
        }
      };
    };

    vm.overSpeedCharts();
    vm.neutralSlideCharts();
  }
})();
