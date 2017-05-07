(function() {
  'use strict';

  angular
  .module('GPSCloud')
  .controller('fuelConsumptionController', fuelConsumptionController);

  /** @ngInject */
  function fuelConsumptionController($rootScope,$filter ,treeFactory,NgTableParams, ngTableDefaults,Notification,serviceResource,DEFAULT_SIZE_PER_PAGE,FUEL_CONSUMPTION_QUERY,FUEL_CONSUMPTION_STATISTICS) {

    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //初始化查询参数
    vm.fuelRecord = {

    };

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];


    //日期控件相关
    //date picker
    vm.activeTimeStartOpenStatus = {
      opened: false
    };

    vm.activeTimeStartOpen = function ($event) {
      vm.activeTimeStartOpenStatus.opened = true;
    };

    vm.activeTimeEndOpenStatus = {
      opened: false
    };

    vm.activeTimeEndOpen = function ($event) {
      vm.activeTimeEndOpenStatus.opened = true;
    };

    vm.initDate=function(){
      var date = new Date();
      date.setDate(date.getDate()-10);  //默认查询最近10天的异常数据
      vm.startDate=date;
      vm.endDate=new Date();
    };


    // 日期控件相关
    // date picker
    vm.startDateOpenStatus = {
      opened: false
    };

    vm.startDateOpen = function ($event) {
      vm.startDateOpenStatus.opened = true;
    };

    vm.endDateOpenStatus = {
      opened: false
    };

    vm.endDateOpen = function ($event) {
      vm.endDateOpenStatus.opened = true;
    };


    //组织树的显示
    vm.openTreeInfo= function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org = selectedItem;
      });
    };

    vm.query = function(page,size,sort,fuelRecord){
      var restCallURL = FUEL_CONSUMPTION_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || 10;
      var sortUrl = sort || "workDate,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if(null != fuelRecord) {
        if(null != fuelRecord.deviceNum && "" != fuelRecord.deviceNum) {
          restCallURL += "&search_LIKES_deviceNum=" + $filter('uppercase')(fuelRecord.deviceNum);
        }
        if(null != fuelRecord.licenseId && "" != fuelRecord.licenseId) {
          restCallURL += "&search_LIKES_licenseId=" + fuelRecord.licenseId;
        }
        if(null != fuelRecord.type && "" != fuelRecord.type){
          restCallURL += "&search_EQ_type=" + fuelRecord.type;
        }
      }

      if (null != vm.org&&null != vm.org.id) {
        restCallURL += "&search_EQ_organization.id=" + vm.org.id;
      }

      restCallURL+="&search_DGT_workDate="+$filter('date')(vm.startDate,'yyyy-MM-dd');
      restCallURL+="&search_DLT_workDate="+$filter('date')(vm.endDate,'yyyy-MM-dd');

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取油耗记录数据失败");
      });
    };

    vm.initDate();
    vm.query(0,10,null,null);

    //重置查询框
    vm.reset = function () {
      vm.fuelRecord = null;
      vm.org = null;
      vm.initDate();
    };

    vm.statisticsStartDateOpenStatus = {
      opened: false
    };

    vm.statisticsStartDateOpen = function ($event) {
      vm.statisticsStartDateOpenStatus.opened = true;
    };

    vm.statisticsEndDateOpenStatus = {
      opened: false
    };

    vm.statisticsEndDateOpen = function ($event) {
      vm.statisticsEndDateOpenStatus.opened = true;
    };

    /**
     * 统计历史油耗
     */
    vm.historyStatistics = function (statistics) {
      if(null == statistics) {
        Notification.warning("请录入信息");
        return;
      }
      if(null == statistics.deviceNum || "" == statistics.deviceNum) {
        Notification.warning("请输入设备号");
        return;
      }
      if(null == statistics.startDate || "" == statistics.startDate ||
        null == statistics.endDate || "" == statistics.endDate) {
        Notification.warning("请录入起止时间");
        return;
      }

      var statisticsVo = {
        startDate : $filter('date')(statistics.startDate,'yyyy-MM-dd'),
        endDate : $filter('date')(statistics.endDate,'yyyy-MM-dd'),
        deviceNum : $filter('uppercase')(statistics.deviceNum)
      };
      var rspData = serviceResource.restUpdateRequest(FUEL_CONSUMPTION_STATISTICS, statisticsVo);
      rspData.then(function (data) {
        if(data.code == 0) {
          Notification.success(data.content);
        } else {
          Notification.error(data.message);
        }
      }, function (reason) {
        Notification.error(reason.data.message);
      })
    };

  }
})();
