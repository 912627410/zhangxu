
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
    vm.loadMachine = function(){
        var rspData = serviceResource.restCallService(SIM_PAGE_URL,"GET");
        rspData.then(function(data){

          vm.simList = data.content;
        },function(reason){
          vm.macheineList = null;
          Notification.error("获取SIM数据失败");
        });
    };

    if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN" || vm.operatorInfo.userdto.role == "ROLE_ADMIN"){
      vm.loadMachine();
    }


    vm.newSim = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/simManagement/newSim.html',
        controller: 'newSimController as newSimController',
        size: size,
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
  }
})();
