/**
 * @author xielongwang
 * @date  2017/8/17.
 * @description 车辆历史运行数据controller
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorHistoryController', machineMonitorHistoryController);

  /** @ngInject */
  function machineMonitorHistoryController($rootScope, $window, $scope, $http, $location, $timeout, $filter, sharedDeviceInfoFactory, Notification, serviceResource, NgTableParams, RENTAL_DEVCE_DATA_PAGED_QUERY) {
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


    /**
     * 获取历史运行信息
     * @param page 当前页
     * @param size 每页多少条数据
     * @param sort 排序
     * @param deviceNum 设备号
     * @param queryStartDate 开始时间
     * @param queryEndDate 结束时间
     */
    vm.getHistoryRunData = function (page, size, sort, deviceNum, queryStartDate, queryEndDate) {
      var restCallURL = RENTAL_DEVCE_DATA_PAGED_QUERY;
      //时间参数
      if (queryStartDate && queryEndDate) {
        //开始时间
        var formatStartDate = $filter('date')(queryStartDate, 'yyyy-MM-dd HH:mm:ss');
        restCallURL += "?startDate=" + formatStartDate;

        //结束时间
        var formatEndDate = $filter('date')(queryEndDate, 'yyyy-MM-dd HH:mm:ss');
        restCallURL += "&endDate=" + formatEndDate;
      } else {
        Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
        return;
      }

      if (deviceNum) {
        restCallURL += "&deviceNum=" + deviceNum;
      }

      console.log(restCallURL);

      var pageUrl = page || 0;
      var sizeUrl = size || vm.pageSize;
      var sortUrl = sort || "dataGenerateTime,desc";
      restCallURL += "&page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        if (data.content.length <= 0) {
          Notification.warning("暂无数据！");
          return;
        }
        vm.deviceHistoryRunData = new NgTableParams({}, {dataset: data.content});
        vm.totalElements = data.totalElements;
        vm.currentPage = data.number + 1;
      }, function (reason) {
        serviceResource.handleRsp("获取数据失败", reason);
        vm.deviceInfoList = null;
      });
    }

    vm.getHistoryRunData(0,vm.pageSize,'dataGenerateTime,desc',vm.deviceInfo.deviceNum,vm.queryStartDate,vm.queryEndDate);
  }
})();
