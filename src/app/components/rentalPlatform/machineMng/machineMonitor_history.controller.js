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
  function machineMonitorHistoryController($filter, sharedDeviceInfoFactory, Notification, serviceResource, NgTableParams, RENTAL_DEVCE_DATA_PAGED_QUERY,languages) {
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

    vm.startDateOpenStatusDeviceData = {
      opened: false
    };
    vm.endDateOpenStatusDeviceData = {
      opened: false
    };

    vm.startDateOpenDeviceData = function ($event) {
      vm.startDateOpenStatusDeviceData.opened = true;
    };
    vm.endDateOpenDeviceData = function ($event) {
      vm.endDateOpenStatusDeviceData.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    vm.timezone='new Date(2017,1,1).toString().match(/\+[0-9]+|\-[0-9]+/)';

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
      if (queryStartDate) {
        queryStartDate = serviceResource.getChangeChinaTime(queryStartDate);
        var startMonth = queryStartDate.getMonth() + 1;  //getMonth返回的是0-11
        var startDateFormated = queryStartDate.getFullYear() + '-' + startMonth + '-' + queryStartDate.getDate() + ' ' + queryStartDate.getHours() + ':' + queryStartDate.getMinutes() + ':' + queryStartDate.getSeconds();
        if (restCallURL) {
          restCallURL += "?startDate=" + startDateFormated;
        }
        else {
          restCallURL += "startDate=" + startDateFormated;
        }
      }else {
        Notification.error(languages.findKey('theInputTimeFormatIsIncorrect')+","+languages.findKey('theFormatIs')+":HH:mm:ss,如09:32:08(9点32分8秒)");
        return;
      }

      if (queryEndDate) {
        queryEndDate = serviceResource.getChangeChinaTime(queryEndDate);
        var endMonth = queryEndDate.getMonth() + 1;  //getMonth返回的是0-11
        var endDateFormated = queryEndDate.getFullYear() + '-' + endMonth + '-' + queryEndDate.getDate() + ' ' + queryEndDate.getHours() + ':' + queryEndDate.getMinutes() + ':' + queryEndDate.getSeconds();
        if (restCallURL) {
          restCallURL += "&endDate=" + endDateFormated;
        }
        else {
          restCallURL += "endDate=" + endDateFormated;
        }
      }else {
        Notification.error(languages.findKey('theInputTimeFormatIsIncorrect')+","+languages.findKey('theFormatIs')+":HH:mm:ss,如09:32:08(9点32分8秒)");
        return;
      }

      if (deviceNum) {
        restCallURL += "&deviceNum=" + deviceNum;
      }
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

   // vm.getHistoryRunData(0,vm.pageSize,'dataGenerateTime,desc',vm.deviceInfo.deviceNum,vm.queryStartDate,vm.queryEndDate);

  }
})();
