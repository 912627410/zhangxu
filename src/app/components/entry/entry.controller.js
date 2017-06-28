/**
 * Created by zhenyu on 17-5-17.
 */
(function() {
  'use strict';

  angular.module('GPSCloud').controller('entryController', entryController);

  function entryController($rootScope,$scope, $http,$cookies,$filter, $window,Notification, serviceResource, languages,ORG_TREE_JSON_DATA_URL) {


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

      // alert("parent.id=="+parent.id);

      if (!_.isEmpty(children)) {
        //alert("1.children.tree=="+JSON.stringify(children));
        //alert("2.parent.id =="+parent.id );
        //判断是否是根节点
        // if( parent.id == rootParent.id ){
        if (parent.id == 0) {
          //alert("3.rootParent.id =="+rootParent.id );
          //alert("4.rootParent.tree=="+JSON.stringify(children));
          tree = children;

        } else {
          parent['children'] = children
          // alert("5. tree=="+JSON.stringify(children));
        }
        _.each(children, function (child) {
          vm.unflatten(array, child, null)
        });
      }


      //alert("tree="+tree);
      return tree;
    };

    $scope.$on('$viewContentLoaded', function(){
      if(null!=$cookies.getObject("user")&&null==$cookies.getObject("outstate")){
        var userobj = {};
        userobj.username = $cookies.getObject("user").username;
        userobj.authtoken = $cookies.getObject("user").authtoken;
        vm.loginBytoken(userobj);
      }else{
        $rootScope.$state.go('home.login');
      }
    });


    vm.loginBytoken = function (userobj) {
      var rspPromise = serviceResource.authenticateb(userobj);
      rspPromise.then(function (response) {
        var data = response.data;
        userInfo = {
          authtoken: data.token,
          userdto: data.userinfo
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
        Notification.success(languages.findKey('loginSuccess'));

        vm.getPermission();
        vm.getOrg();

      }, function (reason) {
        Notification.error(languages.findKey('loginFailure'));
      });
    };


    vm.getPermission = function (passwordPattenStatus) {
      var rspData = serviceResource.getPermission();
      rspData.then(function (data) {
        var permissionList = $filter("array2obj")(data.content, "permission");
        $rootScope.permissionList = permissionList;
        $window.sessionStorage["permissionList"] = JSON.stringify(permissionList);

        $rootScope.$state.go('home');

      }, function (reason) {
      });
    }

    //读取组织结构信息
    vm.getOrg = function () {
      var rspData = serviceResource.restCallService(ORG_TREE_JSON_DATA_URL, "QUERY");
      rspData.then(function (data) {
        //判断树形菜单的根节点,默认为0,然后根据用户的组织来进行更新
        var orgParent = rootParent;
        if (null != userInfo.userdto.organizationDto) {
          orgParent.id = userInfo.userdto.organizationDto.id;
          rootParent.id = orgParent.id;

          //userInfo.userdto.organizationDto.parentId=0;
        }

        //TODO生成树的方法,要求根的父节点必须为0才可以,临时这么写,后续需要优化
        var list = data;
        for (var i = 0; i < list.length; i++) {
          if (list[i].id == rootParent.id) {
            //  alert("1=="+list[i].parentId);
            list[i].parentId = 0;
            // alert("2=="+list[i].parentId);
            break;
          }
        }

        // alert("orgParent.id==="+orgParent.id);
        $rootScope.orgChart = vm.unflatten(list);



        $window.sessionStorage["orgChart"] = JSON.stringify($rootScope.orgChart);
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetOrganizationInformation'));
      });
    }


  }

})();
