/**
 * Created by mengwei on 17-7-17.
 */
/**
 * Created by shuangshan on 16/1/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('ViewKeyInputConfirmationController', ViewKeyInputConfirmationController);

  /** @ngInject */
  function ViewKeyInputConfirmationController( $uibModalInstance, deviceinfo,VIEW_BIND_INPUT_MSG_URL,serviceResource,languages,Notification,queryCode,VIEW_UN_BIND_INPUT_MSG_URL,DEVCE_MONITOR_SINGL_QUERY,VIEW_LOCK_INPUT_MSG_URL,VIEW_UN_LOCK_INPUT_MSG_URL ,VIEW_CANCEL_LOCK_INPUT_MSG_URL) {
    var vm = this;
    vm.deviceinfo = deviceinfo;
    vm.queryCode = queryCode;
    vm.passwordNumber;
    vm.unBindTime;
    vm.deviceinfoMonitor;


    //格式化显示，使数字每4位以“-”连接
    vm.XReplace = function(str){
      var reg = new RegExp("(\\S{4})","g");
      return str.replace(reg,"$1-");
    }

    //获取剩余密码数
    var singlUrl = DEVCE_MONITOR_SINGL_QUERY + "?id=" + vm.deviceinfo.id;
    var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
    deviceinfoPromis.then(function (data) {
      vm.deviceinfoMonitor = data.content;
      if(vm.queryCode==1){
        vm.passwordNumber = vm.deviceinfoMonitor.bindCount;
      }else if(vm.queryCode==2){
        vm.unBindTime = vm.deviceinfoMonitor.unBindCount;
      } else if(vm.queryCode==3){
        vm.passwordNumber = vm.deviceinfoMonitor.forceLockCount;
      } else if(vm.queryCode==4){
        vm.passwordNumber = vm.deviceinfoMonitor.unlockCount;
      } else if(vm.queryCode==5){
        vm.passwordNumber = vm.deviceinfoMonitor.cancelAutoLockCount;
      }
    })



    vm.ok = function (deviceinfo) {
      //根据queryCode来判断是查看哪种信息数据
      if( vm.queryCode==1){
        var restURL = VIEW_BIND_INPUT_MSG_URL + "?devicenum=" + vm.deviceinfo.deviceNum;
        var rspData = serviceResource.restCallService(restURL, "GET");
        rspData.then(function (data) {
          var content = vm.XReplace(data.content);
          if(content.substr(content.length-1,1).indexOf("-")==0){
            content = content.substring(0,content.length-1);
          }
          if (data.content) {
            vm.bindKeyboardMsgIdx = data.content.substr(17, 1) + data.content.substr(22, 1);
          }
          $uibModalInstance.close(content);

        }, function (reason) {
          Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
        })
      }
      if( vm.queryCode==2 ){
        var restURL = VIEW_UN_BIND_INPUT_MSG_URL + "?devicenum=" + vm.deviceinfo.deviceNum;
        var rspData = serviceResource.restCallService(restURL, "GET");
        rspData.then(function (data) {
          var content = vm.XReplace(data.content);
          if(content.substr(content.length-1,1).indexOf("-")==0){
            content = content.substring(0,content.length-1);
          }

          if (data.content) {
            var idxTmp = data.content.substr(5, 1) + data.content.substr(10, 1);
            vm.unbindKeyboardMsgIdx = 50 - idxTmp;

            $uibModalInstance.close(content);
          }
        }, function (reason) {
          Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
        })
      }
      if( vm.queryCode==3){
        var restURL = VIEW_LOCK_INPUT_MSG_URL + "?devicenum=" + vm.deviceinfo.deviceNum;
        var rspData = serviceResource.restCallService(restURL, "GET");
        rspData.then(function (data) {
          var content = vm.XReplace(data.content);
          if(content.substr(content.length-1,1).indexOf("-")==0){
            content = content.substring(0,content.length-1);
          }

          if (data.content) {
            vm.lockKeyboardMsgIdx = data.content.substr(5, 1) + data.content.substr(10, 1);
          }
          $uibModalInstance.close(content);
        }, function (reason) {
          Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
        })
      }
      if(vm.queryCode==4){
        var restURL = VIEW_UN_LOCK_INPUT_MSG_URL + "?devicenum=" + vm.deviceinfo.deviceNum;
        var rspData = serviceResource.restCallService(restURL, "GET");
        rspData.then(function (data) {
          var content = vm.XReplace(data.content);
          if(content.substr(content.length-1,1).indexOf("-")==0){
            content = content.substring(0,content.length-1);
          }
          if (data.content) {
            vm.unLockKeyboardMsgIdx = data.content.substr(5, 1) + data.content.substr(10, 1);
          }
          $uibModalInstance.close(content);
        }, function (reason) {
          Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
        })
      }
      if(vm.queryCode==5){
        var restURL = VIEW_CANCEL_LOCK_INPUT_MSG_URL + "?devicenum=" + vm.deviceinfo.deviceNum;
        var rspData = serviceResource.restCallService(restURL, "GET");
        rspData.then(function (data) {

          if (data.content) {

            vm.cancelLockTimes = data.content.substr(3, 1) + data.content.substr(8, 1);
          }
          $uibModalInstance.close(data.content);
        }, function (reason) {
          Notification.error(languages.findKey('getTheMessageContentFailed') + reason.data.message);
        })
      }


    }



    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };


  }
})();
