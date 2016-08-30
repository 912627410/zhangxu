/**
 * Created by xiaopeng on 16-8-29.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('weightDataController', weightDataController);

  /** @ngInject */
  function weightDataController($rootScope, $scope, ngTableDefaults,NgTableParams, Notification, serviceResource, WEIGHTDATA_PAGE_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.weightData = {};

    ngTableDefaults.settings.counts = [];

    //日期控件相关
    //date picker
    vm.recordTimeStartOpenStatus = {
      opened: false
    };

    vm.recordTimeStartOpen = function ($event) {
      vm.recordTimeStartOpenStatus.opened = true;
    };

    vm.recordTimeEndOpenStatus = {
      opened: false
    };

    vm.recordTimeEndOpen = function ($event) {
      vm.recordTimeEndOpenStatus.opened = true;
    };


    var beginDate = new Date();
    var endDate = new Date();
    beginDate.setDate(beginDate.getDate()-5);  //默认查询5 day数据
    endDate.setDate(endDate.getDate()+1);  //默认查询5 day数据
    vm.weightData.recordTimeStart=beginDate;
    vm.weightData.recordTimeEnd=endDate;

    vm.query = function (page, size, sort, weightData) {
      var restCallURL = WEIGHTDATA_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 10;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if(weightData !=null && weightData.deviceNum!=null){
        restCallURL += "&search_LIKE_deviceNum=" + weightData.deviceNum;
      }

      if(weightData !=null && weightData.rfNum!=null){
        restCallURL += "&search_LIKE_rfNum=" + weightData.rfNum;
      }

      if(weightData !=null && weightData.recordTimeStart!=null){
        var recordTimeStartMonth = weightData.recordTimeStart.getMonth() +1;  //getMonth返回的是0-11
        var recordTimeStartDateFormated = weightData.recordTimeStart.getFullYear() + '-' + addZero(recordTimeStartMonth,2) + '-' + addZero(weightData.recordTimeStart.getDate(),2);
        restCallURL += "&search_DGTE_recordTime=" + recordTimeStartDateFormated;
      }

      if(weightData !=null && weightData.recordTimeEnd!=null){
        var recordTimeEndMonth = weightData.recordTimeEnd.getMonth() +1;  //getMonth返回的是0-11
        var recordTimeEndDateFormated = weightData.recordTimeEnd.getFullYear() + '-' + addZero(recordTimeEndMonth,2) + '-' + addZero(weightData.recordTimeEnd.getDate(),2);
        restCallURL += "&search_DLTE_recordTime=" + recordTimeEndDateFormated;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取称重数据失败");
      });
    };

    vm.query();

    //重置查询框
    vm.reset = function () {
      vm.weightData = {};
      var date = new Date();
      date.setDate(date.getDate()-1);  //默认查询1 day数据
      vm.weightData.recordTimeStart=date;
      vm.weightData.recordTimeEnd=new Date();
    }

  }
})();

