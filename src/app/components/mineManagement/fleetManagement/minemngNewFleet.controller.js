/**
 * Created by 刘鲁振 on 2018/1/8.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('addFleetController', addFleetCtrl);

  /** @ngInject */
  function addFleetCtrl( $uibModalInstance, MINE_NEW_FLEET, serviceResource, Notification) {
    var vm = this;



    /*var machineStatePromise = serviceResource.restCallService(MINEMACHINE_STATE_LIST_URL,"QUERY");
    machineStatePromise.then(function (data) {
      vm.machineStateList= data;
    }, function () {
      Notification.error(languages.findKey('getVeStaFail'));
    })*/



    vm.ok = function (minemngFleet) {

      var restPromise = serviceResource.restAddRequest(MINE_NEW_FLEET, minemngFleet);
      restPromise.then(function (data) {
          if(data.code===0){
            vm.minemngFleet = data.content;
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
