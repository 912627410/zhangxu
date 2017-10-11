/**
 * Created by mengwei on 17-3-27.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('trackRecordAnalyzeMngController', trackRecordAnalyzeMngController);

  /** @ngInject */
  function trackRecordAnalyzeMngController($rootScope, $scope, $http, $filter) {
    var vm = this;

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);
    vm.startDate = startDate;
    vm.endDate = new Date();

    vm.startDateDeviceData = startDate;
    vm.endDateDeviceData = new Date();

    //date picker
    vm.startDateOpenStatusDeviceData = {
      opened: false
    };
    vm.endDateOpenStatusDeviceData = {
      opened: false
    };

    vm.startDateOpenDeviceData = function ($event) {
      vm.startDateOpenStatusDeviceData.opened = true;
    };
    vm.endDateOpenDeviceData = function ($event) {
      vm.endDateOpenStatusDeviceData.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    var scatterOption1 = {
      title: {
        text: '车辆单次工作时长分布',
        x: 'center',
        y: 0
      },
      grid: {
        left: 60,
        right: '4%',
        bottom: '3%',
        width: '70%',
        containLabel: true
      },
      toolbox: {
        feature: {
          dataZoom: {},
          brush: {
            type: []
          },
          restore: {show: true},
          saveAsImage: {show: true}
        },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      tooltip: {
        formatter: function (params) {
          return '车辆编号: ' + params.seriesName


            + '</br>开机时间: ' +  $filter('date')(params.data[0],'yyyy-MM-dd hh:mm:ss')
            + '</br>关机时间: ' + $filter('date')(params.data[2],'yyyy-MM-dd hh:mm:ss')
            + '</br>工作时长: ' + params.data[1] + '小时';
        }
      },
      xAxis: {name: languages.findKey('date'), type: 'time', boundaryGap: true},
      yAxis: {name: '工作时长(小时)', type: 'value', minInterval: 1}
    };
    var scatterChart1 = echarts.init(document.getElementById('scatterChart1'));

    var scatter1Data = {
      "VLG00953AF0602976": [
      [
        1483353622000,
        5.3,
        1483372808000
      ],
      [
        1483372960000,
        6.2,
        1483375949000
      ],
      [
        1483403416000,
        2.7,
        1483413386000
      ]
    ]
    }

    function renderScatter1() {


        var seriesData = [];
        angular.forEach(scatter1Data, function (value, key) {
          seriesData.push({
            name: key,
            type: 'scatter',
            data: value,
            symbolSize: 6
          });
        });

        scatterChart1.setOption(scatterOption1, true);
        scatterChart1.setOption({series: seriesData});
    }
    renderScatter1();

    var barChartOption = {
      title: {
        text: '车辆每日工作时长分布',
        x: 'center',
        y: 0
      },
      tooltip: {
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        },
        formatter: function (params) {
          return '车辆数量: ' + params.data + '台天';
        }
      },
      toolbox: {
        right: 30,
        feature: {
          dataZoom: {},
          brush: {
            type: []
          },
          restore: {show: true},
          saveAsImage: {show: true}
        },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      grid: {
        left: 60,
        right: '4%',
        bottom: '3%',
        width: '70%',
        containLabel: true
      },
      xAxis: {
        name: languages.findKey('workHours'),
        type: 'category',
        data: ['0-2h', '2-4h', '4-6h', '6-8h', '8-10h', '10-12h', '12-14h', '14-16h', '16-18h', '18-20h', '20-22h', '22-24h'],
        axisTick: {alignWithLabel: true}
      },
      yAxis: {name: '车辆数量(台天)', type: 'value', minInterval: 1},
      series: []
    };
    var barChart = echarts.init(document.getElementById('barChart'));

    var barData = [6,2,6,9,3,4,3,10,2,1,1,0]

    function renderBarChart() {

        if (!barData) {
          return false;
        }

        var seriesData = [];
        seriesData.push({
          name: '车辆数量',
          type: 'bar',
          barWidth: '60%',
          data: barData
        });

        barChart.setOption(barChartOption, true);
        barChart.setOption({series: seriesData});
    }
    renderBarChart();


  }
})();



