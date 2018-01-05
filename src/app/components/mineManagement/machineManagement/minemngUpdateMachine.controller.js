/**
 * Created by luzhen on 12/25/17.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateMineMachineController', updateMineMachineCtrl);

  /** @ngInject */
  function updateMineMachineCtrl($filter,machineService,machine, $uibModalInstance,languages, MINE_UPDATEMACHINE_URL, serviceResource, Notification,MINE_PAGE_URL,MINEMACHINE_STATE_LIST_URL) {
    var vm = this;
    vm.machine = machine;

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

      var restPromise = serviceResource.restUpdateRequest(MINE_UPDATEMACHINE_URL, machine);
      restPromise.then(function (data) {
          if(data.code===0){
            vm.machine = data.content;
            Notification.success("更新成功");
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
