/**
 * Created by mengwei on 17-3-25.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('MachineClusteringMngController', MachineClusteringMngController);

  /** @ngInject */
  function MachineClusteringMngController($rootScope, languages,$scope, $http, $filter) {
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

    var rightChart = echarts.init(document.getElementById('rightChart'));
    var rightOption = {
      title: {
        text: '聚类探索散点图'
      },
      tooltip: {
        trigger: "item",
        formatter: function (params) {
          return "工作日期：" + params.data[0] + "<br/>" + "数值:" + params.data[1];
        }
      },
      grid: {
        left: '3%',
        right: '7%',
        bottom: '3%',
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
      legend: {},
      xAxis: [
        {
          name: languages.findKey('date'),
          type: 'time',
          scale: true,
          axisLabel: {
            formatter: '{value}'
          },
          splitLine: {
            show: false
          }
        }
      ],
      yAxis: [
        {
          name: '数值',
          type: 'value',
          scale: true,
          axisLabel: {
            formatter: '{value}'
          },
          splitLine: {
            show: false
          },
          minInterval: 1
        }
      ],
      series: [
        {
          name: '全部',
          type: 'scatter',
          data: [],
          symbolSize: 5,
          itemStyle: {
            normal: {
              color: '#6CA6CD'
            }
          }
        }
      ]
    };
    rightChart.setOption(rightOption);





  }
})();
