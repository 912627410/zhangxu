/**
 * Created by riqian.ma on 2017/7/29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('orgMachineListMngController', orgMachineListMngController);

  /** @ngInject */
  function orgMachineListMngController($scope, $window, $location,$uibModalInstance,$filter, $anchorScroll, languages,serviceResource,NgTableParams,ngTableDefaults,Notification,treeFactory,permissions,rentalService,DEFAULT_SIZE_PER_PAGE,selectUrl) {
    var vm = this;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    }



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




    vm.query = function (currentPage, pageSize, totalElements, searchConditions) {

      var restCallURL = selectUrl;
      var pageUrl = currentPage || 0;
      var sizeUrl = pageSize || DEFAULT_SIZE_PER_PAGE;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl;
      if (totalElements != null || totalElements != undefined) {
        restCallURL += "&totalElements=" + totalElements;
      }
      if (searchConditions!=null){
        restCallURL = commonFactory.processSearchConditions(restCallURL, searchConditions);
      }
      var machineDataPromis = serviceResource.restCallService(restCallURL, "GET");
      machineDataPromis.then(function (data) {
        vm.machineDataList = data.content;
        vm.tableParams = new NgTableParams({}, {dataset: vm.machineDataList});
        vm.totalElements = data.totalElements;
        vm.currentPage = data.number + 1;
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
      // var restCallURL = RENTANL_UNUSED_MACHINE_PAGE_URL;
      // var pageUrl = page || 0;
      // var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      // var sortUrl = sort || "id,desc";
      // restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      //
      // if (null != machine) {
      //
      //   if (null != machine.deviceNum&&machine.deviceNum!="") {
      //     restCallURL += "&search_LIKE_deviceinfo.deviceNum=" + $filter('uppercase')(machine.deviceNum);
      //   }
      //   if (null != machine.licenseId&&machine.licenseId!="") {
      //     restCallURL += "&search_LIKE_licenseId=" + $filter('uppercase')(machine.licenseId);
      //   }
      //
      // }
      //
      // if (null != vm.org&&null != vm.org.id&&!vm.querySubOrg) {
      //   restCallURL += "&search_EQ_orgEntity.id=" + vm.org.id;
      // }
      //
      // if(null != vm.org&&null != vm.org.id&&vm.querySubOrg){
      //   restCallURL += "&parentOrgId=" +vm.org.id;
      // }
      //
      // var rspData = serviceResource.restCallService(restCallURL, "GET");
      // rspData.then(function (data) {
      //
      //   vm.tableParams = new NgTableParams({
      //     // initial sort order
      //     // sorting: { name: "desc" }
      //   }, {
      //     dataset: data.content
      //   });
      //   vm.page = data.page;
      //   vm.pageNumber = data.page.number + 1;
      // }, function (reason) {
      //   vm.machineList = null;
      //   Notification.error("获取车辆数据失败");
      // });
    };

console.log("333111");

    vm.query(0,null,null,null);


    vm.validateOperPermission=function(){
      return permissions.getPermissions("machine:oper");
    }

    //提交
    vm.ok = function () {
     // $uibModalInstance.close(vm.selectRadio);
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };


    vm.reset = function () {
      vm.machine = null;
      vm.org = null;
    }


  }
})();
