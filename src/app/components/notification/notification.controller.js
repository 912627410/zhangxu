/**
 * Created by shuangshan on 16/2/10.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('NotificationController', NotificationController);

  /** @ngInject */
  function NotificationController($rootScope,$window,serviceResource,Notification,NOTIFICATION_PAGED_URL) {
    var vm = this;
    //modal打开是否有动画效果
    vm.animationsEnabled = true;
    vm.classNoProcessedMsg = "active";
    var userInfo = $rootScope.userInfo;
    vm.queryNotificationInfo = function(page,size,sort,queryCondition,filterCondition){
      var filterTerm;
      if (queryCondition){
        filterTerm = queryCondition;
      }
      if (filterCondition){
        if(filterTerm){
          filterTerm += "&filter=" + queryCondition;
        }
        else{
          filterTerm = "filter=" + queryCondition;
        }
      }
      var notificationPromis = serviceResource.queryNotification(page, size, sort, filterTerm);
      notificationPromis.then(function (data) {
          vm.notificationList = data.content;
          vm.page = data.page;
          vm.pagenumber = data.page.number + 1;
          vm.basePath = NOTIFICATION_PAGED_URL;
        }, function (reason) {
          Notification.error('获取提醒信息失败');
        }
      )
    };

    vm.updateProcessStatus = function(notification){
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
          //Notification.success('设置处理状态成功');
        },function(reason){
          if (notification.processStatus == 0){
            notification.processStatus = 1;
          }
          else{
            notification.processStatus = 0;
          }
          Notification.error('设置处理状态失败');
        })
      }
      else{
        Notification.error('设置处理状态失败');
      }
    };


    vm.checkAll = function(){
      vm.notificationList.forEach(function(notification){
        notification.checked = true;
      })
    }

    //查询所有未处理信息
    vm.queryNoProcessedNotification=function(page,size,sort){
      vm.classNoProcessedMsg = "active";
      vm.classNoConnectMsg = "";
      vm.classAllMsg = "";
      vm.classMaintainMsg = "";

      vm.queryNotificationInfo(page,size,sort,"processStatus=0");
    }

    //查询保养提醒信息
    vm.queryMaintainNotification=function(page,size,sort){
      vm.classMaintainMsg = "active";
      vm.classNoProcessedMsg = "";
      vm.classNoConnectMsg = "";
      vm.classAllMsg = "";
      vm.queryNotificationInfo(page,size,sort,"processStatus=0&type=01");
    }

    //查询长时间未连接设备
    vm.queryNoConnectNotification=function(page,size,sort,queryCondition){
      vm.classAllMsg = "";
      vm.classNoConnectMsg = "active";
      vm.classMaintainMsg = "";
      vm.classNoProcessedMsg = "";
      vm.queryNotificationInfo(page,size,sort,"processStatus=0&type=02");
    }

    //查询所有信息
    vm.queryAllNotification=function(page,size,sort,queryCondition){
      vm.classAllMsg = "active";
      vm.classNoConnectMsg = "";
      vm.classMaintainMsg = "";
      vm.classNoProcessedMsg = "";
      vm.queryNotificationInfo(page,size,sort,null);
    }

    vm.queryNoProcessedNotification(0,null,null,null);


  }
})();
