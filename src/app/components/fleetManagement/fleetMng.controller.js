/**
 * Created by develop on 7/21/16.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('fleetMngController', fleetMngController);

  /** @ngInject */
  function fleetMngController($rootScope, $scope, $uibModal, $confirm,$filter,permissions, NgTableParams,treeFactory, ngTableDefaults, Notification, serviceResource, FLEETINFO_PAGE_URL, FLEETINFO_URL,DEVCE_MONITOR_PAGED_QUERY) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    ngTableDefaults.params.count = 10;
    ngTableDefaults.settings.counts = [];

    vm.query = function (page, size, sort, fleet) {
      var restCallURL = FLEETINFO_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 10;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != fleet) {

        if (null != fleet.id&&fleet.id!="") {
          restCallURL += "&search_LIKE_id=" + $filter('uppercase')(fleet.id);
        }
        if (null != fleet.label&&fleet.label!="") {
          restCallURL += "&search_LIKE_label=" + $filter('uppercase')(fleet.label);
        }

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
      vm.workplane = null;
    }

    vm.queryMachineList = function (fleet,size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/fleetManagement/machineList.html',
        controller: 'machineListController as machineListCtrl',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          },
          fleet:function () {
            return fleet;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };

    vm.newFleet = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/fleetManagement/newFleet.html',
        controller: 'newFleetController as newFleetCtrl',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };

    //更新fleet
    vm.updateFleet = function (fleet, size, type) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/fleetManagement/updateFleet.html',
        controller: 'updateFleetController as updateFleetCtrl',
        size: size,
        backdrop: false,
        resolve: {
          fleet: function () {
            return fleet;
          },type :function () {
            return type;
          }
        }
      });

      modalInstance.result.then(function(result) {

        var tabList=vm.tableParams.data;
        //更新内容
        for(var i=0;i<tabList.length;i++){
          if(tabList[i].id==result.id){
            tabList[i]=result;
          }
        }

      }, function(reason) {

      });
    };

    //更新Machine
    vm.updateMachineList = function (fleet, size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/fleetManagement/updateMachineList.html',
        controller: 'updateMachineListController as updateMachineListCtrl',
        size: size,
        backdrop: false,
        resolve: {
          fleet: function () {
            return fleet;
          }
        }
      });

    };

    //updateWorkplaneRela
    vm.updateWorkplaneRela = function (fleet,size) {
      var modalInstance = $uibModal.open({
        animation:vm.animationsEnabled,
        templateUrl: 'app/components/fleetManagement/updateWorkplaneRela.html',
        controller: 'updateWorkplaneRelaController as updateWorkplaneRelaCtrl',
        size: size,
        backdrop: false,
        resolve: {
          fleet: function () {
            return fleet;
          }
        }
      })

      modalInstance.result.then(function (result) {
        var tabList=vm.tableParams.data;
        //更新内容
        for(var i=0;i<tabList.length;i++){
          if(tabList[i].id==result.id){
            tabList[i]=result;
          }
        }

      }, function () {
        //取消
      });
    }
  }
})();
