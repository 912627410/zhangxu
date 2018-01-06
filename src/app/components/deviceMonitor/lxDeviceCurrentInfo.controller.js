(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .filter('stateConversionFilter', stateConversionFilter)
    .directive('stateFormat', stateFormat)
    .controller('lxDeviceCurrentInfoController', lxDeviceCurrentInfoController);

  function lxDeviceCurrentInfoController($rootScope, $scope, $http, $uibModal, $uibModalInstance, Notification, $timeout, $filter, permissions, $translate, languages, treeFactory, NgTableParams, ngTableDefaults, lxDeviceInfo, serviceResource,
                                         MACHINE_STORAGE_URL, LX_DEVCE_MONITOR_SINGL_QUERY, LX_DEVICE_MONITOR_HISTORY_QUERY) {
    var vm = this;
    vm.lxDeviceInfo = lxDeviceInfo;
    var date = new Date();
    vm.maps = null;
    vm.pageSize = 8;
    date.setDate(date.getDate() - 2);
    vm.endDate = new Date();
    vm.maxDate = new Date();
    vm.startDate = date;
    vm.startDateOpenStatus = {
      opened: false
    };
    vm.endDateOpenStatus = {
      opened: false
    };
    vm.startDateOpen = function ($event) {
      vm.startDateOpenStatus.opened = true;
    };
    vm.endDateOpen = function ($event) {
      vm.endDateOpenStatus.opened = true;
    };
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    /**
     * 刷新当前状态
     * @param id id
     */
    vm.refreshCurrentLxDeviceInfo = function (id) {
      var singleUrl = LX_DEVCE_MONITOR_SINGL_QUERY + "?id=" + id;
      var deviceInfoPromise = serviceResource.restCallService(singleUrl, "GET");
      deviceInfoPromise.then(function (data) {
        if (!!data.content) {
          vm.lxDeviceInfo = data.content;
        }
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    };

    /**
     * 初始化地图
     * @param deviceInfo
     */
    vm.initLxMapTab = function (deviceInfo) {
      $timeout(function () {
        var deviceInfoList = new Array();
        deviceInfoList.push(deviceInfo);
        var centerAddress = [deviceInfo.amaplongitudeNum, deviceInfo.amaplatitudeNum];
        vm.maps = serviceResource.refreshMapWithDeviceInfo("lxDeviceDetailMap", deviceInfoList, 5, centerAddress);
      })
    };

    /**
     * 画出仓库地址
     * @param ids
     */
    vm.drawWarehouse = function (ids) {
      var storageDataURL = MACHINE_STORAGE_URL + "?licenseId=" + ids;
      var storageDataPromise = serviceResource.restCallService(storageDataURL, "GET");
      storageDataPromise.then(function (data) {
        var circle = new AMap.Circle({
          center: new AMap.LngLat(data.storagelongitudeNum, data.storageLatitudeNum),
          radius: 1000,
          strokeColor: "#F33",
          strokeOpacity: 1,
          strokeWeight: 3,
          fillColor: "#ee2200",
          fillOpacity: 0.35
        });
        circle.setMap(vm.maps);
      })
    };


    function getLxData(queryStartDate, queryEndDate, deviceNum, locateStatus, totalElement, page, size, sort) {
      var restCallURL = LX_DEVICE_MONITOR_HISTORY_QUERY;
      //时间参数
      if (!!queryStartDate && !!queryEndDate) {
        //开始时间
        restCallURL += "?startDate=" + $filter('date')(queryStartDate, 'yyyy-MM-dd HH:mm:ss');
        //结束时间
        restCallURL += "&endDate=" + $filter('date')(queryEndDate, 'yyyy-MM-dd HH:mm:ss');
      } else {
        Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
        return;
      }
      if (!!deviceNum) {
        restCallURL += "&deviceNum=" + deviceNum;
      }

      if (!!locateStatus) {
        restCallURL += "&locateStatus=" + locateStatus;
      }

      if (!!totalElement) {
        restCallURL += "&totalElement=" + totalElement;
      }

      var pageUrl = page || 0;
      var sizeUrl = size || vm.pageSize;
      var sortUrl = sort || 'locateDateTime,desc';
      restCallURL += "&page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      return serviceResource.restCallService(restCallURL, "GET");
    }

    /**
     * 获取历史运行信息
     * @param page 当前页
     * @param size 每页多少条数据
     * @param sort 排序
     * @param filter 过滤条件
     * @param totalElement 总数据
     * @param deviceNum 设备号
     * @param queryStartDate 开始时间
     * @param queryEndDate 结束时间
     */
    vm.queryLxHistory = function (page, size, sort, locateStatus, totalElement, deviceNum, queryStartDate, queryEndDate) {
      var rspData = getLxData(queryStartDate, queryEndDate, deviceNum, locateStatus, totalElement, page, size, sort);
      if (!!rspData) {
        rspData.then(function (data) {
          if (!data.content || data.content.length <= 0) {
            Notification.warning("暂无数据！");
            return;
          }
          vm.deviceHistoryRunData = new NgTableParams({}, {dataset: data.content});
          vm.totalElements = data.page.totalElements;
          vm.currentPage = data.page.number + 1;
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
          return;
        });
      }
    };


    /**
     * 获取历史运行信息用于轨迹
     * @param page 当前页
     * @param size 每页多少条数据
     * @param sort 排序
     * @param filter 过滤条件
     * @param totalElement 总数据
     * @param deviceNum 设备号
     * @param queryStartDate 开始时间
     * @param queryEndDate 结束时间
     */
    vm.queryLxHistoryMap = function (page, size, sort, locateStatus, totalElement, deviceNum, queryStartDate, queryEndDate) {
      //查询后vm.dataList 就有数据了
      var rspData = getLxData(queryStartDate, queryEndDate, deviceNum, locateStatus, totalElement, page, size, sort);
      if (!!rspData) {
        rspData.then(function (data) {
          var lineArr = [];
          vm.deviceMapDataList = _.sortBy(data.content, "locateDateTime");
          vm.deviceMapDataList.forEach(function (deviceData) {
            lineArr.push([deviceData.amaplongitudeNum, deviceData.amaplatitudeNum]);
          })
          vm.refreshMapTab(lineArr);
        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
          return;
        });
      }
    };

    /**
     *  车模型,地图按钮监听
     * @param lineAttr
     */
    vm.refreshMapTab = function (lineAttr) {
      var MarkerMovingControl = function (map, marker, path) {
        this._map = map;
        this._marker = marker;
        this._path = path;
        this._currentIndex = 0;
        marker.setMap(map);
        marker.setPosition(path[0]);
      }
      var marker;
      var carPostion = lineAttr[0];
      var map = new AMap.Map("lxDeviceDetailMap", {
        resizeEnable: true,
        zooms: [4, 18]
      });
      vm.maps = map;
      /*工具条，比例尺，预览插件*/
      AMap.plugin(['AMap.Scale', 'AMap.OverView'],
        function () {
          map.addControl(new AMap.ToolBar());
          map.addControl(new AMap.Scale());
          map.addControl(new AMap.OverView({isOpen: true}));
        });
      AMap.plugin(["AMap.RangingTool"], function () {
      });
      //小车
      marker = new AMap.Marker({
        map: map,
        position: carPostion,
        icon: "assets/images/car_03.png",
        offset: new AMap.Pixel(-26, -13),
        autoRotation: true
      });
      marker.setLabel({
        offset: new AMap.Pixel(-10, -25),//修改label相对于maker的位置
        content: "行使了 0 米"
      });
      // 绘制轨迹
      var polyline = new AMap.Polyline({
        map: map,
        path: lineAttr,
        strokeColor: "#00A",  //线颜色
        strokeOpacity: 1,     //线透明度
        strokeWeight: 3,      //线宽
        strokeStyle: "solid"  //线样式
      });
      map.setFitView();
      var markerMovingControl = new MarkerMovingControl(map, marker, lineAttr);
      var startLat = new AMap.LngLat(markerMovingControl._path[0].lng, markerMovingControl._path[0].lat);
      var lastDistabce = 0;
      /*移动完成触发事件*/
      AMap.event.addListener(marker, "movealong", function () {
        markerMovingControl._currentIndex = 0;
      })
      /*每一步移动完成触发事件*/
      AMap.event.addListener(marker, "moveend", function () {
        markerMovingControl._currentIndex++;
        var distances = parseInt(startLat.distance(marker.getPosition()).toString().split('.')[0]);
        lastDistabce += distances;
        marker.setLabel({
          offset: new AMap.Pixel(-10, -25),
          content: "行使了: " + lastDistabce + "&nbsp&nbsp" + "米"
        });
        startLat = new AMap.LngLat(marker.getPosition().lng, marker.getPosition().lat);
      })
      /*小车每一移动一部就会触发事件*/
      AMap.event.addListener(marker, "moving", function () {

      })
      /*开始事件*/
      AMap.event.addDomListener(document.getElementById('start'), 'click', function () {
        lastDistabce = 0;
        marker.setLabel({
          offset: new AMap.Pixel(-10, -25),
          content: "行使了: " + lastDistabce + "&nbsp&nbsp" + "米"
        });
        startLat = new AMap.LngLat(markerMovingControl._path[0].lng, markerMovingControl._path[0].lat);
        markerMovingControl._currentIndex = 0;
        markerMovingControl._marker.moveAlong(lineAttr, 500);
      }, false);
      /*暂停事件*/
      AMap.event.addDomListener(document.getElementById('stop'), 'click', function () {
        markerMovingControl._marker.stopMove();
        var distabcess2 = lastDistabce;
        var distances = parseInt(startLat.distance(markerMovingControl._marker.getPosition()).toString().split('.')[0]);
        distabcess2 += distances;
        marker.setLabel({
          offset: new AMap.Pixel(-10, -25),
          content: "行使了: " + distabcess2 + "&nbsp&nbsp" + "米"
        });
      }, false);
      /*继续移动事件*/
      AMap.event.addDomListener(document.getElementById('move'), 'click', function () {
        var lineArr2 = lineAttr.slice(markerMovingControl._currentIndex + 1)
        lineArr2.unshift(marker.getPosition());
        markerMovingControl._marker.moveAlong(lineArr2, 500);
      }, false);
    };

    /**
     * 关闭设备监控的ui-model
     */
    vm.cancelLxUibModal = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //气压图
    vm.highchartsAir = {
      options: {
        chart: {
          type: 'gauge',
          alignTicks: false,
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
        },

        title: languages.findKey('barometricPressure') + '',
        exporting: {enabled: false},

        pane: {
          center: ['50%', '75%'],
          size: '120%',
          startAngle: -80,
          endAngle: 80,
          background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '20%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },

        tooltip: {
          enabled: true
        },

        yAxis: {
          min: 0,
          max: 98,  //气压表最大98
          lineColor: '#339',
          tickColor: '#339',
          minorTickColor: '#339',
          offset: -10,
          lineWidth: 2,
          labels: {
            distance: -20,
            rotation: 'auto'
          },
          tickLength: 5,
          mitickLength: 5,
          endOnTick: true,
          title: {
            y: 15,
            text: languages.findKey('barometricPressure') + ''
          },
          plotBands: [{
            from: 80,
            to: 98,
            color: '#DF5353' // red
          }]
        },
        credits: {
          enabled: false
        },

        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true
            }
          }
        }
      },
      title: languages.findKey('barometricPressure') + '',
      series: [{
        name: languages.findKey('barometricPressure') + '',
        data: [0],
        dataLabels: {
          format: '<div style="text-align:center;"><span style="line-height:12px;border:none;font-size:12px;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span>' +
          '</div>',
          inside: false,
          borderWidth: 0,
          x: 0,
          y: 50
        },
        tooltip: {
          valueSuffix: null
        }
      }],

      loading: false,
      func: function (chart) {
        $timeout(function () {
          chart.reflow();
        }, 0);
      }
    };
    //转速图
    vm.highchartsRpm = {
      options: {
        chart: {
          type: 'gauge',
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
        },
        exporting: {enabled: false},
        pane: {
          startAngle: -150,
          endAngle: 150,
          background: [{
            backgroundColor: {
              linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
              stops: [
                [0, '#FFF'],
                [1, '#333']
              ]
            },
            borderWidth: 0,
            outerRadius: '109%'
          }, {
            backgroundColor: {
              linearGradient: {x1: 0, y1: 0, x2: 0, y2: 1},
              stops: [
                [0, '#333'],
                [1, '#FFF']
              ]
            },
            borderWidth: 1,
            outerRadius: '107%'
          }, {
            // default background
          }, {
            backgroundColor: '#DDD',
            borderWidth: 0,
            outerRadius: '105%',
            innerRadius: '103%'
          }]
        },

        tooltip: {
          enabled: true
        },

        yAxis: {
          min: 0,
          max: 3000,

          minorTickInterval: 'auto',
          minorTickWidth: 1,
          minorTickLength: 10,
          minorTickPosition: 'inside',
          minorTickColor: '#666',

          tickPixelInterval: 30,
          tickWidth: 2,
          tickPosition: 'inside',
          tickLength: 10,
          tickColor: '#666',
          labels: {
            step: 2,
            rotation: 'auto'
          },
          title: {
            text: languages.findKey('rotatingSpeed'),
            y: 15
          },
          plotBands: [{
            from: 0,
            to: 600,
            color: '#55BF3B' // green
          }, {
            from: 600,
            to: 2400,
            color: '#DDDF0D' // yellow
          }, {
            from: 2400,
            to: 3000,
            color: '#DF5353' // red
          }]
        },

        credits: {
          enabled: false
        },

        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true
            }
          }
        }
      },
      title: {
        text: null
      },
      series: [{
        name: languages.findKey('rotatingSpeed') + '',
        data: [0],
        tooltip: {
          valueSuffix: languages.findKey('turn') + ''
        }
      }],

      loading: false,
      func: function (chart) {
        $timeout(function () {
          chart.reflow();
        }, 0);
      }
    };
    //油位图
    vm.highchartsOil = {
      options: {
        chart: {
          type: 'gauge',
          alignTicks: false,
          plotBackgroundColor: null,
          plotBackgroundImage: null,
          plotBorderWidth: 0,
          plotShadow: false
        },
        exporting: {enabled: false},
        title: languages.findKey('Oil') + '',

        pane: {
          center: ['50%', '75%'],
          size: '120%',
          startAngle: -80,
          endAngle: 80,
          background: {
            backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
            innerRadius: '20%',
            outerRadius: '100%',
            shape: 'arc'
          }
        },

        tooltip: {
          enabled: false
        },

        // the value axis
        yAxis: {
          min: 0,
          max: 100,
          title: {
            y: 15,
            text: languages.findKey('Oil') + ''
          },
          plotBands: [{
            from: 0,
            to: 12.5,
            color: '#DF5353' // red
          }],
          lineColor: '#339',
          tickColor: '#339',
          minorTickColor: '#339',
          offset: -10,
          lineWidth: 2,
          labels: {
            distance: -15,
            rotation: 'auto'
          },
          tickLength: 5,
          minorTickLength: 5,
          endOnTick: false,

        },

        credits: {
          enabled: false
        },

        plotOptions: {
          solidgauge: {
            dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true
            }
          }
        }
      },
      title: languages.findKey('Oil') + '',
      series: [{
        name: languages.findKey('Oil') + '',
        data: [0],
        dataLabels: {
          format: '<div style="text-align:center"><span style="font-size:12px;line-height:12px;border:none;color:' +
          ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}%</span>' + '</div>',
          inside: false,
          borderWidth: 0,
          x: 0,
          y: 50
        },
        tooltip: {
          valueSuffix: '%'
        }
      }],

      loading: false,
      func: function (chart) {
        $timeout(function () {
          chart.reflow();
        }, 0);
      }
    };
  }

  /**
   * 状态描述转换filter
   * @returns {Function}
   */
  function stateConversionFilter() {
    return function (value, formatJson) {
      if (value == null || value == undefined) {
        return "无数据";
      }
      var jsonObj = JSON.parse(formatJson);
      var result = jsonObj[value];
      if (result == null || result == undefined) {
        return "无数据";
      }
      return result;
    }
  }

  /**
   * 根据状态量展示不同的style
   */
  function stateFormat() {
    return {
      restrict: 'A',
      scope: {
        stateValue: '@',
        stateStyle: '='
      },
      link: function (scope, element, attrs) {
        if (!!scope.stateValue) {
          element.addClass(scope.stateStyle[scope.stateValue]);
        } else {
          //无数据style

        }
      }
    }
  }

})();
