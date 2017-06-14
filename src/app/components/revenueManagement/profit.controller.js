/**
 * Created by yaLong on 17-5-17.
 */
(function() {
  'use strict';

  angular
  .module('GPSCloud')
  .controller('profitController', profitController);

  /** @ngInject */
  function profitController($rootScope, $filter, Notification, treeFactory, serviceResource, NgTableParams, ngTableDefaults, PROFIT_STATISTICS_URL, DEFAULT_SIZE_PER_PAGE) {

    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

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

    //组织树的显示
    vm.openTreeInfo= function() {
      treeFactory.treeShow(function (selectedItem) {
        vm.org =selectedItem;
      });
    };

    vm.query = function(profitConfig){
      var restCallURL = PROFIT_STATISTICS_URL;
      restCallURL += "?startDate=" + $filter('date')(vm.startDate,'yyyy-MM-dd');
      restCallURL += "&endDate=" + $filter('date')(vm.endDate,'yyyy-MM-dd');

      if(null != profitConfig) {
        if((null == profitConfig.deviceNum || "" == profitConfig.deviceNum)
          && (null == profitConfig.licenseId || "" == profitConfig.licenseId)
          && (null == vm.org || null == vm.org.id)) {
          Notification.warning("请输入设备编号,车号或选择车队!");
          return;
        }
        if(null != profitConfig.deviceNum && "" != profitConfig.deviceNum) {
          restCallURL += "&deviceNum=" + $filter('uppercase')(profitConfig.deviceNum);
        }
        if(null != profitConfig.licenseId && "" != profitConfig.licenseId) {
          restCallURL += "&licenseId=" + $filter('uppercase')(profitConfig.licenseId);
        }
        if(null != vm.org&&null != vm.org.id) {
          restCallURL += "&fleetId=" + vm.org.id;
        }

        if(null != profitConfig.incomePerTrip && "" != profitConfig.incomePerTrip) {
          restCallURL += "&incomePerTrip=" + profitConfig.incomePerTrip;
        } else {
          Notification.warning("请输入每趟的收入!");
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
          if(data.content.length == 0) {
            Notification.warning("查询结果为空！");
            return;
          }
          vm.tableParams = new NgTableParams({

          }, {
            dataset: data.content
          });

        } else {
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
      vm.org = null;
      vm.initDate();
    };

  }
})();
