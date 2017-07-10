/**
 * Created by develop on 7/31/16.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('moveToOtherFleetController', moveToOtherFleetController);

  /** @ngInject */
  function moveToOtherFleetController($rootScope, $scope, $uibModal, $uibModalInstance,$confirm,$filter,permissions, NgTableParams,treeFactory, ngTableDefaults, Notification, serviceResource, FLEET_PAGE_URL,MACHINE_MOVE_FLEET_URL,machine) {
    var vm = this;
    vm.machine = machine;
    vm.operatorInfo = $rootScope.userInfo;

    ngTableDefaults.settings.counts = [];

    vm.query = function (page, size, sort, fleet) {
      var restCallURL = FLEET_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 5;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != fleet) {
        if (null != fleet.label&&fleet.label!="") {
          restCallURL += "&search_LIKE_label=" + $filter('uppercase')(fleet.label);
        }
      }

      if(vm.machine.fleet !=null&&null != vm.machine.fleet.id){
        restCallURL += "&search_NEQ_id=" + $filter('uppercase')(vm.machine.fleet.id);
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取作业面数据失败");
      });
    };

    vm.query();

    //重置查询框
    vm.reset = function () {
      vm.fleet = null;
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    vm.moveToFleet = function (fleet) {

      var machineIds = [];
      machineIds.push(vm.machine.id);

      var moveOrg = {ids: machineIds, "orgId": fleet.id};

      var restPromise = serviceResource.restUpdateRequest(MACHINE_MOVE_FLEET_URL, moveOrg);
      restPromise.then(function (data) {
        //更新页面显示
        Notification.success("借调车辆成功!");

        $uibModalInstance.close(fleet);

      }, function (reason) {
        Notification.error("借调车辆出错!");
      });



    }
  }
})();
