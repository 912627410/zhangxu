/**
 * Created by shuangshan on 16/1/20.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('activeDeviceinfoController', activeDeviceinfoController);

  /** @ngInject */
  function activeDeviceinfoController($rootScope, $scope, $uibModalInstance, DEIVCIE_UNLOCK_FACTOR_URL,SMS_URL, serviceResource, Notification, deviceinfo) {
    var vm = this;
    vm.deviceinfo = deviceinfo;
    vm.operatorInfo = $rootScope.userInfo;
    vm.hasValidMsg = false;  //是否存在有效的短信

    var restURL = DEIVCIE_UNLOCK_FACTOR_URL + "?deviceNum=" + vm.deviceinfo.deviceNum;

    var rspData = serviceResource.restCallService(restURL, "GET");
    rspData.then(function (data) {
      vm.deviceUnLockFactor = data.content;
      var licenseId = vm.deviceUnLockFactor.licenseId;

      if (licenseId == null || licenseId.length < 6){
        vm.hasValidMsg = false;
        vm.activeMsg = "车牌号少于六位或未绑定车牌";
        vm.unActiveMsg = "车牌号少于六位或未绑定车牌";
      }
      else {
        vm.hasValidMsg = true;
        var identityId = licenseId.substring(licenseId.length -6);  //车牌号的后六位默认为车架号
        if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN"){
          vm.activeMsg = "23AA070A010001" + vm.deviceUnLockFactor.deviceNum + "01"+ identityId + vm.deviceUnLockFactor.enginePassCode +"FFFF2A";
          vm.unActiveMsg = "23AA070A010001" + vm.deviceUnLockFactor.deviceNum + "10"+ identityId + vm.deviceUnLockFactor.enginePassCode +"FFFF2A";
        }
        else{
          vm.activeMsg = "仅开放给超级用户查看";
          vm.unActiveMsg = "仅开放给超级用户查看";
        }
      }
      //具体格式请参考短信激活文档
    }, function (reason) {
      Notification.error('获取信息失败');
    })


    //发送短信到终端
    vm.sendSMS = function (smsType,phone_num,content) {
      if (smsType == null || phone_num == null || content == null){
        Notification.warning("请确认SIM号码是否正确");
        return;
      }
      var smsURL = SMS_URL + "?type=" + smsType + "&targetId=" + phone_num + "&content=" + content;
      var rspData = serviceResource.restCallService(smsURL,"ADD",null);  //post请求
      rspData.then(function(data){
        if (data.code == 0 && data.content.smsStatus == 1){
          Notification.success("短信已发送");
        }
        else{
          Notification.$error("短信发送出错");
        }
      },function(reason){
        Notification.$error("短信发送出错");
      })
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
