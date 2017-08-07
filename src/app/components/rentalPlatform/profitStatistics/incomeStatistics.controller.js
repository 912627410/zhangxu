/**
 * Created by mengwei on 17-8-7.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('incomeStatisticsController', incomeStatisticsController);

  /** @ngInject */
  function incomeStatisticsController($scope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults, serviceResource,DEVCE_HIGHTTYPE) {
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

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
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

    window.onresize = function(){
      lineChart.resize();
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


    //income
    var lineChart = echarts.init(document.getElementById('incomeLine'));
    var option = {
      title: {
        text: '收入统计'
      },
      tooltip : {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data:['实收','应收']
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis : [
        {
          type : 'category',
          boundaryGap : false,
          data : ['周一周','周二周','周三周','周四周','周五周','周六周']
        }
      ],
      yAxis : [
        {
          type : 'value'
        }
      ],
      series : [
        {
          name:'实收',
          type:'line',
          stack: '总量',
          areaStyle: {normal: {}},
          data:[120, 132, 101, 134, 90, 230]
        },
        {
          name:'应收',
          type:'line',
          stack: '总量',
          areaStyle: {normal: {}},
          data:[220, 182, 191, 234, 290, 330]
        }
      ]
    };
    lineChart.setOption(option);


  }
})();
