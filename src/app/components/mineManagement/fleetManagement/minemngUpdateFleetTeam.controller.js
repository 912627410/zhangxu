/**
 * Created by 刘鲁振 on 2018/1/16.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('updateFleetTeamController', updateFleetTeamController);

  /** @ngInject */
  function updateFleetTeamController(MINE_MACHINE_FLEET, MINE_UPDATE_FLEET_TEAM,fleetTeam,$uibModalInstance, serviceResource, Notification) {
    var vm = this;
    vm.fleetTeam=fleetTeam;
    vm.object;

    var restCallURL = MINE_MACHINE_FLEET;
    restCallURL += "?id=" + vm.fleetTeam.id;
    var dataPromis = serviceResource.restCallService(restCallURL, "GET");
    dataPromis.then(function (data) {
      vm.object=data;
    });

    vm.ok = function (object) {
      vm.object.label=object.name ;
      var restPromise = serviceResource.restUpdateRequest(MINE_UPDATE_FLEET_TEAM, object);
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
