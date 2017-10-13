/**
 * Created by xiaopeng on 16-12-27.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('smsSendReportController', smsSendReportController);

  /** @ngInject */
  function smsSendReportController($rootScope, languages,$scope ,$filter, NgTableParams,ngTableDefaults, Notification, serviceResource, SMS_SEND_REPORT_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    ngTableDefaults.settings.counts = [];

    // 默认查询7天
    $scope.reportTypeList=[{
      type:5,name:languages.findKey('dailyReport')
    },{
      type:3,name:languages.findKey('monthlyReport')
    },{
      type:7,name:languages.findKey('SMSType')
    }];

    // 默认查询7天 日报
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    $scope.queryDate = {
      startDate: startDate,
      endDate: new Date(),
      reportType: $scope.reportTypeList[0].type
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


    vm.query = function (queryDate) {

      var restCallURL = SMS_SEND_REPORT_URL;

      if (null != queryDate && null != queryDate.startDate && null != queryDate.endDate && null != queryDate.reportType) {
        restCallURL += "?reportType=" + queryDate.reportType;
        restCallURL += "&startDate=" + $filter('date')(queryDate.startDate, 'yyyy-MM-dd');
        restCallURL += "&endDate=" + $filter('date')(queryDate.endDate, 'yyyy-MM-dd');

        var rspData = serviceResource.restCallService(restCallURL, "QUERY");
        rspData.then(function (data) {
          var dataList = data;
          vm.sendSuccess = 0;
          vm.sendFail = 0;
          vm.sendTotal = 0;

          for(var i=0; i<data.length;i++){
            vm.sendSuccess = vm.sendSuccess + dataList[i].sendSuccess;
            vm.sendFail = vm.sendFail + dataList[i].sendFail;
            vm.sendTotal = vm.sendTotal + dataList[i].sendTotal;
          }
          vm.tableParams = new NgTableParams({
            // initial sort order
            // sorting: { name: "desc" }
            count: data.length
          }, {
            dataset: data
          });

        }, function (reason) {
          Notification.error("获取数据失败");
        });

      }

    }



    vm.reset = function () {
      $scope.queryDate = {
        startDate: startDate,
        endDate: new Date(),
        reportType: $scope.reportTypeList[0].type
      };
    }

    vm.query($scope.queryDate);

    $scope.$watch("queryDate",function (oldValue,newValue) {

      if(oldValue.reportType!=newValue.reportType){
        vm.query($scope.queryDate);

      }
    },true);

  }
})();
