/**
 * Created by weihua on 17-12-8.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngUserMngController', minemngUserMngController);

  /** @ngInject */
  function minemngUserMngController($scope,$uibModal,NgTableParams,ngTableDefaults,$confirm,MINEMNG_USERINFOPAGE_URL,MINEMNG_USERINFO_DELETE_URL,DEFAULT_MINSIZE_PER_PAGE,ROLE_URL,MINEMNG_USERINFO_URL,serviceResource,Notification,languages) {
    var vm = this;
    vm.operatorInfo = $scope.userInfo;
    ngTableDefaults.params.count = DEFAULT_MINSIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.entryTimeSetting = {
      //dt: "请选择开始日期",
      open: function ($event) {
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
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

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
    vm.getUserRoleType();

    //分页查询用户信息
    vm.query = function (page, size, sort, minemnguser) {
      var restCallURL = MINEMNG_USERINFOPAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_MINSIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (minemnguser != 'undefined' && null != minemnguser) {

        if (null != minemnguser.jobNumber && minemnguser.jobNumber != "") {
          restCallURL += "&jobNumber=" + minemnguser.jobNumber;
        }
        if (null != minemnguser.name && minemnguser.name != "") {
          restCallURL += "&name=" + minemnguser.name;
        }
        if (null != minemnguser.entryTime && minemnguser.entryTime != "") {
          var startMonth = minemnguser.entryTime.getMonth() + 1;
          var startDateFormated = minemnguser.entryTime.getFullYear() + '-' + startMonth + '-' + minemnguser.entryTime.getDate();

          restCallURL += "entryTime=" + startDateFormated;

        }
      }


      if (null != vm.roleType && null != vm.roleType.id) {
        restCallURL += "&roleId=" + vm.roleType.id;
      }
      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({}, {
          dataset: data.content

        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
        vm.page.totalElements=data.page.totalElements;

      }, function (reason) {
        Notification.error(languages.findKey('FaGetCu'));
      });
    };
    vm.query(null, null, null, null);


    vm.new = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/components/mineManagement/userManagement/minemngNewUser.html',
        controller: 'minemngNewUserMngController',
        controllerAs: 'minemngNewUserMngCtrl',
        size: 'lg'
      });

      modalInstance.result.then(function (result) {
        vm.tableParams.data.splice(0, 0, result);
        vm.query(null, null, null, null);
      }, function () {
        //取消
      });
    }


    vm.update = function (minemnguser) {
      var restCallURL = MINEMNG_USERINFO_URL + "?userinfoId=" + minemnguser.id;
      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        var modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'app/components/mineManagement/userManagement/minemngUpdateUser.html',
          controller: 'minemngUpdateUserMngController',
          controllerAs: 'minemngUpdateUserMngCtrl',
          size: 'lg',
          resolve: {
            minemnguserinfo: function () {
              return data.content;

            }

          }
        });
        modalInstance.result.then(function (result) {

          var tabList = vm.tableParams.data;
          //更新内容
          for (var i = 0; i < tabList.length; i++) {
            if (tabList[i].id == result.id) {
              tabList[i] = result;
            }
          }

        }, function (reason) {

        });

      }, function (reason) {
      });


    };

    //重置密碼
    vm.updatePassword = function (userinfoId) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/mineManagement/userManagement/minemngResetPassword.html',
        controller: 'minemngResetPasswordController as minemngResetPasswordCtrl',
        size: 'md',
        backdrop: false,
        resolve: {
          userinfoId: function () {
            return userinfoId;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
          //console.log(selectedItem);
      }, function () {
      });
    };


  /* 删除操作
    * @param id
    */
    vm.delete = function (id) {
      $confirm({text: languages.findKey('areYouWanttoDeleteIt'), title: languages.findKey('deleteConfirmation'), ok: languages.findKey('confirm'), cancel:languages.findKey('cancel')})
        .then(function () {
          var restCall = MINEMNG_USERINFO_DELETE_URL + "?id=" + id;
          var restPromise = serviceResource.restCallService(restCall, "UPDATE");
          restPromise.then(function (data) {
            Notification.success(languages.findKey('delSuccess'));
            vm.query(null, null, null, null);
          }, function (reason) {
            Notification.error(languages.findKey('delFail'));
          });
        });
    };

    /**
     * 重置查询框
     */

    vm.reset=function () {
      vm.minemnguser.name=null;
      vm.minemnguser.jobNumber=null;
      vm.minemnguser.entryTime=null;
      vm.roleType=null;

    };
  }
})();
