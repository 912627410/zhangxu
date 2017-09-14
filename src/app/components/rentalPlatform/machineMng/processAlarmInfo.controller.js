/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('processAlarmInfoController', processAlarmInfoController);

  /** @ngInject */
  function processAlarmInfoController($rootScope, $scope, $window, $location, notification, notifications, $uibModalInstance, $anchorScroll, $uibModal,Notification, serviceResource, languages, commonFactory, RENTAL_PRCESS_ALARM, RENTAL_PRCESS_ALARMS) {
    var vm = this;
    var userInfo = $rootScope.userInfo;
    var emailValidator = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
    var telephoneNoValidator = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
    vm.notificationProcess = {};

    /**
     * 关闭对话框
     */
    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    }


    /**
     * 报警消息处理
     */
    vm.processAlarm = function () {
      if (!vm.validator(vm.notificationProcess.receiver)) {
        Notification.error("请输入正确邮箱或者手机号多个使用逗号隔开!");
        return;
      }
      var notificationProcessCopy = {};
      notificationProcessCopy.processUser = userInfo.userdto.ssn;
      //判断处理单个消息
      if (notification != null && notifications == null) {
        vm.notificationProcess.alarmMsgId=notification.id;
        angular.extend(notificationProcessCopy, notification, vm.notificationProcess);
        vm.processSingeAlarm(notificationProcessCopy);
        return;
      }

      //处理多个消息
      angular.extend(notificationProcessCopy, vm.notificationProcess, notificationProcessCopy);
      notificationProcessCopy.notifications = notifications;
      vm.processMultipleAlarm(notificationProcessCopy);
    }

    /**
     * 处理单个报警消息
     * @param notificationProcess
     */
    vm.processSingeAlarm = function (notificationProcess) {
      var processPromis = serviceResource.restCallService(RENTAL_PRCESS_ALARM, "ADD", notificationProcess);
      processPromis.then(function (data) {
        if (data.content==true){
          notification.processStatus=true;
          $uibModalInstance.close(notification);
        }
      }, function (reason) {

      })
    }

    /**
     *处理多个报警信息
     */
    vm.processMultipleAlarm = function (notifications) {
      var processPromis = serviceResource.restCallService(RENTAL_PRCESS_ALARMS, "ADD", notifications);
      processPromis.then(function (data) {

      }, function (reason) {

      })
    }

    /**
     *验证邮箱和手机号
     */
    vm.validator = function (emailOrPhone) {
      if (emailOrPhone == null || emailOrPhone == undefined) {
        return false;
      }
      var smsArr = emailOrPhone.split(",");
      for (var index in smsArr) {
        if (!emailValidator.test(smsArr[index]) && !telephoneNoValidator.test(smsArr[index])) {
          return false;
        }
      }
      return true;
    }


  }
})();
