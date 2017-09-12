/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('processAlarmInfoController', processAlarmInfoController);

  /** @ngInject */
  function processAlarmInfoController($rootScope, $scope, $window, $location,notification,notifications,$uibModalInstance, $anchorScroll, $uibModal, serviceResource, languages, commonFactory,RENTAL_PRCESS_ALARM,RENTAL_PRCESS_ALARMS) {
    var vm = this;
    var userInfo = $rootScope.userInfo;
    vm.notificationProcess={};

    /**
     * 关闭对话框
     */
    vm.cancel=function () {
      $uibModalInstance.dismiss('cancel');
    }


    /**
     * 报警消息处理
     */
    vm.processAlarm=function () {
      var notificationProcessCopy={};
      notificationProcessCopy.processUser=userInfo.userdto.ssn;
      //判断处理单个消息
      if (notification!=null && notifications==null){
        angular.extend(notificationProcessCopy, notification, vm.notificationProcess);
        vm.processSingeAlarm(notificationProcessCopy);
        return;
      }

      //处理多个消息
      angular.extend(notificationProcessCopy,vm.notificationProcess, notificationProcessCopy);
      notificationProcessCopy.notifications=notifications;
      vm.processMultipleAlarm(notificationProcessCopy);
    }

    /**
     * 处理单个报警消息
     * @param notificationProcess
     */
    vm.processSingeAlarm=function (notificationProcess) {
      var processPromis = serviceResource.restCallService(RENTAL_PRCESS_ALARM,"ADD",notificationProcess);
      processPromis.then(function (data) {

      },function (reason) {

      })
    }

    /**
     *
     */
    vm.processMultipleAlarm=function (notifications) {
      var processPromis = serviceResource.restCallService(RENTAL_PRCESS_ALARMS,"ADD",notifications);
      processPromis.then(function (data) {

      },function (reason) {

      })
    }
  }
})();
