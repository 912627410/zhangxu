/**
 * Created by mengwei on 17-3-10.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('barDistributionMngController', barDistributionMngController);

  /** @ngInject */
  function barDistributionMngController($rootScope, $scope, $http, $filter) {
    var vm = this;
    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };
    vm.statisticalStatusData = {
      opened: false
    };
    vm.statisticalData = function ($event) {
      vm.statisticalStatusData.opened = true;
    };



    var mapChart = echarts.init(document.getElementById('area-container'));
    var areaOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer : {
          type : 'shadow'
        },
        backgroundColor: 'rgba(219,219,216,0.8)',
        textStyle: {
          color: '#333333'
        }
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        top: 'center',
        right: 20,
        itemGap: 30,
        feature: {
          restore: {show: true},
          saveAsImage: {show: true}
        },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      legend: {
        data:["NO.1","NO.2","NO.3","NO.4","NO.5","其他"]
      },
      grid: {
        left: '3%',
        right: 80,
        bottom: '3%',
        borderColor: '#e6e6e6',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        splitLine: {
          show: false
        },
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        nameTextStyle: {
          color: '#666666'
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#666666'
          },
          interval: 0,
          rotate: 45
        },
        triggerEvent: true,
        data: [ "山东",
          "河北",
          "云南",
          "山西",
          "河南",
          "安徽",
          "西藏",
          "贵州",
          "广东",
          "内蒙古",
          "江西",
          "湖北",
          "辽宁",
          "江苏",
          "湖南",
          "四川",
          "陕西",
          "甘肃",
          "广西",
          "福建",
          "浙江",
          "吉林",
          "黑龙江",
          "海南",
          "北京",
          "宁夏",
          "重庆",
          "青海",
          "天津",
          "新疆",
          "上海",
          "澳门",
          "香港",
          "台湾"]
      },
      yAxis: {
        name: '车辆数量(台)',
        boundaryGap: ['0%', '10%'],
        minInterval: 1,
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#666666'
          }
        },
        nameTextStyle: {
          color: '#666666'
        },
        data: []
      },
      series:[{
        name: 'NO.1',
        type: 'bar',
        stack: '总量',
        barMaxWidth: '30',
        data: [
          {
            name: "L955",
            value: 277
          }, {
            name: "L955",
            value: 368
          }, {
            name: "L953",
            value: 151
          }, {
            name: "L953",
            value: 205
          }, {
            name: "L953",
            value: 165
          }, {
            name: "L955",
            value: 136
          }, {
            name: "L956",
            value: 127
          }, {
            name: "L955",
            value: 109
          }, {
            name: "L953",
            value: 46
          }, {
            name: "L953",
            value: 81
          }, {
            name: "L952",
            value: 80
          }, {
            name: "L952",
            value: 41
          }, {
            name: "L955",
            value: 45
          }, {
            name: "L955",
            value: 44
          }, {
            name: "L955",
            value: 60
          }, {
            name: "L953",
            value: 32
          }, {
            name: "L955",
            value: 41
          }, {
            name: "L955",
            value: 57
          }, {
            name: "L955",
            value: 47
          }, {
            name: "L952",
            value: 49
          }, {
            name: "L955",
            value: 30
          }, {
            name: "L955",
            value: 18
          }, {
            name: "L955",
            value: 22
          }, {
            name: "L955",
            value: 22
          }, {
            name: "L953",
            value: 22
          }, {
            name: "L953",
            value: 13
          }, {
            name: "L955",
            value: 18
          }, {
            name: "LG953",
            value: 9
          }, {
            name: "L952",
            value: 7
          }, {
            name: "L953",
            value: 2
          }, {
            name: "L953",
            value: 1
          }
        ]
      }, {
        name: 'NO.2',
        type: 'bar',
        stack: '总量',
        barMaxWidth: '30',
        data: [{name: "L953", value: 221},

          {name: "L953", value: 85},

          {name: "L955", value: 81},

          {name: "L955", value: 108},

          {name: "L955", value: 57},

          {name: "L953", value: 58},

          {name: "L955F", value: 42},

          {name: "L956F", value: 22},

          {name: "L955", value: 37},

          {name: "L955", value: 45},

          {name: "L955", value: 35},

          {name: "L953", value: 35},

          {name: "L953", value: 34},

          {name: "L952", value: 22},

          {name: "L952", value: 24},

          {name: "L955", value: 29},

          {name: "L953", value: 35},

          {name: "L953", value: 13},

          {name: "L956", value: 20},

          {name: "L955", value: 14},

          {name: "L953", value: 14},

          {name: "L956F", value: 14},

          {name: "L953F", value: 6},

          {name: "L952", value: 9},

          {name: "L952", value: 7},

          {name: "L968F", value: 7},

          {name: "L955F", value: 5},

          {name: "L953", value: 7},

          {name: "L955", value: 1},

          {name: "L936", value: 1}]
      },{
        name: 'NO.3',
        type: 'bar',
        stack: '总量',
        barMaxWidth: '30',
        data: [
          {name: "L952", value: 74},

          {name: "L956", value: 26},

          {name: "L956F", value: 66},

          {name: "L952", value: 31},

          {name: "L953F", value: 32},

          {name: "L953F", value: 14},

          {name: "L956F", value: 42},

          {name: "L953F", value: 14},

          {name: "L952", value: 22},

          {name: "L953F", value: 9},

          {name: "L953", value: 20},

          {name: "L955", value: 24},

          {name: "L956", value: 24},

          {name: "L953", value: 22},

          {name: "L953", value: 22},

          {name: "L952", value: 13},

          {name: "L955F", value: 13},

          {name: "LG953", value: 10},

          {name: "L953", value: 9},

          {name: "L953", value: 13},

          {name: "L952", value: 9},

          {name: "L955F", value: 8},

          {name: "L956", value: 6},

          {name: "L956F", value: 8},

          {name: "L955", value: 5},

          {name: "L955", value: 5},

          {name: "L952", value: 2},

          {name: "L955", value: 6},

          0,

          {name: "LG953", value: 1}
        ]
      },{
        name: 'NO.4',
        type: 'bar',
        stack: '总量',
        barMaxWidth: '30',
        data: [
          {name: "L952", value: 74},

          {name: "L956", value: 26},

          {name: "L956F", value: 66},

          {name: "L952", value: 31},

          {name: "L953F", value: 32},

          {name: "L953F", value: 14},

          {name: "L956F", value: 42},

          {name: "L953F", value: 14},

          {name: "L952", value: 22},

          {name: "L953F", value: 9},

          {name: "L953", value: 20},

          {name: "L955", value: 24},

          {name: "L956", value: 24},

          {name: "L953", value: 22},

          {name: "L953", value: 22},

          {name: "L952", value: 13},

          {name: "L955F", value: 13},

          {name: "LG953", value: 10},

          {name: "L953", value: 9},

          {name: "L953", value: 13},

          {name: "L952", value: 9},

          {name: "L955F", value: 8},

          {name: "L956", value: 6},

          {name: "L956F", value: 8},

          {name: "L955", value: 5},

          {name: "L955", value: 5},

          {name: "L952", value: 2},

          {name: "L955", value: 6},

          0,

          {name: "LG953", value: 1}
        ]
      },{
        name: 'NO.5',
        type: 'bar',
        stack: '总量',
        barMaxWidth: '30',
        data: [
          {name: "L952", value: 74},

          {name: "L956", value: 26},

          {name: "L956F", value: 66},

          {name: "L952", value: 31},

          {name: "L953F", value: 32},

          {name: "L953F", value: 14},

          {name: "L956F", value: 42},

          {name: "L953F", value: 14},

          {name: "L952", value: 22},

          {name: "L953F", value: 9},

          {name: "L953", value: 20},

          {name: "L955", value: 24},

          {name: "L956", value: 24},

          {name: "L953", value: 22},

          {name: "L953", value: 22},

          {name: "L952", value: 13},

          {name: "L955F", value: 13},

          {name: "LG953", value: 10},

          {name: "L953", value: 9},

          {name: "L953", value: 13},

          {name: "L952", value: 9},

          {name: "L955F", value: 8},

          {name: "L956", value: 6},

          {name: "L956F", value: 8},

          {name: "L955", value: 5},

          {name: "L955", value: 5},

          {name: "L952", value: 2},

          {name: "L955", value: 6},

          0,

          {name: "LG953", value: 1}
        ]
      },{
        name: '其他',
        type: 'bar',
        stack: '总量',
        barMaxWidth: '30',
        data: [
          {name: "L952", value: 74},

          {name: "L956", value: 26},

          {name: "L956F", value: 66},

          {name: "L952", value: 31},

          {name: "L953F", value: 32},

          {name: "L953F", value: 14},

          {name: "L956F", value: 42},

          {name: "L953F", value: 14},

          {name: "L952", value: 22},

          {name: "L953F", value: 9},

          {name: "L953", value: 20},

          {name: "L955", value: 24},

          {name: "L956", value: 24},

          {name: "L953", value: 22},

          {name: "L953", value: 22},

          {name: "L952", value: 13},

          {name: "L955F", value: 13},

          {name: "LG953", value: 10},

          {name: "L953", value: 9},

          {name: "L953", value: 13},

          {name: "L952", value: 9},

          {name: "L955F", value: 8},

          {name: "L956", value: 6},

          {name: "L956F", value: 8},

          {name: "L955", value: 5},

          {name: "L955", value: 5},

          {name: "L952", value: 2},

          {name: "L955", value: 6},

          0,

          {name: "LG953", value: 1}
        ]
      }]

    };

    mapChart.setOption(areaOption);


    var queryWorkHotObj = {
      machineType:'',
      cycleType:'',
      startDate:''
    }
    vm.drawDistribution = function () {
      if(vm.machine){
        queryWorkHotObj.machineType = vm.machine.machineType;
      }
      if(vm.cycleType){
        queryWorkHotObj.cycleType = vm.cycleType;
      }
      if( vm.startDateDeviceData){
        queryWorkHotObj.startDate = vm.startDateDeviceData;
      }

    }




  }
})();

