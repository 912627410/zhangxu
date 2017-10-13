/**
 * Created by shuangshan on 16/2/10.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('maintainNoticeController', maintainNoticeController);

  /** @ngInject */
  function maintainNoticeController($rootScope,$window,$timeout,NgTableParams,serviceResource,$uibModalInstance,Notification,NOTICE_PAGE_URL,NOTIFICATION_PAGED_URL,DEFAULT_NOTIFICATION_SORT_BY,languages,deviceinfo) {
    var vm = this;
    //modal打开是否有动画效果
    vm.deviceinfo = deviceinfo;
    vm.animationsEnabled = true;
    vm.maintainNotificationNumber = 0;   //所有的保养notification数量

    var userInfo = $rootScope.userInfo;

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };


    //查询保养提醒信息
    vm.queryMaintainNotification=function(page,size,sort,deviceinfo){

      var restCallURL = NOTICE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || 5;
      var sortUrl = sort || DEFAULT_NOTIFICATION_SORT_BY;
      restCallURL += "?page=" + pageUrl  + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != deviceinfo && null!=deviceinfo.id) {
        restCallURL += "&search_EQ_deviceinfoEntity.id=" +deviceinfo.id;
        restCallURL += "&search_EQ_type=01";
      }

      var rspdata = serviceResource.restCallService(restCallURL, "GET");
      rspdata.then(function (data) {
        vm.noticeList = data.content;
        vm.tableParams = new NgTableParams({},
          {
            dataset: data.content
          });
        vm.page = data.page;
        vm.pagenumber = data.page.number + 1;

      },function (reason) {

      })
    }

    vm.queryMaintainNotification(null,null,null,vm.deviceinfo);


    //设置为已处理
    vm.updateProcessStatus = function(notification,refreshStatistics){
      if (notification){
        if (notification.processStatus == 0){
          notification.processStatus = 1;
        }
        else{
          notification.processStatus = 0;
        }

        var URL = NOTIFICATION_PAGED_URL + "?id=" + notification.id;
        var updatePromis = serviceResource.restUpdateRequest(URL,notification);
        updatePromis.then(function (data){
          if (notification.processStatus == 1){
            $rootScope.notificationNumber = Number($rootScope.notificationNumber) -1;
          }
          else{
            $rootScope.notificationNumber = Number($rootScope.notificationNumber) + 1;
          }
          $window.sessionStorage["notificationNumber"] = $rootScope.notificationNumber;
          if (refreshStatistics){
           // vm.queryMaintainNotification(null,null,null,vm.deviceinfo);
          }
          //Notification.success('设置处理状态成功');
        },function(reason){
          if (notification.processStatus == 0){
            notification.processStatus = 1;
          }
          else{
            notification.processStatus = 0;
          }
          Notification.error(languages.findKey('setTheProcessingStateOfFailure'));
        })
      }
      else{
        Notification.error(languages.findKey('setTheProcessingStateOfFailure'));
      }
    };

  }
})();
