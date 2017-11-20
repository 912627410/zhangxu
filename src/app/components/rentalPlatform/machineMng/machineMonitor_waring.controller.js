/**
 * @author xielong.wang
 * @date 2017/8/17.
 * @description 车辆报警数据controller
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorWaringController', machineMonitorWaringController);

  /** @ngInject */
  function machineMonitorWaringController($rootScope,$window,$scope,$http, $location, $timeout,serviceResource,ngTableDefaults,NgTableParams,languages,Notification, $filter,sharedDeviceInfoFactory,RENTAL_ALARM_MSG_DATA_URL) {
    var vm = this;
    ngTableDefaults.settings.counts = [];//取消ng-table的默认分页
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

    /**
     * 获取设备报警数据 http://127.0.0.1:8080/rental/getRentalNotifications?page=xx&size=xx&totalElements=xx&deviceNum=xx&sort=locate_date_time,desc
     *
     * @param pageNum 页码
     * @param pageSize 每页多少条数据
     * @param filter 筛选条件
     * @param queryStartDate 开始时间
     * @param queryEndDate  结束时间
     */
    vm.getDeviceWarningData=function (pageNum, pageSize, totalElements, filter, licenseId, queryStartDate, queryEndDate) {
      var restCallURL= RENTAL_ALARM_MSG_DATA_URL;
      //时间参数
      if (queryStartDate && queryEndDate) {
        //开始时间
        var formatDate = $filter('date')(queryStartDate, 'yyyy-MM-dd HH:mm:ss');
        restCallURL += "?queryStartDate=" + formatDate;

        //结束时间
        var formatEndDate = $filter('date')(queryEndDate, 'yyyy-MM-dd HH:mm:ss');
        restCallURL += "&queryEndDate=" + formatEndDate;
      } else {
        Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
        return;
      }
      //分页参数
      var pageNum = pageNum || 0;
      var pageSize = pageSize || vm.pageSize;
      restCallURL += "&page=" + pageNum + '&size=' + pageSize;
      if (totalElements != null && totalElements != undefined) {
        restCallURL += "&totalElements=" + totalElements;
      }
      //设备号
      if (licenseId != null && licenseId != undefined) {
        restCallURL += "&licenseId=" + licenseId;
      }
      //过滤条件
      if (filter != null && filter != undefined) {
        restCallURL += "&sort=" + filter
      }
      var LocateDataPromis = serviceResource.restCallService(restCallURL, 'GET');
      LocateDataPromis.then(function (data) {
        if (data.content.length<=0){
          Notification.warning(languages.findKey('noData'));
          return;
        }
        vm.deviceWarningData = new NgTableParams({}, {dataset: data.content});
        vm.totalElements = data.totalElements;
        vm.currentPage = data.number + 1;
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    }

  }
})();
