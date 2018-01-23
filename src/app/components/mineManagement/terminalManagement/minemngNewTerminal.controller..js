/**
 * Created by weihua on 18-01-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngNewTerminalMngController', minemngNewTerminalMngController);

  /** @ngInject */
  function minemngNewTerminalMngController($rootScope,$uibModalInstance,MINEMNG_TERMINAL_URL,MINEMNG_GET_UNBOUND_MACHINE,serviceResource, Notification) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.newTerminal={};

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
     * 确定
     */

    vm.ok=function () {

      if(vm.newTerminal.unboundCar != null && vm.newTerminal.unboundCar !== 'undefined' && vm.newTerminal.unboundCar !== '') {
        vm.newTerminal.minemngMachineId = vm.newTerminal.unboundCar.id;
      }

      var rspdata=serviceResource.restAddRequest(MINEMNG_TERMINAL_URL,vm.newTerminal);
      rspdata.then(function (data) {
        Notification.success("增加成功!");
        $uibModalInstance.close(data.content);

      },function (reason) {
        Notification.error(reason.data.message);
      })

    };
    /**
     * 取消
     */
    vm.cancel=function(){
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
