(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngNewUserMngController', minemngNewUserMngController);

  /** @ngInject */
  function minemngNewUserMngController($uibModalInstance,$scope,serviceResource,Notification,ssnCode,MINEMNG_USERINFO_URL,ROLE_URL) {
    var vm = this;
    vm.operatorInfo = $scope.userInfo;
    vm.minemnguser = {
      jobNumber: ""
    };
    vm.ssnCode = ssnCode;

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


    //加载角色类型
    vm.getUserRoleType=function() {
      var url = ROLE_URL + "?search_EQ_organization.id=" + vm.operatorInfo.userdto.organizationDto.id;
      var roleType = serviceResource.restCallService(url, "GET");
      roleType.then(function (data) {
        vm.userRoleTypeList = data.content;
      }, function (reason) {
        Notification.error('获取角色类型失败');

      })
    }
    vm.getUserRoleType();

    vm.ok = function () {
      if(vm.minemnguser.jobNumber != null &&vm.minemnguser.jobNumber !== 'undefined' &&vm.minemnguser.jobNumber !== '' && vm.minemnguser.jobNumber.length!=6) {
        Notification.warning("工号为6位数字");
        return;
      }
      vm.minemnguser.roleId = vm.roleType.id;
      vm.minemnguser.roleName = vm.roleType.name;
      vm.minemnguser.ssn = vm.ssnCode + vm.ssn;
      var rspdata = serviceResource.restAddRequest(MINEMNG_USERINFO_URL,vm.minemnguser);
      rspdata.then(function (data) {
        Notification.success("新建用户成功!");
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
