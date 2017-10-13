/**
 * Created by mengwei on 17-3-27.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('trackRecordAnalyzeMngController', trackRecordAnalyzeMngController);

  /** @ngInject */
  function trackRecordAnalyzeMngController($rootScope, languages,$scope, $http, $filter) {
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
        text: languages.findKey('singleWorkingHoursDistribution'),
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
          return languages.findKey('vehicleNumber')+':' + params.seriesName


            + '</br>' +languages.findKey('bootTime')+':'+$filter('date')(params.data[0],'yyyy-MM-dd hh:mm:ss')
            + '</br>' +languages.findKey('shutdownTime')+':'+ $filter('date')(params.data[2],'yyyy-MM-dd hh:mm:ss')
            + '</br>' +languages.findKey('workHours')+':'+ params.data[1] + languages.findKey('hour');
        }
      },
      xAxis: {name: languages.findKey('date'), type: 'time', boundaryGap: true},
      yAxis: {name: languages.findKey('workHours')+languages.findKey('hour'), type: 'value', minInterval: 1}
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
        text: languages.findKey('daliyWorkingHoursDistribution'),
        x: 'center',
        y: 0
      },
      tooltip: {
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        },
        formatter: function (params) {
          return languages.findKey('vehicleQuantity') +':'+ params.data +' '+ languages.findKey('perday');
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
      yAxis: {name: languages.findKey('vehicleQuantity')+' '+languages.findKey('perday'), type: 'value', minInterval: 1},
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
          name: languages.findKey('vehicleQuantity'),
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



