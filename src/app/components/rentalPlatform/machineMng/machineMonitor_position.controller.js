/**
 * Created by xielongwang on 2017/8/17.
 */
(function () {
  'use strict';
  angular
    .module('GPSCloud')
    .controller('machineMonitorPositionController', machineMonitorPositionController);

  /** @ngInject */
  function machineMonitorPositionController($rootScope, $window, $scope, $http, $location, $timeout, $filter, serviceResource, Notification, NgTableParams,
                                            ngTableDefaults, languages, sharedDeviceInfoFactory, RENTAL_LOCUS_DATA) {
    var vm = this;
    //获取共享deviceinfo
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
     * 获取设备定位数据 http://127.0.0.1:8080/rental/device-locus-data?page=xx&size=xx&total_elements=xx&device_num=xx&sort=locate_date_time,desc
     *
     * @param pageNum 页码
     * @param pageSize 每页多少条数据
     * @param filter 筛选条件
     * @param queryStartDate 开始时间
     * @param queryEndDate  结束时间
     */
    vm.getLocateDateByDate = function (pageNum, pageSize, totalElements, filter, deviceNum, queryStartDate, queryEndDate) {
      var restCallURL = RENTAL_LOCUS_DATA;
      //时间参数
      if (queryStartDate && queryEndDate) {
        //开始时间
        var formatDate = $filter('date')(queryStartDate, 'yyyy-MM-dd HH:mm:ss');
        restCallURL += "?query_start_date=" + formatDate;

        //结束时间
        var formatEndDate = $filter('date')(queryEndDate, 'yyyy-MM-dd HH:mm:ss');
        restCallURL += "&query_end_date=" + formatEndDate;
      } else {
        Notification.error("输入的时间格式有误,格式为:HH:mm:ss,如09:32:08(9点32分8秒)");
        return;
      }
      //分页参数
      var pageNum = pageNum || 0;
      var pageSize = pageSize || vm.pageSize;
      restCallURL += "&page=" + pageNum + '&size=' + pageSize;
      if (totalElements != null && totalElements != undefined) {
        restCallURL += "&total_elements=" + totalElements;
      }
      //设备号
      if (deviceNum != null && deviceNum != undefined) {
        restCallURL += "&device_num=" + deviceNum;
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
        vm.deviceLocateData = new NgTableParams({}, {dataset: data.content});
        vm.totalElements = data.totalElements;
        vm.currentPage = data.number + 1;
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    }

    /*加载前8条*/
    vm.getLocateDateByDate(0, vm.pageSize, vm.pageSize, 'locate_date,desc', vm.deviceInfo.deviceNum, new Date(1970,0,1,0,0,0), new Date());

  }
})();
