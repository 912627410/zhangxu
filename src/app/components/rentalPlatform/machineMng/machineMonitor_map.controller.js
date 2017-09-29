/**
 * @author xielongwang
 * @date 2017/8/17.
 * @description 车辆地图轨迹controller
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorMapController', machineMonitorMapController);

  /** @ngInject */
  function machineMonitorMapController($rootScope,$window,$scope,$http, $location, $timeout, $filter,sharedDeviceInfoFactory) {
    var vm = this;
    //获取共享数据deviceinfo
    vm.deviceInfo = sharedDeviceInfoFactory.getSharedDeviceInfo();
    //分页大小
    vm.pageSize = 10;
    var date = new Date();
    //查询开始时间默认为昨天
    date.setDate(date.getDate() - 1);
    vm.queryStartDate = date;
    //结束时间
    vm.queryEndDate = new Date();

  }
})();
