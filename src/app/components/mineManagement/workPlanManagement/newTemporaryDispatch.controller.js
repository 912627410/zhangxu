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

    function newTemporaryDispatchController($rootScope, $scope, Notification, $uibModalInstance, $uibModal, serviceResource, operatorInfo,
                                            MINEMNG_MACHINE_TYPE_LIST, MINE_PAGE_URL, MINEMNG_FLEET_LIST) {
      var vm = this;
      vm.operatorInfo = operatorInfo;


      /**
       * 加载车辆类型列表
       */
      vm.getMachineTypeList = function () {
        var rspDate = serviceResource.restCallService(MINEMNG_MACHINE_TYPE_LIST, "QUERY");
        rspDate.then(function (data) {
          vm.machineTypeList = data;
        }, function (reason) {
          Notification.error(reason.data);
        })
      };
      vm.getMachineTypeList();

      /**
       * 获取车辆列表
       * @param machineType 车型
       */
      vm.getMachineList = function (machineType) {
        if (machineType == null || machineType === "" || machineType === "undefined") {
          Notification.warning("请选择车型");
          return;
        }
        var restCallURL = MINE_PAGE_URL + "?page=0&size=10000&sort=id,desc&search_EQ_machineType=" + machineType;
        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          vm.machineList = data.content;
        }, function (reason) {
          vm.machineList = null;
          Notification.error(languages.findKey('getDataVeFail'));
        });
      };

      /**
       * 加载车队列表
       */
      vm.getFleetList = function () {
        var url = MINEMNG_FLEET_LIST + "?parentId=0";
        var rspDate = serviceResource.restCallService(url, "QUERY");
        rspDate.then(function (data) {
          vm.fleetList = data;
        },function (reason) {
          Notification.error(reason.data);
        })
      };
      vm.getFleetList();

      /**
       * 加载小组列表
       * @param fleetId
       */
      vm.getTeamList = function (fleetId) {
        if(fleetId != null && fleetId !== "" && fleetId !== "undefined") {
          var url = MINEMNG_FLEET_LIST + "?parentId=" + fleetId;
          var rspDate = serviceResource.restCallService(url, "QUERY");
          rspDate.then(function (data) {
            vm.teamList = data;
          },function (reason) {
            Notification.error(reason.data);
          })
        }
      };

      vm.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };
    }
})();
