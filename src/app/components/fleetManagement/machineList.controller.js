/**
 * Created by develop on 7/24/16.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineListController', machineListController);

  /** @ngInject */

  function machineListController($rootScope, $scope, $uibModal,$uibModalInstance, $timeout, $filter, $translate,languages,treeFactory,NgTableParams, ngTableDefaults, DEVCE_MONITOR_SINGL_QUERY, MACHINE_PAGE_URL,fleet,type, serviceResource, Notification) {
    var vm = this;
    vm.fleet = fleet;
    vm.type = type;
    vm.operatorInfo =$rootScope.userInfo;

    vm.query = function (page, size, sort, fleet) {

      var restCallURL = MACHINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 8;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (vm.type=='own'&&null != fleet&&null!=fleet.id) {
        restCallURL += "&search_EQ_orgEntity.id=" +fleet.id;
      }

      if (vm.type=='work'&&null != fleet&&null!=fleet.id) {
        restCallURL += "&search_EQ_fleetEntity.id=" +fleet.id;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({},
          {
            dataset: data.content
          });
        vm.page = data.page;
        vm.machine_pagenumber = data.page.number + 1;

      },function (reason) {

      });
    };

    vm.currentInfo = function (id, size) {

      var singlUrl = DEVCE_MONITOR_SINGL_QUERY + "?id=" + id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
          vm.deviceinfoMonitor = data.content;
          var templateUrl, controller;
          if(vm.deviceinfoMonitor.versionNum == 'A001') {
            templateUrl = 'app/components/deviceMonitor/deviceAerialCurrentInfo.html';
            controller = 'deviceAerialCurrentInfoController as deviceAerialCurrentInfoController';
          } else {
            templateUrl = 'app/components/deviceMonitor/devicecurrentinfo.html';
            controller = 'DeviceCurrentInfoController as deviceCurrentInfoCtrl';
          }
          $rootScope.currentOpenModal = $uibModal.open({
            animation: vm.animationsEnabled,
            backdrop: false,
            templateUrl: templateUrl,
            controller: controller,
            size: size,
            resolve: { //用来向controller传数据
              deviceinfo: function () {
                return vm.deviceinfoMonitor;
              }
            }
          });

        }, function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        }
      )
    };


    vm.query(null, null, null, vm.fleet);

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();

