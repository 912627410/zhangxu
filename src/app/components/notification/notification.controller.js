/**
 * Created by shuangshan on 16/2/10.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('NotificationController', NotificationController);

  /** @ngInject */
  function NotificationController($rootScope,$window,$timeout,serviceResource,Notification,NOTIFICATION_PAGED_URL,languages) {
    var vm = this;
    //modal打开是否有动画效果
    vm.animationsEnabled = true;
    vm.classNoProcessedMsg = "active";
    var userInfo = $rootScope.userInfo;
    vm.noProcessNumber = 0;
    vm.allNotificationNumber = 0;   //所有的notification数量
    vm.noConnectionNotificationNumber = 0;   //所有的未连接notification数量
    vm.maintainNotificationNumber = 0;   //所有的保养notification数量
    vm.locationNotificationNumber = 0;   //所有的车辆位置信息notification数量

    var userInfo = $rootScope.userInfo;

    //查询notification的数量统计
    vm.queryNotificationStatistics = function(){
      vm.noProcessNumber = 0;
      vm.allNotificationNumber = 0;   //所有的notification数量
      vm.noConnectionNotificationNumber = 0;   //所有的未连接notification数量
      vm.maintainNotificationNumber = 0;   //所有的保养notification数量
      vm.locationNotificationNumber = 0;   //所有的车辆位置信息notification数量
      var notificationStatisticsPromis = serviceResource.queryNotificationStatistics();
      notificationStatisticsPromis.then(function (data) {
          var notificationStatisticsList = data;
          notificationStatisticsList.forEach(function(notification){
            if (notification.processStatus == 0){
              vm.noProcessNumber += notification.totalCount;
              if(notification.type == '01'){
                vm.maintainNotificationNumber += notification.totalCount;
              }
              if(notification.type == '02'){
                vm.noConnectionNotificationNumber += notification.totalCount;
              }
              if(notification.type == '03'){
                vm.locationNotificationNumber += notification.totalCount;
              }
            }
            vm.allNotificationNumber += notification.totalCount;
          })
          $rootScope.notificationNumber = vm.noProcessNumber;
          $window.sessionStorage["notificationNumber"] = $rootScope.notificationNumber;
        }, function (reason) {
          Notification.error(languages.findKey('getInformationToRemindTheNumberOfFailed'));
        }
      )
    };

    //查询未处理notification数据
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
          Notification.error(languages.findKey('获取提醒信息失败'));
        }
      )
    };
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
            vm.queryNotificationStatistics();
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

    //批量设置为已处理
    vm.batchUpdateProcessStatus = function(){
      var notificationList = vm.notificationList;
      if (notificationList){
        notificationList.forEach(function(notification){
          if (notification.checked && notification.processStatus == 0){
            vm.updateProcessStatus(notification,false);
          }
        });
        $timeout(function(){
          vm.queryNotificationStatistics();
          Notification.success(languages.findKey('batchSetToHaveTreatmentSuccess')+'!');
        })
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
      vm.classLocationMsg = "";
      vm.classAllMsg = "";
      vm.queryNotificationInfo(page,size,sort,"processStatus=0&type=01");
    }

    //查询长时间未连接设备
    vm.queryNoConnectNotification=function(page,size,sort,queryCondition){
      vm.classAllMsg = "";
      vm.classNoConnectMsg = "active";
      vm.classMaintainMsg = "";
      vm.classNoProcessedMsg = "";
      vm.classLocationMsg = "";
      vm.queryNotificationInfo(page,size,sort,"processStatus=0&type=02");
    }

    //查询设备位置报警
    vm.queryLocationNotification=function(page,size,sort,queryCondition){
      vm.classAllMsg = "";
      vm.classNoConnectMsg = "";
      vm.classMaintainMsg = "";
      vm.classNoProcessedMsg = "";
      vm.classLocationMsg = "active";
      vm.queryNotificationInfo(page,size,sort,"processStatus=0&type=03");
    }

    //查询所有信息
    vm.queryAllNotification=function(page,size,sort,queryCondition){
      vm.classAllMsg = "active";
      vm.classNoConnectMsg = "";
      vm.classMaintainMsg = "";
      vm.classNoProcessedMsg = "";
      vm.classLocationMsg = "";
      vm.queryNotificationInfo(page,size,sort,null);
    }

    vm.queryNoProcessedNotification(0,null,null,null);
    vm.queryNotificationStatistics();
  }
})();
