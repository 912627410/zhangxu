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
  function utilizationController($rootScope, $scope,$timeout, UTILIZATION_URL, Notification, serviceResource, $filter) {
    var vm = this;

    vm.balanceLine = 62.5;
    vm.limitLine = 50;
    //year
    var curYear = new Date();
    curYear.setMonth(0);
    curYear.setDate(1);

    //初始化图表
    vm.centerMap = echarts.init(document.getElementById("centerMap"));
    vm.bottomLine = echarts.init(document.getElementById("bottomMap"));
    vm.mapExport = document.getElementById("mapExport");
    vm.lineExport = document.getElementById("lineExport");
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
      vm.balanceLine = 62.5;
      vm.limitLine = 50;
      vm.machineType = "装载机";
      vm.dateType = "1";
      vm.dateOpenStatus = false;
      vm.queryDate = new Date();
      vm.queryDate.setTime(vm.queryDate.getTime() - 24 * 60 * 60 * 1000);
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
            + '活跃设备开工率：' + value1 + '% <br />'
            + '闲置率：' + value2 + '% <br />';
        }
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        bottom: 20,
        right: 20,
        itemGap: 30,
        feature: {
          myTool: {
            show: true,
            title: '导出数据',
            icon: 'path://M768 102.4v307.2c0 34.816-26.624 61.44-61.44 61.44h-389.12c-34.816 0-61.44-26.624-61.44-61.44v-307.2h-92.16c-34.816 0-61.44 26.624-61.44 61.44V870.4c0 34.816 26.624 61.44 61.44 61.44h706.56c34.816 0 61.44-26.624 61.44-61.44v-104.448c0-12.288 8.192-20.48 20.48-20.48s20.48 8.192 20.48 20.48v104.448c0 57.344-45.056 102.4-102.4 102.4H163.84c-57.344 0-102.4-45.056-102.4-102.4v-706.56c0-57.344 45.056-102.4 102.4-102.4h706.56c57.344 0 102.4 45.056 102.4 102.4v417.792c0 12.288-8.192 20.48-20.48 20.48s-20.48-8.192-20.48-20.48v-417.792c0-34.816-26.624-61.44-61.44-61.44h-102.4z m-471.04 0v307.2c0 10.24 8.192 20.48 20.48 20.48h389.12c10.24 0 20.48-8.192 20.48-20.48v-307.2h-430.08z m301.056 92.16c0-12.288 8.192-20.48 20.48-20.48s20.48 8.192 20.48 20.48v122.88c0 12.288-8.192 20.48-20.48 20.48s-20.48-8.192-20.48-20.48v-122.88z',
            onclick: function (){
              vm.mapExport.click();
            }
          },
          saveAsImage: {show: true}
        },
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
        //color: ['orangered', 'yellow', 'lightskyblue'],
        text: ['高', '低'],
        dimension: 0

      },
      grid: {
        right: 40,
        top: 30,
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
              show: true,
              formatter: function(params){
                if (params.name.indexOf("黑龙江") >= 0) {
                  return params.name.substr(0, 3);
                } else {
                  return params.name.substr(0, 2);
                }
              }
            }
          },
          data: []
        },
        {
          name: '广义开工率',
          z: 1,
          type: 'bar',
          data: [],
          itemStyle: {
            normal: {
            },
            emphasis: {
              color: 'rgb(255,223,51)',
              borderWidth: 0
            }
          },
        }
      ]
    };


    //曲线图配置
    vm.lineOption = {
      title: {
        text: '日开工率跟踪',
        left: '35%',
        subtext: '',
        subtextStyle: {
          align: 'center'
        }
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['活跃设备开工率', '广义开工率', '闲置率'],
        bottom: 'top',
        show: true
      },
      grid: {
        left: '2%',
        right: '7%',
        //bottom: '3%',
        containLabel: true
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        // top: 'bottom',
        bottom: 80,
        right: 10,
        itemGap: 30,
        feature: {
          myTool: {
            show: true,
            title: '导出数据',
            icon: 'path://M768 102.4v307.2c0 34.816-26.624 61.44-61.44 61.44h-389.12c-34.816 0-61.44-26.624-61.44-61.44v-307.2h-92.16c-34.816 0-61.44 26.624-61.44 61.44V870.4c0 34.816 26.624 61.44 61.44 61.44h706.56c34.816 0 61.44-26.624 61.44-61.44v-104.448c0-12.288 8.192-20.48 20.48-20.48s20.48 8.192 20.48 20.48v104.448c0 57.344-45.056 102.4-102.4 102.4H163.84c-57.344 0-102.4-45.056-102.4-102.4v-706.56c0-57.344 45.056-102.4 102.4-102.4h706.56c57.344 0 102.4 45.056 102.4 102.4v417.792c0 12.288-8.192 20.48-20.48 20.48s-20.48-8.192-20.48-20.48v-417.792c0-34.816-26.624-61.44-61.44-61.44h-102.4z m-471.04 0v307.2c0 10.24 8.192 20.48 20.48 20.48h389.12c10.24 0 20.48-8.192 20.48-20.48v-307.2h-430.08z m301.056 92.16c0-12.288 8.192-20.48 20.48-20.48s20.48 8.192 20.48 20.48v122.88c0 12.288-8.192 20.48-20.48 20.48s-20.48-8.192-20.48-20.48v-122.88z',
            onclick: function (){
              vm.lineExport.click();
            }
          },
          //dataView: {show: true},
          saveAsImage: {show: true},
          magicType: {
            show: true,
            type: ['line', 'bar']
          }
        }
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
          name: '活跃设备开工率',
          type: 'line',
          stack: '活跃设备开工率',
          showSymbol: false,
          smooth: true,
          smoothMonotone: 'x',
          data: [],
          markLine:{
            data:[
              { name: '盈亏平衡线',
                yAxis: vm.balanceLine,
                itemStyle: {
                  normal: {
                    color: 'blue'
                  }
                }
              },
              { name: '预期风险预警线',
                yAxis: vm.limitLine,
                itemStyle: {
                  normal: {
                    color: 'red'
                  }
                }
              }
            ]
          }
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

        vm.mapOption.series[0].data = [];
        vm.mapOption.series[1].data = [];
        vm.mapOption.yAxis[0].data = [];
        vm.china = {
          province: '全国',
          broadUtilizationRate: 0,
          narrowUtilizationRate: 0,
          idleRate: 0
        };

        if (data.content == null || data.content.length == 0 || data.content == []) {

        }else{
          var dataList = _.sortBy(data.content, "broadUtilizationRate");
          var maxRate = _.max(data.content, function (value) {
            return value.broadUtilizationRate;
          });
          vm.mapOption.visualMap.max = maxRate.broadUtilizationRate;

          angular.forEach(dataList, function (value, key) {
            if (value.province == '全国') {
              vm.china = value;

            } else {
              var data = {
                name: value.province,
                value: value.broadUtilizationRate,
                value1: value.narrowUtilizationRate,
                value2: value.idleRate
              };
              vm.mapOption.series[0].data.push(data);
              vm.mapOption.series[1].data.push(data);
              if (value.province.indexOf("黑龙江") >= 0) {
                vm.mapOption.yAxis[0].data.push(value.province.substring(0,3));
              } else {
                vm.mapOption.yAxis[0].data.push(value.province.substring(0,2));
              }

            }
          });
        }
        vm.centerMap.setOption(vm.mapOption);

        //点击省份查询对应省份的折线图
        vm.centerMap.on('click', function (params) {
          vm.queryForLine(params.data.name);
        });

      }, function (reason) {
        vm.errorMsg = reason.data.message;
        Notification.error(reason.data.message);
      });
    };

    vm.queryForLine = function (province) {

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
      restCallURL += "&province=" + province;

      var restPromise = serviceResource.restCallService(restCallURL, "GET");
      restPromise.then(function (data) {

        vm.lineOption.title.subtext = province;
        vm.lineOption.xAxis.data = [];
        vm.lineOption.series[0].data = [];
        vm.lineOption.series[1].data = [];
        vm.lineOption.series[2].data = [];

        if (data.content == null || data.content.length == 0 || data.content == []) {

        }else{
          vm.lineDataList = _.sortBy(data.content, "cDate");
          angular.forEach(vm.lineDataList, function (value, key) {
            vm.lineOption.xAxis.data.push(value.cDate);
            vm.lineOption.series[0].data.push(value.narrowUtilizationRate);
            vm.lineOption.series[1].data.push(value.broadUtilizationRate);
            vm.lineOption.series[2].data.push(value.idleRate);
          });

        }

        vm.bottomLine.setOption(vm.lineOption);

      }, function (reason) {
        vm.errorMsg = reason.data.message;
        Notification.error(reason.data.message);
      });

    };

    vm.balanceLineChange = function(){
      vm.lineOption.series[0].markLine.data[0].yAxis = vm.balanceLine;
      $timeout(function () {
        vm.bottomLine.setOption(vm.lineOption);
      }, 500);
    };

    vm.limitLineChange = function(){
      vm.lineOption.series[0].markLine.data[1].yAxis = vm.limitLine;
      $timeout(function () {
        vm.bottomLine.setOption(vm.lineOption);
      }, 500);
    };

    vm.query = function () {
      vm.queryForMap();
      vm.queryForLine('全国');
    };

    vm.reset();
    vm.query();
  }
})();

