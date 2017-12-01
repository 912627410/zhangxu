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
    vm.startDateDeviceData = date;
    //结束时间
    vm.endDateDeviceData = new Date();

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
      //时间参数
      if (queryStartDate && queryEndDate) {
        //开始时间
        var formatStartDate = $filter('date')(queryStartDate, 'yyyy-MM-dd HH:mm:ss');
        restCallURL += "?startDateDeviceData=" + formatStartDate;

        //结束时间
        var formatEndDate = $filter('date')(queryEndDate, 'yyyy-MM-dd HH:mm:ss');
        restCallURL += "&endDateDeviceData=" + formatEndDate;
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

   // vm.getHistoryRunData(0,vm.pageSize,'dataGenerateTime,desc',vm.deviceInfo.deviceNum,vm.queryStartDate,vm.queryEndDate);


    vm.getDeviceData = function (page, size, sort,totalElements,newReq, deviceNum,versionNum, startDate, endDate) {
      var filterTerm;
      if (deviceNum) {
        filterTerm = "deviceNum=" + deviceNum;
      }

      if (versionNum){
        filterTerm+="&versionNum=" + versionNum;
      }

      if (startDate) {
        startDate = serviceResource.getChangeChinaTime(startDate);
        var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
        var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate() + ' ' + startDate.getHours() + ':' + startDate.getMinutes() + ':' + startDate.getSeconds();
        if (filterTerm) {
          filterTerm += "&startDate=" + startDateFormated
        }
        else {
          filterTerm += "startDate=" + startDateFormated;
        }
      } else {
        Notification.error(languages.findKey('theInputTimeFormatIsIncorrect')+","+languages.findKey('theFormatIs')+":HH:mm:ss,如09:32:08(9点32分8秒)");
        return;
      }
      if (endDate) {
        endDate = serviceResource.getChangeChinaTime(endDate);
        var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
        var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate() + ' ' + endDate.getHours() + ':' + endDate.getMinutes() + ':' + endDate.getSeconds();
        if (filterTerm) {
          filterTerm += "&endDate=" + endDateFormated;
        }
        else {
          filterTerm += "endDate=" + endDateFormated;
        }
      } else {
        Notification.error(languages.findKey('theInputTimeFormatIsIncorrect')+","+languages.findKey('theFormatIs')+":HH:mm:ss,如09:32:08(9点32分8秒)");
        return;
      }
      if (!newReq){
        filterTerm += "&totalElements=" + totalElements;
      }
      var deviceDataPromis = serviceResource.queryDeviceData(page, size, sort, filterTerm);
      deviceDataPromis.then(function (data) {
          vm.deviceDataList = data.content;
          vm.deviceDataPage = data.page;
          vm.deviceDataPageNumber = data.page.number+1 ;
          vm.totalElements=data.page.totalElements;
          // vm.deviceDataBasePath = DEVCE_DATA_PAGED_QUERY;
          if (vm.deviceDataList.length == 0) {
            Notification.warning(languages.findKey('deviceIsNotHistoricalDataForThisTimePeriodPleaseReselect'));
          }
        }, function (reason) {
          Notification.error(languages.findKey('historicalDataAcquisitionDeviceFailure'));
        }
      )
      //vm.refreshDOM();
    }




  }
})();
