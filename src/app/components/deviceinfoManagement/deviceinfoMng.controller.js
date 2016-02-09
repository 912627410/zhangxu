
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('deviceinfoMngController', deviceinfoMngController);

  /** @ngInject */
  function deviceinfoMngController($rootScope,$scope,$uibModal,Notification,serviceResource, DEVCE_PAGED_QUERY) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.radioListType = "list";
    vm.query = function(page,size,sort){

      var restCallURL = DEVCE_PAGED_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
      //if (queryPhoneNumber){
      //  restCallURL += "&search_LIKE_phoneNumber="+queryPhoneNumber;
      //}

        var rspData = serviceResource.restCallService(restCallURL,"GET");
        rspData.then(function(data){

          vm.deviceinfoList = data.content;

        //  alert(vm.deviceinfoList[0].id);
          vm.page = data.page;
          vm.pageNumber = data.page.number + 1;
        },function(reason){
          vm.deviceinfoList = {};
          Notification.error("获取SIM数据失败");
        });
    };

    if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN" || vm.operatorInfo.userdto.role == "ROLE_ADMIN"){
      vm.query(0,10,null,null);
    }


    vm.newDeviceinfo = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/newDeviceinfo.html',
        controller: 'newDeviceinfoController as newDeviceinfoController',
        size: size,
        backdrop:false,
        scope:$scope,
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


    vm.updateDeviceinfo = function (deviceinfo,size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/deviceinfoManagement/updateDeviceinfo.html',
        controller: 'updateDeviceinfoController as updateDeviceinfoController',
        size: size,
        backdrop:false,
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
        backdrop:false,
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
