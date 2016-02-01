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

    vm.loadMachine = function(){
        var rspData = serviceResource.restCallService(MACHINE_PAGE_URL,"GET");
        rspData.then(function(data){

          vm.macheineList = data.content;
        },function(reason){
          vm.macheineList = null;
          Notification.error("获取车辆数据失败");
        });
    };

    if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN" || vm.operatorInfo.userdto.role == "ROLE_ADMIN"){
      vm.loadMachine();
    }


    vm.newMachine = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/machineManagement/newMachine.html',
        controller: 'newMachineController as newMachineController',
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

  }
})();
