/**
 *
 * @author syLong
 * @create 2018-01-03 19:27
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('newTemporaryDispatchController', newTemporaryDispatchController);

    function newTemporaryDispatchController($rootScope, $scope, Notification, $uibModalInstance, $uibModal, languages, serviceResource, operatorInfo,
                                            minemngResource, MINEMNG_MACHINE_TYPE_LIST, MINEMNG_MINE_MACHINE_LIST, MINEMNG_TEMPORARY_DISPATCH) {
      var vm = this;
      vm.operatorInfo = operatorInfo;

      /**
       * 获取车辆列表
       */
      vm.getMachineList = function () {
        var rspData = serviceResource.restCallService(MINEMNG_MINE_MACHINE_LIST, "QUERY");
        rspData.then(function (data) {
          vm.machineList = data;
        }, function (reason) {
          vm.machineList = null;
          Notification.error(languages.findKey('getDataVeFail'));
        });
      };
      vm.getMachineList();

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
        vm.team = null;
        var teamListPromise = minemngResource.getTeamList(fleetId);
        if(teamListPromise != null) {
          teamListPromise.then(function (data) {
            vm.teamList = data;
          }, function (reason) {
            Notification.error(reason.data);
          });
        }
      };

      vm.ok = function () {
        if(vm.machines == null || vm.machines === "" || vm.machines === "undefined") {
          Notification.warning("请选择车号");
          return;
        }
        if(vm.fleet == null || vm.fleet === "" || vm.fleet === "undefined") {
          Notification.warning("请选择车队");
          return;
        }
        if(vm.team == null || vm.team === "" || vm.team === "undefined") {
          Notification.warning("请选择小组");
          return;
        }
        var newTemporaryDispatch = {
          machineList: vm.machines,
          fleet: vm.fleet,
          team: vm.team
        };
        var rspData = serviceResource.restCallService(MINEMNG_TEMPORARY_DISPATCH, "ADD", newTemporaryDispatch);  //post请求
        rspData.then(function (data) {
          if(data.code === 0){
            Notification.success("增加成功！");
            $uibModalInstance.close();
          } else {
            Notification.error(data.content);
          }
        }, function (reason) {
          Notification.error(reason.data);
        });
      };

      vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };
    }
})();
