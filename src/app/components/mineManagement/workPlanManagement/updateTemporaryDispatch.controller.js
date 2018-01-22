/**
 *
 * @author syLong
 * @create 2018-01-16 13:56
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('updateTemporaryDispatchController', updateTemporaryDispatchController);

    function updateTemporaryDispatchController($rootScope, $scope, Notification, $uibModalInstance, $uibModal, serviceResource, minemngResource, temporaryDispatch, MINEMNG_TEMPORARY_DISPATCH) {
      var vm = this;
      vm.userInfo = $rootScope.userInfo;
      vm.oldTemporaryDispatch = angular.copy(temporaryDispatch);
      vm.fleet = temporaryDispatch.nowFleet;
      vm.team = temporaryDispatch.nowTeam;


      /**
       * 加载车队列表
       */
      var fleetListPromise = minemngResource.getFleetList();
      fleetListPromise.then(function (data) {
        vm.fleetList = data;
      }, function (reason) {
        Notification.error(reason.data);
      });

      /**
       * 加载小组列表
       * @param fleetId
       */
      vm.getTeamList = function (fleetId) {
        vm.teamList = null;
        var teamListPromise = minemngResource.getTeamList(fleetId);
        if(teamListPromise != null) {
          teamListPromise.then(function (data) {
            vm.teamList = data;
          }, function (reason) {
            Notification.error(reason.data);
          });
        }
      };

      vm.getTeamList(vm.fleet);

      vm.ok = function () {
        if(vm.fleet === vm.oldTemporaryDispatch.nowFleet && vm.team === vm.oldTemporaryDispatch.nowTeam) {
          Notification.warning("内容没有变化");
          return;
        }
        if(vm.fleet === vm.oldTemporaryDispatch.oldFleet && vm.team === vm.oldTemporaryDispatch.oldTeam) {
          Notification.warning("修改后的数据与原始数据相同");
          return;
        }
        var updateTemporaryDispatch = {
          machineId: vm.oldTemporaryDispatch.minemngMachineId,
          carNumber: vm.oldTemporaryDispatch.carNumber,
          fleet: vm.fleet,
          team: vm.team
        };
        var restPromise = serviceResource.restUpdateRequest(MINEMNG_TEMPORARY_DISPATCH, updateTemporaryDispatch);
        restPromise.then(function (data) {
          if(data.code === 0) {
            Notification.success(data.content);
            $uibModalInstance.close();
          } else{
            Notification.error(data.content);
          }
        }, function (reason) {
          Notification.error(reason.data);
        });
      };

      /**
       * 取消
       */
      vm.cancel = function(){
        $uibModalInstance.dismiss('cancel');
      };

    }
})();
