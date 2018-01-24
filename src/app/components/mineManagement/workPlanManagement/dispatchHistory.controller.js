/**
 *
 * @author syLong
 * @create 2018-01-16 19:00
 * @email  yalong.shang@nvr-china.com
 * @description
 */
(function () {
    'use strict';

    angular
        .module('GPSCloud')
        .controller('dispatchHistoryController', dispatchHistoryController);

    function dispatchHistoryController($rootScope, $scope, Notification, $uibModal, serviceResource, $confirm, languages, NgTableParams,
                                       ngTableDefaults, minemngResource, DEFAULT_MINSIZE_PER_PAGE, MINEMNG_DISPATCH_RECORD) {
      var vm = this;
      vm.userInfo = $rootScope.userInfo;
      ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;
      ngTableDefaults.settings.counts = [];

      vm.dispatchRecordPage = {
        totalElements: 0
      };

      vm.initDate = function () {
        var startDate = new Date();
        startDate.setDate(startDate.getDate() - 2);
        vm.startDate = startDate;
        vm.endDate = new Date();
      };
      vm.initDate();


      vm.startDateOpenStatus = false;
      vm.openStartDate = function () {
        vm.startDateOpenStatus = true;
      };
      vm.endDateOpenStatus = false;
      vm.openEndDate = function () {
        vm.endDateOpenStatus = true;
      };
      vm.dateOptions = {
        dateDisabled: function(data) {
          var date = data.date;
          var mode = data.mode;
          if(new Date().getTime() < date.getTime()) {
            return mode === 'day' && (date.getTime());
          }
        },
        formatYear: 'yyyy',
        startingDay: 1
      };

      /**
       * 获取调度类型列表
       */
      var dispatchTypeListPromise = minemngResource.getDispatchTypeList();
      dispatchTypeListPromise.then(function (data) {
        vm.dispatchTypeList = data;
      }, function (reason) {
        Notification.error(reason.data);
      });

      /**
       * 分页查询
       * @param page
       * @param size
       * @param sort
       */
      vm.query = function (page, size, sort) {
        var restCallURL = MINEMNG_DISPATCH_RECORD;
        var pageUrl = page || 0;
        var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
        var sortUrl = sort || "record_time";
        restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
        if(vm.dispatchType != null && vm.dispatchType !== "" && vm.dispatchType !== "undefined") {
          restCallURL += "&type=" + vm.dispatchType;
        }
        if (vm.startDate) {
          var startDate = serviceResource.getChangeChinaTime(vm.startDate);
          restCallURL += "&startDate=" + startDate.getFullYear() + '-' + (startDate.getMonth() + 1) + '-' + startDate.getDate();
        }
        if (vm.endDate) {
          var endDate = serviceResource.getChangeChinaTime(vm.endDate);
          endDate = new Date(endDate.getTime()+1000*3600*24);
          restCallURL += "&endDate=" + endDate.getFullYear() + '-' + (endDate.getMonth() + 1) + '-' + endDate.getDate();
        }

        var rspData = serviceResource.restCallService(restCallURL, "GET");
        rspData.then(function (data) {
          if (data.content.length > 0) {
            vm.dispatchRecordTableParams = new NgTableParams({}, {
              dataset: data.content
            });
            vm.dispatchRecordPage = data.page;
            vm.dispatchRecord_pagenumber = data.page.number + 1;
          } else {
            Notification.warning(languages.findKey('noDataYet'));
            vm.dispatchRecordTableParams = new NgTableParams({},{
              dataset: null
            });
            vm.dispatchRecordPage.totalElements = 0;
          }
        }, function (reason) {
          Notification.error(reason);
        });
      };
      vm.query(null, null, null);


      vm.reset = function () {
        vm.dispatchType = null;
        vm.initDate();
      }
    }
})();