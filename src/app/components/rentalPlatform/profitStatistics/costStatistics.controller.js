/**
 * Created by mengwei on 17-8-7.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('costStatisticsController', costStatisticsController);

  /** @ngInject */
  function costStatisticsController($scope,$rootScope, $window, $location, $anchorScroll, NgTableParams, ngTableDefaults,$filter, serviceResource,DEVCE_HIGHTTYPE,USER_MACHINE_TYPE_URL,DEVCE_MF,Notification,RENTAL_COST_PAGED_URL,DEFAULT_MINSIZE_PER_PAGE) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.queryCost = {};



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
    }



    ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];


    /**
     * 去到某个喵点
     * @param 喵点id
     */
    vm.gotoAnchor = function (x) {
      $location.hash(x);
      $anchorScroll();
    }
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
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



    var deviceHeightTypeUrl = DEVCE_HIGHTTYPE + "?search_EQ_status=1";
    var deviceHeightTypeData = serviceResource.restCallService(deviceHeightTypeUrl, "GET");
    deviceHeightTypeData.then(function (data) {
      vm.deviceHeightTypeList = data.content;
    }, function (reason) {
      Notification.error('获取高度类型失败');
    })

    //查询当前用户拥有的车辆类型明细
    vm.getMachineType = function(){
      var restCallURL = USER_MACHINE_TYPE_URL;
      if(vm.operatorInfo){
        restCallURL += "?orgId="+ vm.operatorInfo.userdto.organizationDto.id;
      }
      var rspData = serviceResource.restCallService(restCallURL, "QUERY");
      rspData.then(function (data) {
        if(data.length>0){
          vm.machineTypeList = data;
        } else {
          //在用户的所在组织不存在车辆类型时,默认查询其上级组织拥有的车辆类型
          if(vm.operatorInfo){
            var restCallURL1 = USER_MACHINE_TYPE_URL;
            restCallURL1 += "?orgId="+ vm.operatorInfo.userdto.organizationDto.parentId;
          }
          var rspData1 = serviceResource.restCallService(restCallURL1, "QUERY");
          rspData1.then(function (data1) {
            vm.machineTypeList = data1;
          });
        }
      }, function (reason) {
        vm.machineList = null;
        Notification.error("获取车辆类型数据失败");
      });
    }
    vm.getMachineType();

    var deviceMFUrl = DEVCE_MF + "?search_EQ_status=1";
    var deviceMFData = serviceResource.restCallService(deviceMFUrl, "GET");
    deviceMFData.then(function (data) {
      vm.machineMFList = data.content;
    }, function (reason) {
      Notification.error('获取厂商失败');
    })




    vm.queryCost = function (page, size, sort,startDate,endDate) {

      var restCallURL = RENTAL_COST_PAGED_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
      var sortUrl = sort || 'id';
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      restCallURL += "&startDate=" + $filter('date')(startDate,'yyyy-MM-dd');
      restCallURL += "&endDate=" + $filter('date')(endDate,'yyyy-MM-dd');


      if (null != vm.queryDeviceHeightType&&vm.queryDeviceHeightType!="") {
        restCallURL += "&search_EQ_deviceHeightType.id=" +$filter('uppercase')(vm.queryDeviceHeightType);
      }
      if (null != vm.queryManufacture&&vm.queryManufacture!="") {
        restCallURL += "&search_EQ_deviceManufacture.id=" +$filter('uppercase')(vm.queryManufacture);
      }
      if (null != vm.machineType&&vm.machineType != ""){
        restCallURL += "&search_EQ_machineTypeEntity.id=" + $filter('uppercase')(vm.machineType);
      }


      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      },function (reason) {
        Notification.error("获取成本数据失败")
      })
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
        data:['车辆相关','销售费用','管理费用','财务费用']
      },
      series: [
        {
          name:'访问来源',
          type:'pie',
          selectedMode: 'single',
          radius: '60%',
          data:[
            {value:335, name:'车辆相关', selected:true},
            {value:679, name:'销售费用'},
            {value:1548, name:'管理费用'},
            {value:666, name:'财务费用'}
          ]
        }
      ]
    };
    topPie.setOption(topPieOption);




  }
})();
