/**
 * Created by 刘鲁振 on 2018/1/16.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateFleetTeamController', updateFleetTeamController);

  /** @ngInject */
  function updateFleetTeamController( MINE_UPDATE_FLEET_TEAM,fleetTeam,$uibModalInstance, serviceResource, Notification) {
    var vm = this;
    vm.fleetTeam=fleetTeam;


    /*var machineStatePromise = serviceResource.restCallService(MINEMACHINE_STATE_LIST_URL,"QUERY");
    machineStatePromise.then(function (data) {
      vm.machineStateList= data;
    }, function () {
      Notification.error(languages.findKey('getVeStaFail'));
    })*/



    vm.ok = function (fleetTeam) {

      var restPromise = serviceResource.restUpdateRequest(MINE_UPDATE_FLEET_TEAM, fleetTeam);
      restPromise.then(function (data) {
          if(data.code===0){
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
