/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalFleetMngController', rentalFleetMngController);

  /** @ngInject */
  function rentalFleetMngController($scope, $window, $location, $uibModal,$anchorScroll, serviceResource,NgTableParams,ngTableDefaults,Notification,permissions,rentalService,DEFAULT_SIZE_PER_PAGE,FLEET_PAGE_URL) {
    var vm = this;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //定义偏移量
    $anchorScroll.yOffset = 50;
    //定义页面的喵点
    vm.anchorList = ["currentLocation", "currentState", "alarmInfo"];

    /**
     * 去到某个喵点
     * @param 喵点id
     */
    vm.gotoAnchor = function (x) {
      $location.hash(x);
      $anchorScroll();
    };

    //加载品牌信息
    var deviceManufactureListPromise = rentalService.getDeviceManufactureList();
    deviceManufactureListPromise.then(function (data) {
      vm.deviceManufactureList= data.content;
      //    console.log(vm.userinfoStatusList);
    }, function (reason) {
      Notification.error('获取厂家失败');
    })

    //加载高度信息
    var deviceHeightTypeListPromise = rentalService.getDeviceHeightTypeList();
    deviceHeightTypeListPromise.then(function (data) {
      vm.deviceHeightTypeList= data.content;
    }, function (reason) {
      Notification.error('获取高度失败');
    })

  //加载车辆类型信息
    var deviceTypeListPromise = rentalService.getDeviceTypeList();
    deviceTypeListPromise.then(function (data) {
      vm.deviceTypeList= data.content;
    }, function (reason) {
      Notification.error('获取类型失败');
    })

  //加载车辆驱动信息
    var devicePowerTypeListPromise = rentalService.getDevicePowerTypeList();
    devicePowerTypeListPromise.then(function (data) {
      vm.devicePowerTypeList= data.content;
    }, function (reason) {
      Notification.error('获取驱动类型失败');
    })



    vm.query = function (page, size, sort, fleet) {
      var restCallURL = FLEET_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 8;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != fleet) {

        if (null != fleet.id&&fleet.id!="") {
          restCallURL += "&search_LIKE_id=" + $filter('uppercase')(fleet.id);
        }
        if (null != fleet.label&&fleet.label!="") {
          restCallURL += "&search_LIKE_label=" + $filter('uppercase')(fleet.label);
        }

      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.fleetList=data.content;
        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取作业面数据失败");
      });
    };

    vm.query();

    vm.validateOperPermission=function(){
      return permissions.getPermissions("machine:oper");
    }


    //更新fleet
    vm.updateFleet = function (fleet, size, type) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/rentalPlatform/fleetMng/updateRentalFleetMng.html',
        controller: 'updateRentalFleetController as updateRentalFleetController',
        size: size,
        backdrop: false,
        resolve: {
          fleet: function () {
            return fleet;
          },type: function () {
            return type;
          }
        }
      });

      modalInstance.result.then(function(result) {

        var tabList=vm.tableParams.data;
        //更新内容
        for(var i=0;i<tabList.length;i++){
          if(tabList[i].id==result.id){
            tabList[i]=result;
          }
        }

      }, function(reason) {

      });
    };
  }
})();
