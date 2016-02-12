(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('deviceinfoMngController', deviceinfoMngController);

  /** @ngInject */
  function deviceinfoMngController($rootScope, $scope, $uibModal, Notification, serviceResource, DEVCE_PAGED_QUERY,DEFAULT_SIZE_PER_PAGE) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.radioListType = "list";
    vm.deviceinfo = {};

    //查询条件相关
    vm.showOrgTree = false;
    vm.openOrgTree = function () {
      vm.showOrgTree = !vm.showOrgTree;
    }

    $scope.$on('OrgSelectedEvent', function (event, data) {
      vm.selectedOrg = data;
      vm.deviceinfo.org = vm.selectedOrg;
      vm.showOrgTree = false;
    })


    vm.query = function (page, size, sort, deviceinfo) {
      var restCallURL = DEVCE_PAGED_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != deviceinfo) {
        // alert(deviceinfo.phoneNumber);
        //alert(deviceinfo.org.id);
        //alert(deviceinfo.deviceNum);
        if (null != deviceinfo.org) {
          restCallURL += "&search_EQ_organization.id=" + deviceinfo.org.id;
        }
        if (null != deviceinfo.deviceNum) {
          restCallURL += "&search_LIKE_deviceNum=" + deviceinfo.deviceNum;
        }
        if (null != deviceinfo.phoneNumber) {
          restCallURL += "&search_LIKE_sim.phoneNumber=" + deviceinfo.phoneNumber;
        }

      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.deviceinfoList = data.content;

        //  alert(vm.deviceinfoList[0].id);
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        vm.deviceinfoList = {};
        Notification.error("获取SIM数据失败");
      });
    };

    if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN" || vm.operatorInfo.userdto.role == "ROLE_ADMIN") {
      vm.query(null, null, null, null);
    }

    //重置查询框
    vm.reset = function () {
      vm.deviceinfo.org = null;
      vm.deviceinfo.deviceNum = null;
      vm.deviceinfo.phoneNumber = null;
    }


    vm.newDeviceinfo = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/newDeviceinfo.html',
        controller: 'newDeviceinfoController as newDeviceinfoController',
        size: size,
        backdrop: false,
        scope: $scope,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function () {
        //正常返回
      }, function () {
        //取消
      });
    };


    vm.updateDeviceinfo = function (deviceinfo, size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/updateDeviceinfo.html',
        controller: 'updateDeviceinfoController as updateDeviceinfoController',
        size: size,
        backdrop: false,
        resolve: {
          deviceinfo: function () {
            return deviceinfo;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        vm.selected = selectedItem;
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };

    //批量导入
    vm.uploadDeviceinfo = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/uploadDeviceinfo.html',
        controller: 'uploadDeviceinfoController as uploadDeviceinfoController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function () {
        //正常返回
      }, function () {
        //取消
      });
    };
  }
})();
