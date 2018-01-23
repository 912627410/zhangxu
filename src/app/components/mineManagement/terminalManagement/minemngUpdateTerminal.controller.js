/**
 *
 *@author weihua
 *@create 2018-01-12 10:22
 *@email hua.wei@nvrchina.com.cn
 *@description 修改终端信息
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('minemngUpdateTerminalController', minemngUpdateTerminalController);

    function minemngUpdateTerminalController($rootScope,$uibModalInstance,MINEMNG_GET_UNBOUND_MACHINE,serviceResource,Notification,minemngterminal,MINEMNG_UPDATE_TERMINAL) {

      var vm = this;
      vm.operatorInfo = $rootScope.userInfo;
      vm.terminal=angular.copy(minemngterminal);
      vm.unboundCar = {
        id: minemngterminal.minemngMachineId,
        carNumber: minemngterminal.carNumber
      };


      vm.ok = function () {
        vm.terminal.minemngMachineId = vm.unboundCar.id;
        vm.terminal.carNumber = vm.unboundCar.carNumber;
        var rspdata = serviceResource.restUpdateRequest(MINEMNG_UPDATE_TERMINAL,vm.terminal);
        rspdata.then(function (data) {
          Notification.success("修改用户信息成功!");
          $uibModalInstance.close(data.content);
        },function (reason) {
          Notification.error(reason.data.message);
        })
      }





      /**
       * 获取未绑定车辆
       */
      vm.queryUnboundMachine=function(){

        var url=MINEMNG_GET_UNBOUND_MACHINE;
        var unboundMachine=serviceResource.restCallService(url,"QUERY");
        unboundMachine.then(function (data) {

          vm.unboundCarList=data;

        },function (reason) {
          Notification.error('获取未绑定车辆列表失败');
        })
      };
      vm.queryUnboundMachine();

      /**
       * 取消
       */
      vm.cancel=function(){
        $uibModalInstance.dismiss('cancel');
      };
    }
})();
