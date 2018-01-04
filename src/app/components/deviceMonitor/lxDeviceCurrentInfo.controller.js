(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .filter('stateConversionFilter', stateConversionFilter)
    .directive('stateFormat', stateFormat)
    .controller('lxDeviceCurrentInfoController', lxDeviceCurrentInfoController);

  function lxDeviceCurrentInfoController($rootScope, $scope, $http, $uibModal, $uibModalInstance, $timeout, $filter, permissions, $translate, languages, treeFactory, NgTableParams, ngTableDefaults, lxDeviceInfo, serviceResource) {
    var vm = this;
    vm.lxDeviceInfo = lxDeviceInfo;
    var date = new Date();
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
     * 地图初始化
     * @param deviceInfo deviceInfo
     */
    vm.initLxMapTab = function (deviceInfo) {
      console.log(deviceInfo)
    };

    /**
     * 刷新当前状态
     * @param id id
     */
    vm.refreshCurrentLxDeviceInfo = function (id) {

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
        serviceResource.refreshMapWithDeviceInfo("lxDeviceDetailMap", deviceInfoList, 5, centerAddress);
      })
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
