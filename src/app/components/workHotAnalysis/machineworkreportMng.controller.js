/**
 * Created by mengwei on 17-3-13.
 */
/**
 * Created by mengwei on 17-3-10.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineworkreportMngController', machineworkreportMngController);

  /** @ngInject */
  function machineworkreportMngController($rootScope, $scope, $http, $filter) {
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

    $http.get('../bower_components/echarts/map/json/china.json').success(function (chinaJson) {

      echarts.registerMap('china', chinaJson);
      var myChart = echarts.init(document.getElementById('chart-map-panel'));

      var option = {
        title: {
          text: '车辆工作报告',
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: function (params) {
            var names = params.name.split("|");
            var deviceNo = names[0];
            var addr = "";
            if (names.length > 1) {
              addr = names[1];
            }
            return "产品类型：" + params.seriesName.split(' ')[0] + "<br />"
              + "车辆编号：" + deviceNo + "<br />"
              + "地理位置：" + addr;
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
          orient: 'vertical',
          y: 'top',
          x: 'left'
        },
        geo: {
          map: 'china',
          label: {
            emphasis: {
              show: true
            }
          },
          roam: true,
          scaleLimit: {
            min: 0.5
          }
        },
        series: [],
        progressive: 0, //渐进式渲染时每一帧绘制图形数量，设为 0 时不启用渐进式渲染，支持每个系列单独配置。
        hoverLayerThreshold: 10000 //图形数量阈值，决定是否开启单独的 hover 层，在整个图表的图形数量大于该阈值时开启单独的 hover 层。
      };

      myChart.setOption(option);


    });


  }
})();

