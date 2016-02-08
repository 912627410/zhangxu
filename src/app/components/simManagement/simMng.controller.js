
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('simMngController', simMngController);

  /** @ngInject */
  function simMngController($rootScope,$uibModal,Notification,serviceResource, SIM_PAGE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.radioListType = "list";
    vm.query = function(page,size,sort,queryPhoneNumber){

      var restCallURL = SIM_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
      if (queryPhoneNumber){
        restCallURL += "&search_LIKE_phoneNumber="+queryPhoneNumber;
      }

        var rspData = serviceResource.restCallService(restCallURL,"GET");
        rspData.then(function(data){

          vm.simList = data.content;
          vm.page = data.page;
          vm.pageNumber = data.page.number + 1;
        },function(reason){
          vm.macheineList = null;
          Notification.error("获取SIM数据失败");
        });
    };

    if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN" || vm.operatorInfo.userdto.role == "ROLE_ADMIN"){
      vm.query(0,10,null,null);
    }


    vm.newSim = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/simManagement/newSim.html',
        controller: 'newSimController as newSimController',
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


    vm.updateSim = function (sim,size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/simManagement/updateSim.html',
        controller: 'updateSimController as updateSimController',
        size: size,
        backdrop:false,
        resolve: {
          sim: function () {
            return sim;
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
    vm.uploadSim = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/simManagement/uploadSim.html',
        controller: 'uploadSimController as uploadSimController',
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
