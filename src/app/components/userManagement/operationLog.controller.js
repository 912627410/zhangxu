/**
 * Created by yaLong on 17-2-6.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('operationLogController', operationLogController);

  /** @ngInject */
  function operationLogController($rootScope, $uibModalInstance, NgTableParams, Notification, ngTableDefaults, serviceResource, userinfo, DEFAULT_SIZE_PER_PAGE, OPERATION_LOG_QUERY) {
    var vm = this;
    vm.userinfo = userinfo;
    vm.operatorInfo = $rootScope.userInfo;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 2);
    vm.startDate = startDate;
    vm.endDate = new Date();

    vm.startDateDeviceData = startDate;
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

    vm.query = function (page, size, sort, startDate, endDate) {
      var restCallURL = OPERATION_LOG_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "recordTime,desc";
      restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;
      restCallURL += "&search_EQ_operator.id=" + userinfo.id;
      if(startDate > vm.maxDate || endDate > vm.maxDate) {
        Notification.error("您已穿越，请重新选择日期！");
        return;
      }
      if (startDate) {
        startDate = new Date(startDate.getTime() + 1000*3600*24);
        var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
        var startDateFormated = startDate.getFullYear() + '-' + addZero(startMonth, 2) + '-' + addZero(startDate.getDate(), 2);
        restCallURL += "&search_DGTE_recordTime=" + startDateFormated;
      }
      if (endDate) {
        var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
        var endDateFormated = endDate.getFullYear() + '-' + addZero(endMonth, 2) + '-' + addZero(endDate.getDate(), 2);
        restCallURL += "&search_DLTE_recordTime=" + endDateFormated;
      }
      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        if (data.content.length == 0) {
          Notification.warning('无操作日志');
        }
        vm.tableParams = new NgTableParams({
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error(languages.findKey('rentalGetDataError'));
      });
    };

    vm.query(null,8,null,vm.startDateDeviceData,vm.endDateDeviceData);

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    }

  }
})();
