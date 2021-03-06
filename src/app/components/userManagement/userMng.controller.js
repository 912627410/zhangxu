/**
 * Created by shuangshan on 16/1/18.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('userMngController', userMngController);

  /** @ngInject */
  function userMngController($rootScope,$uibModal,Notification,serviceResource,
                             USERINFO_URL,USER_GROUPBY_ROLE_URL,
                             USER_PAGED_URL,DEFAULT_SIZE_PER_PAGE ) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    vm.loadUsersStatistic = function(){

        var rspData = serviceResource.restCallService(USER_GROUPBY_ROLE_URL,"QUERY");
        rspData.then(function(data){
          var userMngNumberByRole = {sysadminnumber:0,adminnumber:0,operatornumber:0,usernumber:0,producernumber:0};
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

            if (data[i].role == "ROLE_PRODUCER")
            {
              userMngNumberByRole.producernumber = data[i].number;
            }
          }
          vm.userMngNumberByRole = userMngNumberByRole;
        },function(reason){
          vm.usermngStatisticList = null;
          Notification.error("获取用户数据失败");
        });
    };
    vm.showUserMng = function(role,page,size,sort){

      var restCallURL = USER_PAGED_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
     // alert(role);

      if (role){
         restCallURL += "&search_EQ_role=" + role;
      }

     //alert(restCallURL);
     // var rspData = serviceResource.queryUserInfo(page,size,sort,queryCondition);
      var rspData = serviceResource.restCallService(restCallURL, "GET");
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
      if (vm.operatorInfo){
        if (userMng.status == 0)
        {
          userMng.status =1;
        }
        else{
          userMng.status =0;
        }
        var rspData = serviceResource.restCallService(USERINFO_URL,"UPDATE",userMng);
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
        templateUrl: 'app/components/userManagement/newUser.html',
        controller: 'AddUserController as addUserCtrl',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function () {
        vm.showUserMng(vm.operatorInfo.userdto.role,null,null,null);
        vm.loadUsersStatistic();
      }, function () {
        //取消
      });
    };

//change password
    vm.updatePassword = function (usermnginfo,size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/userManagement/updatePassword.html',
        controller: 'updatePasswordController as updatePasswordCtrl',
        size: size,
        backdrop: false,
        resolve: {
          usermnginfo: function () {
            return usermnginfo;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        vm.selected = selectedItem;
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };


//update userinfo
    vm.updateUserInfo = function (usermnginfo,size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/userManagement/updateUserInfo.html',
        controller: 'updateUserinfoController as updateUserinfoCtrl',
        size: size,
        backdrop: false,
        resolve: {
          usermnginfo: function () {
            return usermnginfo;
          }
        }
      });

      modalInstance.result.then(function (selectedItem) {
        vm.showUserMng(vm.operatorInfo.userdto.role,null,null,null);
      }, function () {
        //$log.info('Modal dismissed at: ' + new Date());
      });
    };

    //测试用

    vm.treeshow = false;
    vm.openOrg = function (usermnginfo,size) {
      vm.treeshow = !vm.treeshow;
      //var modalInstance = $uibModal.open({
      //  animation: vm.animationsEnabled,
      //  templateUrl: 'app/components/common/organazition.html',
      //  controller: 'organazitionController as orgCtrl',
      //  size: size,
      //  resolve: {
      //    usermnginfo: function () {
      //      return usermnginfo;
      //    }
      //  }
      //});
      //
      //modalInstance.result.then(function (selectedItem) {
      //  vm.selected = selectedItem;
      //  console.log('Modal select: ' + selectedItem);
      //}, function () {
      //  console.log('Modal dismissed at: ' + new Date());
      //});
    };

  }
})();
