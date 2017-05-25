/**
 * Created by yaLong on 17-5-17.
 */
(function() {
  'use strict';

  angular
  .module('GPSCloud')
  .controller('profitController', profitController);

  /** @ngInject */
  function profitController($rootScope, $filter, Notification, serviceResource, PROFIT_STATISTICS_URL) {

    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //初始化查询参数
    vm.profitConfig = {
      type: 2 // 班次默认全天
    };

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
      date.setDate(date.getDate()-1);  //默认统计最近3天的数据
      vm.startDate = date;
      vm.endDate = date;
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


    vm.query = function(profitConfig){
      var restCallURL = PROFIT_STATISTICS_URL;
      restCallURL += "?startDate=" + $filter('date')(vm.startDate,'yyyy-MM-dd');
      restCallURL += "&endDate=" + $filter('date')(vm.endDate,'yyyy-MM-dd');

      if(null != profitConfig) {
        if((null == profitConfig.deviceNum || "" == profitConfig.deviceNum) && (null == profitConfig.licenseId || "" == profitConfig.licenseId)) {
          Notification.warning("请输入设备编号或车号!");
          return;
        }
        if(null != profitConfig.deviceNum && "" != profitConfig.deviceNum) {
          restCallURL += "&deviceNum=" + $filter('uppercase')(profitConfig.deviceNum);
        }
        if(null != profitConfig.licenseId && "" != profitConfig.licenseId) {
          restCallURL += "&licenseId=" + $filter('uppercase')(profitConfig.licenseId);
        }
        if(null != profitConfig.incomePerTrip && "" != profitConfig.incomePerTrip) {
          restCallURL += "&incomePerTrip=" + profitConfig.incomePerTrip;
        } else {
          Notification.warning("请输入每趟的收入!");
          return;
        }

        if(null != profitConfig.fuelTankVolume && "" != profitConfig.fuelTankVolume) {
          restCallURL += "&fuelTankVolume=" + profitConfig.fuelTankVolume;
        } else {
          Notification.warning("请输入油箱的体积!");
          return;
        }

        if(null != profitConfig.oilPrices && "" != profitConfig.oilPrices) {
          restCallURL += "&oilPrices=" + profitConfig.oilPrices;
        } else {
          Notification.warning("请输入油价!");
          return;
        }

        if(null != profitConfig.depreciation && "" != profitConfig.depreciation) {
          restCallURL += "&depreciation=" + profitConfig.depreciation;
        } else {
          Notification.warning("请输入折旧!");
          return;
        }

        if(null != profitConfig.wages && "" != profitConfig.wages) {
          restCallURL += "&wages=" + profitConfig.wages;
        } else {
          Notification.warning("请输入工资!");
          return;
        }

        if(null != profitConfig.type && "" != profitConfig.type){
          restCallURL += "&type=" + profitConfig.type;
        } else {
          Notification.warning("请选择班次!");
          return;
        }
      } else {
        Notification.warning("请录入信息!");
        return;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        if(data.code == 0) {
          vm.deviceNum = data.content.deviceNum;
          vm.licenseId = data.content.licenseId;
          vm.fuelConsumption = $filter('number')(data.content.fuelConsumption, 2);
          vm.timesNumber = data.content.timesNumber;
          vm.profit = $filter('number')(data.content.profit, 2);

          Notification.success("查询成功!");
        } else {
          vm.deviceNum = null;
          vm.licenseId = null;
          vm.fuelConsumption = null;
          vm.timesNumber = null;
          vm.profit = null;

          Notification.error(data.content);
        }
      }, function (reason) {
        Notification.error("查询失败!");
      });
    };

    vm.initDate();

    //重置查询框
    vm.reset = function () {
      vm.profitConfig = null;
      vm.initDate();
    };

  }
})();
