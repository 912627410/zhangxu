(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngUpdateUserMngController', minemngUpdateUserMngController);

  /** @ngInject */
  function minemngUpdateUserMngController($uibModalInstance,$scope,minemnguserinfo,MINEMNG_USERINFO_UPDATE_URL,ROLE_URL,serviceResource,Notification) {
    var vm = this;

    vm.operatorInfo = $scope.userInfo;
    vm.minemnguser=minemnguserinfo;

    //加载角色类型
    vm.getUserRoleType = function () {
      var url = ROLE_URL + "?search_EQ_organization.id=" + vm.operatorInfo.userdto.organizationDto.id;
      var roleType = serviceResource.restCallService(url, "GET");
      roleType.then(function (data) {
        vm.userRoleTypeList = data.content;
      }, function (reason) {
        Notification.error('获取角色类型失败');

      })
    }

    vm.entryTimeSetting = {
      //dt: "请选择开始日期",
      open: function($event) {
        vm.entryTimeSetting.status.opened = true;
      },
      dateOptions: {
        formatYear: 'yy',
        startingDay: 1
      },
      status: {
        opened: false
      }
    };

    // 日期控件相关
    // date picker
    vm.entryTimeOpenStatus = {
      opened: false
    };

    vm.entryTimeOpen = function ($event) {
      vm.entryTimeOpenStatus.opened = true;
    };

    vm.getUserRoleType();

    vm.ok = function () {

      var rspdata = serviceResource.restUpdateRequest(MINEMNG_USERINFO_UPDATE_URL,vm.minemnguser);
      rspdata.then(function (data) {
        Notification.success("修改用户信息成功!");
        $uibModalInstance.close(data.content);
      },function (reason) {
        Notification.error(reason.data.message);
      })
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
