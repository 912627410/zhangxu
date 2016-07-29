/**
 * Created by develop on 7/25/16.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newFleetController', newFleetController);

  /** @ngInject */
  function newFleetController($rootScope,$scope,$http,$confirm,$uibModalInstance,treeFactory,serviceResource,FLEETINFO_URL, Notification) {
    var vm = this;
    vm.operatorInfo =$rootScope.userInfo;
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow();
    }

    //选中组织模型赋值
    $rootScope.$on('orgSelected', function (event, data) {
      vm.org = data;
    });


    vm.ok = function () {
      vm.fleet.parentId=vm.org.id;
      vm.fleet.type=4;
      var rspdata = serviceResource.restAddRequest(FLEETINFO_URL,vm.fleet);
      rspdata.then(function (data) {
        
      },function (reason) {

      })
    }

  }
})();
