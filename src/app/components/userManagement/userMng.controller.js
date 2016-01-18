/**
 * Created by shuangshan on 16/1/18.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('userMngController', userMngController);

  /** @ngInject */
  function userMngController($rootScope,$uibModal,Notification,serviceResource,UPDATE_USERINFO_URL,USER_GROUPBY_ROLE_URL,USER_PAGED_URL) {
    var vm = this;
    vm.operatorInfo =$rootScope.userInfo;
    vm.loadUsersStatistic = function(){
        var rspData = serviceResource.restCallService(USER_GROUPBY_ROLE_URL,"QUERY");
        rspData.then(function(data){
          var userMngNumberByRole = {sysadminnumber:0,adminnumber:0,operatornumber:0,usernumber:0};
          for(var i=0; i< data.length;i++)
          {
            if (data[i].role == "ROLE_SYSADMIN")
            {
              userMngNumberByRole.sysadminnumber = data[i].number;
            }
            if (data[i].role == "ROLE_ADMIN")
            {
              userMngNumberByRole.adminnumber = data[i].number;
            }
            if (data[i].role == "ROLE_USER")
            {
              userMngNumberByRole.usernumber = data[i].number;
            }
            if (data[i].role == "ROLE_OPERATOR")
            {
              userMngNumberByRole.operatornumber = data[i].number;
            }
          }
          vm.userMngNumberByRole = userMngNumberByRole;
        },function(reason){
          vm.usermngStatisticList = null;
          Notification.error("获取用户数据失败");
        });
    };
    vm.showUserMng = function(role,page,size,sort){
      if (role){
        var queryCondition = "role=" + role;
      }
      var rspData = serviceResource.queryUserInfo(page,size,sort,queryCondition);
      rspData.then(function(data){
          vm.userMngList = data.content;
          vm.page = data.page;
          vm.basePath = USER_PAGED_URL;
        },function(reason){
        vm.userMngList = null;
        Notification.error("获取用户数据失败");
      });
    };

    if (vm.operatorInfo.userdto.role == "ROLE_SYSADMIN" || vm.operatorInfo.userdto.role == "ROLE_ADMIN"){
      vm.loadUsersStatistic();
    }

    vm.showUserMng(vm.operatorInfo.userdto.role,null,null,null);

    //设置用户状态
    vm.revertUserStatus = function(userMng){
      if (operatorInfo){
        if (userMng.status == 0)
        {
          userMng.status =1;
        }
        else{
          userMng.status =0;
        }
        var rspData = serviceResource.restCallService(UPDATE_USERINFO_URL,"UPDATE");
        rspData.then(function(data){
          Notification.success("更新成功");
        },function(reason){
            //rollback update
          if (userMng.status == 0)
          {
            userMng.status =1;
          }
          else{
            userMng.status =0;
          }
          Notification.error("更新失败");
        });
      }
    };

    vm.animationsEnabled = true;
    vm.toggleAnimation = function () {
      vm.animationsEnabled = !vm.animationsEnabled;
    };

//new user
    vm.addUser = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'tpls/UserInfo/newUser.html',
        controller: 'AddUserinfoInstanceCtrl',
        size: size,
        resolve: {
          userInfo: function () {
            return vm.userInfo;
          }
        }
      });

      modalInstance.result.then(function () {
        $log.info('new user is added: ' + new Date());
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };

//change password
    vm.updatePassword = function (usermnginfo,size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'tpls/UserInfo/updatePassword.html',
        controller: 'UpdatePasswordInstanceCtrl',
        size: size,
        resolve: {
          usermnginfo: function () {
            return usermnginfo;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        vm.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };


//update userinfo
    vm.updateUserInfo = function (usermnginfo,size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'tpls/UserInfo/updateUserInfo.html',
        controller: 'UpdateUserinfoInstanceCtrl',
        size: size,
        resolve: {
          usermnginfo: function () {
            return usermnginfo;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        vm.selected = selectedItem;
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
    };
  }
})();
