/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newMineMachinemngController', newMineMachinemngCtrl);

  /** @ngInject */
  function newMineMachinemngCtrl(machineType,MINEMACHINE_STATE_LIST_URL, $uibModalInstance,languages, MINE_MACHINE_URL, serviceResource, Notification) {
    var vm = this;
    vm.machineType =machineType

    // 日期控件相关
    // 购机日期
    vm.purchaseDateOpenStatus = {
      opened: false
    };

    vm.purchaseDateOpen = function ($event) {
      vm.purchaseDateOpenStatus.opened = true;
    };

    //接车日期
    vm.acceptDateOpen = function ($event) {
      vm.acceptDateOpenStatus.opened = true;
    };
    vm.acceptDateOpenStatus = {
      opened: false
    };

    //建档日期
    vm.archivesDateOpen = function ($event) {
      vm.archivesDateOpenStatus.opened = true;
    };
    vm.archivesDateOpenStatus = {
      opened: false
    };



    var machineStatePromise = serviceResource.restCallService(MINEMACHINE_STATE_LIST_URL,"QUERY");
    machineStatePromise.then(function (data) {
      vm.machineStateList= data;
    }, function () {
      Notification.error(languages.findKey('getVeStaFail'));
    })



    vm.ok = function (machine) {

      machine.machineType=vm.machineType;
      var restPromise = serviceResource.restAddRequest(MINE_MACHINE_URL, machine);
      restPromise.then(function (data) {
          if(data.code===0){
            vm.machine = data.content;
            // Notification.error(data.message);
            $uibModalInstance.close(data.content);
          }
        }, function (reason) {
          // alert(reason.data.message);
          vm.errorMsg=reason.data.message;
          Notification.error(reason.data.message);
        }

      );
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };




  }
})();