/**
 * Created by fengxiaopeng on 2018-1-5.
 * 临工大数据项目-开工率与闲置率分布图
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('utilizationController', utilizationController);

  /** @ngInject */
  function utilizationController($rootScope, $scope, UTILIZATION_URL, Notification, serviceResource, $filter) {
    var vm = this;


    //year
    var curYear = new Date();
    curYear.setMonth(0);
    curYear.setDate(1);

    //初始化图表
    vm.centerMap = echarts.init(document.getElementById("centerMap"));
    vm.bottomLine = echarts.init(document.getElementById("bottomMap"));

    //选择日期类型
    vm.changeDateType = function (dateType) {
      var mode = 'day';
      var dateFormat = "yyyy-MM-dd";
      if (dateType == 30) {
        mode = 'month';
        dateFormat = 'yyyy-MM';
      } else if (dateType == 365) {
        mode = 'year';
        dateFormat = 'yyyy'
      } else if (dateType == 90) {

        var today = new Date();
        var quarterNum = Math.floor(today.getMonth() / 3);
        vm.queryDate = vm.quarterList[quarterNum].quarterValue;

        dateFormat = 'yyyy-MM';
      }

      vm.dateOptions = {
        formatYear: 'yyyy',
        startingDay: 1,
        minMode: mode,
        maxMode: mode,
        yearRows: 1,
        yearColumns: 5
      };
      vm.dateFormat = dateFormat;
    };

    //打开关闭datePick
    vm.datePickerOnClick = function () {
      vm.dateOpenStatus = true;
    };

    //初始化配置/重置
    vm.reset = function () {
      vm.machineType = "装载机";
      vm.dateType = 1;
      vm.dateOpenStatus = false;
      vm.queryDate = new Date();
      vm.changeDateType(vm.dateType);
      //三年之内的季度列表
      vm.quarterList = [];
      for (var j = 0; j < 4; j++) {
        var iDate = new Date(curYear.getTime());
        //iDate.setFullYear(curYear.getFullYear() + i);
        iDate.setMonth(j * 3);
        vm.quarterList.push({
          quarterName: iDate.getFullYear() + "年第" + (j + 1) + "季度",
          quarterValue: iDate
        });

      }


    };

    //地图配置
    vm.mapOption = {
      title: {
        text: '开工率与闲置率',
        textStyle: {
          fontSize: 26
        },
        subtextStyle: {
          fontSize: 17
        },
        left: '32%'
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(219,219,216,0.8)',
        textStyle: {
          color: '#333333'
        },
        formatter: function (params) {

          if (angular.isUndefined(params) || angular.isUndefined(params.data)) {
            return;
          }
          var value = angular.isUndefined(params.data.value) ? 0 : params.data.value;
          var value1 = angular.isUndefined(params.data.value1) ? 0 : params.data.value1;
          var value2 = angular.isUndefined(params.data.value2) ? 0 : params.data.value2;

          return params.data.name + '<br />'
            + '广义开工率：' + value + '% <br />'
            + '狭义开工率：' + value1 + '% <br />'
            + '闲置率：' + value2 + '% <br />';
        }
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        bottom: 20,
        right: 20,
        itemGap: 30,

        iconStyle: {
          normal: {
            textPosition: 'left',
            textAlign: 'right'
          },
          emphasis: {
            textPosition: 'left',
            textAlign: 'right',
            color: '#2F4056'
          }
        }
      },
      visualMap: {
        type: 'continuous',
        min: 0,
        max: 100,
        left: 30,
        bottom: 15,
        calculable: true,
        precision: 2,
        color: ['orangered', 'yellow', 'lightskyblue'],
        text: ['高', '低'],
        dimension: 0

      },
      grid: {
        right: 40,
        top: 50,
        width: '22%'
      },
      xAxis: [{
        position: 'top',
        type: 'value',
        boundaryGap: false,
        splitLine: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        }
      }],
      yAxis: [{
        type: 'category',
        data: [],
        axisTick: {
          alignWithLabel: true
        }
      }],
      series: [
        {
          name: '开工率',
          z: 1,
          type: 'map',
          map: 'china',
          left: '15%',
          right: '40%',
          label: {
            normal: {
              show: true
            },
            emphasis: {
              show: true
            }
          },
          data: []
        },
        {
          name: '广义开工率',
          z: 1,
          type: 'bar',
          label: {
            normal: {
              show: true
            },
            emphasis: {
              show: true
            }
          },
          data: []
        }
      ]
    };

    //曲线图配置
    vm.lineOption = {
      title: {
        text: '日开工率跟踪',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['开工率', '广义开工率', '闲置率'],
        bottom: 'top',
        show: true
      },
      grid: {
        left: '3%',
        right: '4%',
        //bottom: '3%',
        containLabel: true
      },

      xAxis: {
        type: 'category',
        boundaryGap: false,
        interval: 3600 * 24 * 1000,
        data: [],
        axisLabel: {
          formatter: function (value, index) {
            return $filter('date')(new Date(value), 'yyyy-MM-dd');
          }
        }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '开工率',
          type: 'line',
          stack: '开工率',
          showSymbol: false,
          smooth: true,
          smoothMonotone: 'x',
          data: []
        },
        {
          name: '广义开工率',
          type: 'line',
          stack: '广义开工率',
          showSymbol: false,
          smooth: true,
          smoothMonotone: 'x',
          data: []
        },
        {
          name: '闲置率',
          type: 'line',
          stack: '闲置率',
          showSymbol: false,
          smooth: true,
          smoothMonotone: 'x',
          data: []
        }
      ]
    };


    vm.queryForMap = function () {
      var restCallURL = UTILIZATION_URL;
      restCallURL += "/area/";
      restCallURL += "?dateType=" + vm.dateType;
      restCallURL += "&queryDate=" + $filter('date')(vm.queryDate, vm.dateFormat);
      restCallURL += "&machineType=" + vm.machineType;
      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {
        if (data.content == null || data.content.length == 0 || data.content == []) {
          Notification.warning("未查询到数据");
          return;
        }
        var dataList = _.sortBy(data.content, "broadUtilizationRate");
        var maxRate = _.max(data.content, function (value) {
          return value.broadUtilizationRate;
        });

        vm.mapOption.series[0].data = [];
        vm.mapOption.series[1].data = [];
        vm.mapOption.yAxis[0].data = [];
        vm.mapOption.visualMap.max = maxRate.broadUtilizationRate;

        angular.forEach(dataList, function (value, key) {
          if (value.province == '全国') {

          } else {
            var data = {
              name: value.province,
              value: value.broadUtilizationRate,
              value1: value.narrowUtilizationRate,
              value2: value.idleRate
            };
            vm.mapOption.series[0].data.push(data);
            vm.mapOption.series[1].data.push(data);
            vm.mapOption.yAxis[0].data.push(value.province.substring(0, 2));
          }
        });
        vm.centerMap.setOption(vm.mapOption);

      }, function (reason) {
        vm.errorMsg = reason.data.message;
        Notification.error(reason.data.message);
      });
    };

    vm.queryForLine = function () {

      var dateType = vm.dateType;
      var queryDate = angular.copy(vm.queryDate);

      //当月第一天
      var beginDate = queryDate;
      beginDate.setDate(1);
      var endDate = new Date(beginDate.getTime());
      //日、月、当月最后一天
      endDate.setMonth(beginDate.getMonth() + 1);

      //季度、、当季度最后一天
      if (vm.dateType == 90) {
        dateType = 1;
        endDate.setMonth(beginDate.getMonth() + 3);
      }

      //年、、当年最后一天
      if (vm.dateType == 365) {
        dateType = 1;
        beginDate.setMonth(0)
        endDate.setMonth(0);
        endDate.setFullYear(beginDate.getFullYear() + 1);
      }
      endDate.setDate(0);


      var restCallURL = UTILIZATION_URL;
      restCallURL += "/date/";
      restCallURL += "?dateType=" + dateType;
      restCallURL += "&beginDate=" + $filter('date')(beginDate, 'yyyy-MM-dd');
      restCallURL += "&endDate=" + $filter('date')(endDate, 'yyyy-MM-dd');
      restCallURL += "&machineType=" + vm.machineType;

      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {
        if (data.content == null || data.content.length == 0 || data.content == []) {
          Notification.warning("未查询到数据");
          return;
        }
        var dataList = _.sortBy(data.content, "cDate");
        vm.lineOption.xAxis.data = [];
        vm.lineOption.series[0].data = [];
        vm.lineOption.series[1].data = [];
        vm.lineOption.series[2].data = [];

        angular.forEach(dataList, function (value, key) {
          vm.lineOption.xAxis.data.push(value.cDate);
          vm.lineOption.series[0].data.push(value.narrowUtilizationRate);
          vm.lineOption.series[1].data.push(value.broadUtilizationRate);
          vm.lineOption.series[2].data.push(value.idleRate);
        });

        vm.bottomLine.setOption(vm.lineOption);

      }, function (reason) {
        vm.errorMsg = reason.data.message;
        Notification.error(reason.data.message);
      });

    };

    vm.query = function () {
      vm.queryForMap();
      vm.queryForLine();
    };

    vm.reset();
    vm.query();
  }
})();

