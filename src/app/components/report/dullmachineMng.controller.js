/**
 * Created by mengwei on 17-3-3.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('dullmachineMngController', dullmachineMngController);

  /** @ngInject */
  function dullmachineMngController($rootScope, $scope,$http,$filter) {
    var vm = this;

      var date = new Date();
      var chart = echarts.init(document.getElementById('mapChart'));
      var option = {
        title : {
          text : '待销车库存分析',
          subtext: $filter("date")(date, "yyyy-MM-dd HH:mm:ss"),
          subtextStyle: {
            fontSize: 14,
            color: '#666666'
          },
          left : 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a}</br> {b}：{c} 台'
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
        visualMap: {
          type: 'continuous',
          min: 0,
          max: 10,
          left: 'left',
          top: 'bottom',
          text: ['高','低'],
          color: ['#980000','#f6f3d2','#075e89'],
          calculable: true
        },
        geo : {
          map : 'china',
          label : {
            emphasis : {
              show : false
            }
          },
          roam : true,
          scaleLimit: {
            min: 0.5
          }
        },
        series: [
          {
            name: '待销车',
            type: 'map',
            map: 'china',
            roam: true,
            scaleLimit: {
              min: 0.5
            },
            showLegendSymbol:false,
            label: {
              emphasis: {
                show: true
              }
            },
            data:[
              {name: '北京', value: 1},
              {name: '天津', value: 2},
              {name: '上海', value: 3},
              {name: '重庆', value: 4},
              {name: '河北', value: 5},
              {name: '河南', value: 6},
              {name: '云南', value: 7},
              {name: '辽宁', value:11},
              {name: '黑龙江', value: 2.4},
              {name: '湖南', value: 3.4},
              {name: '安徽', value: 4.5},
              {name: '山东', value: 5.6},
              {name: '新疆', value: 5.4},
              {name: '江苏', value: 9.9},
              {name: '浙江', value: 1}
            ]
          }
        ]
      };
      chart.setOption(option);







  }
})();
