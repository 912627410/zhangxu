/**
 * Created by xiaopeng on 16-12-14.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('attendanceController', attendanceController);

  /** @ngInject */
  function attendanceController($rootScope, $scope, $uibModal, $confirm,$filter,permissions, NgTableParams,treeFactory, ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE, MACHINE_PAGE_URL,MACHINE_UNBIND_DEVICE_URL, MACHINE_MOVE_ORG_URL, MACHINE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    // 默认查询7天
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    $scope.queryDate = {
      startDate: startDate,
      endDate: new Date()
    };

    //date picker
    $scope.startDateOpenStatus = false;
    $scope.endDateOpenStatus = false;

    $scope.startDateOpen = function () {
      $scope.startDateOpenStatus = true;
    };
    $scope.endDateOpen = function () {
      $scope.endDateOpenStatus = true;
    };

    $scope.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };


    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        $scope.queryOrg =selectedItem;
      });
    }

  }
})();
