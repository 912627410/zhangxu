/**
 * Created by mengwei on 17-8-7.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('costStatisticsController', costStatisticsController);

  /** @ngInject */
  function costStatisticsController($scope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults, serviceResource,DEVCE_HIGHTTYPE) {
    var vm = this;


    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义页面的喵点
    $scope.navs = [{
      "title": "income", "icon": "fa-map"
    }, {
      "title": "Cost", "icon": "fa-signal"
    }, {
      "title": "profit", "icon": "fa-exclamation-triangle"
    }];




    window.onresize = function(){
      topPie.resize();
      bottomPie.resize();

    }



    /**
     * 去到某个喵点
     * @param 喵点id
     */
    vm.gotoAnchor = function (x) {
      $location.hash(x);
      $anchorScroll();
    }


    vm.type = 'all';
    vm.typeList = ['All','剪叉','直臂','曲臂'];

    var deviceHeightTypeUrl = DEVCE_HIGHTTYPE + "?search_EQ_status=1";
    var deviceHeightTypeData = serviceResource.restCallService(deviceHeightTypeUrl, "GET");
    deviceHeightTypeData.then(function (data) {
      vm.deviceHeightTypeList = data.content;
    }, function (reason) {
      Notification.error('获取高度类型失败');
    })

    vm.Brand = 'all'
    vm.BrandList = ['brand1','brand2','brand3'];



    vm.search = function () {

    }


    //cost
    var topPie =  echarts.init(document.getElementById('topPie'));
    var topPieOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        data:['贷款额','还款额','其他']
      },
      series: [
        {
          name:'访问来源',
          type:'pie',
          selectedMode: 'single',
          radius: '60%',
          data:[
            {value:335, name:'贷款额', selected:true},
            {value:679, name:'还款额'},
            {value:1548, name:'其他'}
          ]
        }
      ]
    };
    topPie.setOption(topPieOption);

    var bottomPie = echarts.init(document.getElementById('bottomPie'));
    var bottomPieoption = {
      title : {
        text: '成本相关',
        subtext: '',
        x:'center'
      },
      tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['折旧','维修','保养','配件','人工']
      },
      series : [
        {
          name: '访问来源',
          type: 'pie',
          radius : '55%',
          center: ['50%', '60%'],
          data:[
            {value:335, name:'折旧'},
            {value:310, name:'维修'},
            {value:234, name:'保养'},
            {value:135, name:'配件'},
            {value:1548, name:'人工'}
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
    bottomPie.setOption(bottomPieoption);


  }
})();
