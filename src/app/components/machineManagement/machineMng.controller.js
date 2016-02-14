/**
 * Created by shuangshan on 16/1/18.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineMngController', machineMngController);

  /** @ngInject */
  function machineMngController($rootScope,$uibModal,Notification,serviceResource, MACHINE_PAGE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.radioListType = "list";

    vm.query = function(){
        var rspData = serviceResource.restCallService(MACHINE_PAGE_URL,"GET");
        rspData.then(function(data){

          vm.macheineList = data.content;
        },function(reason){
          vm.macheineList = null;
          Notification.error("获取车辆数据失败");
        });
    };

    if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN" || vm.operatorInfo.userdto.role == "ROLE_ADMIN"){
      vm.query();
    }


    vm.newMachine = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/machineManagement/newMachine.html',
        controller: 'newMachineController as newMachineController',
        size: size,
        backdrop:false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function () {
        //刷新
        vm.query();
      }, function () {
        //取消
      });
    };

    vm.updateMachine = function (machine, size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/machineManagement/updateMachine.html',
        controller: 'updateMachineController as updateMachineController',
        size: size,
        backdrop: false,
        resolve: {
          machine: function () {
            return machine;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        vm.selected = selectedItem;
        //刷新
        vm.query();
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };

  }
})();
