/**
 * Created by zhenyu on 17-5-17.
 */
(function() {
  'use strict';

  angular.module('GPSCloud').controller('entryController', entryController);

  function entryController($rootScope,$scope, $http,$cookies,$filter, $window,Notification, serviceResource, languages,ORG_TREE_JSON_DATA_URL,RENTAL_ORG_TREE_JSON_DATA_URL) {


    var vm = this;
    var userInfo;
    var rootParent = {id: 0}; //默认根节点为0
    vm.rememberMe = true;
    $scope.isShow = false;

    //通过后台返回的结构生成json tree
    vm.unflatten = function (array, parent, tree) {
      tree = typeof tree !== 'undefined' ? tree : [];
      parent = typeof parent !== 'undefined' ? parent : {id: 0};

      var children = _.filter(array, function (child) {
        return child.parentId == parent.id;
      });

      if (!_.isEmpty(children)) {
        //判断是否是根节点
        if (parent.id == 0) {
          tree = children;
        } else {
          parent['children'] = children
        }
        _.each(children, function (child) {
          vm.unflatten(array, child, null)
        });
      }
      return tree;
    };

    $scope.$on('$viewContentLoaded', function(){
      if(null!=$cookies.getObject("IOTUSER")&&null==$cookies.getObject("IOTSTATUS")){
        var userobj = {};
        userobj.username = $cookies.getObject("IOTUSER").username;
        userobj.authtoken = $cookies.getObject("IOTUSER").authtoken;
        vm.loginBytoken(userobj);
      }else{
        $rootScope.$state.go('login');
      }
    });


    vm.loginBytoken = function (userobj) {
      var rspPromise = serviceResource.authenticateb(userobj);
      rspPromise.then(function (response) {
        //存用户信息
        var data = response.data;
        userInfo = {
          authtoken: data.token,
          userdto: data.userinfo,
          orgTenantType:data.userinfo.organizationDto.tenantType
        };
        //获取token和用户信息,存放到缓存中去
        $http.defaults.headers.common['token'] = data.token;
        $rootScope.userInfo = userInfo;
        $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
        if(userInfo.userdto.organizationDto.logo!=null && userInfo.userdto.organizationDto.logo!=""){
          $rootScope.logo="assets/images/"+$rootScope.userInfo.userdto.organizationDto.logo;

        }else{
          $rootScope.logo="assets/images/logo2.png";
        }

        vm.getPermission();

      }, function (reason) {
        //Notification.error(languages.findKey('loginFailure'));
        $rootScope.$state.go('login');
      });
    };


    vm.getPermission = function (passwordPattenStatus) {
      var rspData = serviceResource.getPermission();
      rspData.then(function (data) {
        var permissionList = $filter("array2obj")(data.content, "permission");
        $rootScope.permissionList = permissionList;
        $window.sessionStorage["permissionList"] = JSON.stringify(permissionList);

        vm.getOrg();

        //验证用户类别
        if (userInfo.orgTenantType != null && userInfo.orgTenantType != '') {
          var orgTypes = userInfo.orgTenantType.split(",");

          if (orgTypes.length >= 2) {
            //如果多种类型的用户,给出选择框进入系统
            $rootScope.$state.go('selectApp');
            return;
          }
          //增加判断是不是租赁平台的用户,如果是直接转到租赁的页面.1:代表物联网用户,2代表租赁用户如果有拥有多种类型中间逗号隔开.例如1,2既是物联网用户又是租赁用户
          if (userInfo.orgTenantType == '2') {
            //直接转入到租赁页面
            $rootScope.$state.go('rental');
            return;
          }
        }

        $rootScope.$state.go('home');
      }, function (reason) {
      });
    }

    //读取组织结构信息
    vm.getOrg = function () {
      if(userInfo.orgTenantType =='1'){
        var rspData = serviceResource.restCallService(ORG_TREE_JSON_DATA_URL, "QUERY");
        rspData.then(function (data) {
          //判断树形菜单的根节点,默认为0,然后根据用户的组织来进行更新
          var orgParent = rootParent;
          if (null != userInfo.userdto.organizationDto) {
            orgParent.id = userInfo.userdto.organizationDto.id;
            rootParent.id = orgParent.id;
          }

          //TODO生成树的方法,要求根的父节点必须为0才可以,临时这么写,后续需要优化
          var list = data;
          for (var i = 0; i < list.length; i++) {
            if (list[i].id == rootParent.id) {
              list[i].parentId = 0;
              break;
            }
          }
          $rootScope.orgChart = vm.unflatten(list);

          $window.sessionStorage["orgChart"] = JSON.stringify($rootScope.orgChart);


        }, function (reason) {
          Notification.error(languages.findKey('failedToGetOrganizationInformation'));
        });
      }else if(userInfo.orgTenantType =='2'){
        var rspData = serviceResource.restCallService(RENTAL_ORG_TREE_JSON_DATA_URL, "QUERY");
        rspData.then(function (data) {
          //判断树形菜单的根节点,默认为0,然后根据用户的组织来进行更新
          var orgParent = rootParent;
          if (null != userInfo.userdto.organizationDto) {
            orgParent.id = userInfo.userdto.organizationDto.id;
            rootParent.id = orgParent.id;
          }

          //TODO生成树的方法,要求根的父节点必须为0才可以,临时这么写,后续需要优化
          var list = data;
          for (var i = 0; i < list.length; i++) {
            if (list[i].id == rootParent.id) {
              list[i].parentId = 0;
              break;
            }
          }
          $rootScope.orgChart = vm.unflatten(list);

          $window.sessionStorage["orgChart"] = JSON.stringify($rootScope.orgChart);


        }, function (reason) {
          Notification.error(languages.findKey('failedToGetOrganizationInformation'));
        });
      }
    }


  }

})();
