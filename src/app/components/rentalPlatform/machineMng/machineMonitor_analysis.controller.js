/**
 * @author xielong.wang
 * @date   2017/8/17
 * @description 设备分析controller
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorAnalysisController', machineMonitorAnalysisController);

  /** @ngInject */
  function machineMonitorAnalysisController($rootScope,$window,$scope,$http, $location, $timeout, $filter,sharedDeviceInfoFactory,DEFAULT_MINSIZE_PER_PAGE) {
    var vm = this;
    //获取共享数据deviceinfo
    vm.deviceInfo=sharedDeviceInfoFactory.getSharedDeviceInfo();
    //分页大小
    vm.pageSize = DEFAULT_MINSIZE_PER_PAGE;
    var date = new Date();
    //查询开始时间默认为昨天
    date.setDate(date.getDate() - 1);
    vm.queryStartDate = date;
    //结束时间
    vm.queryEndDate = new Date();

  }
})();
