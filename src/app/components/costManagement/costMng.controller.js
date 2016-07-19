
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('costMngController', costMngController);

  /** @ngInject */
  function costMngController($rootScope,$scope,$timeout,$uibModal,$filter ,treeFactory,NgTableParams, ngTableDefaults,Notification,serviceResource,DEFAULT_SIZE_PER_PAGE,COST_URL) {

    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //初始化查询参数
    vm.fleetRecord={

    };

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];


    vm.buildQueryUrl2=function(URL,fleetRecord){
      var restCallURL = URL+"?1=1";

      if (null != fleetRecord) {
        if (null != fleetRecord.deviceNum&&fleetRecord.deviceNum!="") {
          restCallURL += "search_LIKE_machineEntity.deviceinfo.deviceNum=" +$filter('uppercase')(fleetRecord.deviceNum);
        }
        if (null != fleetRecord.licenseId&&fleetRecord.licenseId!="") {
          restCallURL += "&search_LIKE_machineEntity.licenseId=" + fleetRecord.licenseId;
        }
      }

      if (null != vm.org&&null != vm.org.id) {
        restCallURL += "&search_EQ_orgEntity.id=" + vm.org.id;
      }
//      restCallURL+="&search_DGTE_endDate="+$filter('date')(vm.startDate,'yyyy-MM-dd');
 //     restCallURL+="&search_DLTE_endDate="+$filter('date')(vm.endDate,'yyyy-MM-dd');

      return restCallURL;
    }
    //查询条件相关

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
      date.setDate(date.getDate()-30);  //默认查询最近一个月的异常数据
      vm.startDate=date;
      vm.endDate=new Date();
    }



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
      treeFactory.treeShow();
    }

    //选中组织模型赋值
    $rootScope.$on('orgSelected', function (event, data) {
      vm.org = data;
    });


    vm.query = function(page,size,sort,fleetRecord){

      var restCallURL=vm.buildQueryUrl2(COST_URL,fleetRecord);

      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "&page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;


      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        vm.tableParams = new NgTableParams({
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取车队记录数据失败");
      });
    };

    vm.initDate();


    //重置查询框
    vm.reset = function () {
      vm.fleetRecord = null;
      vm.org=null;
      vm.initDate();

    }




    vm.selectQuery=function(fleetRecord){
      vm.query(0,10,null,fleetRecord);
    }


    vm.selectQuery(null);



  }
})();
