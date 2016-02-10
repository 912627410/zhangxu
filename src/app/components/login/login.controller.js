/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('LoginController', LoginController);

  //通过后台返回的结构生成json tree
  function unflatten( array, parent, tree ){

    tree = typeof tree !== 'undefined' ? tree : [];
    parent = typeof parent !== 'undefined' ? parent : { id: 0 };

    var children = _.filter( array, function(child) {
      return child.parentId == parent.id;
    });

    if( !_.isEmpty( children )  ){
      if( parent.id == 0 ){
        tree = children;
      }else{
        parent['children'] = children
      }
      _.each( children, function( child ){ unflatten( array, child ) } );
    }

    return tree;
  };

  /** @ngInject */
  function LoginController($rootScope, $window,ORG_TREE_JSON_DATA_URL,Notification,serviceResource,Idle) {
    var vm = this;
    var userInfo;
    vm.loginMe = function(){
      var rspPromise = serviceResource.authenticate(vm.credentials);
      rspPromise.then(function(data){
        var userInfo = {
          authtoken: data.authtoken,
          userdto: data.userinfo
        };
        $rootScope.userInfo = userInfo;
        $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
        Notification.success('登录成功');
        //监控用户登录超时
        Idle.watch();
        //读取组织结构信息
        var rspData = serviceResource.restCallService(ORG_TREE_JSON_DATA_URL,"QUERY");
        rspData.then(function(data){
          $rootScope.orgChart = unflatten(data);
          $window.sessionStorage["orgChart"] = JSON.stringify($rootScope.orgChart);
        },function(reason){
          Notification.error('获取组织机构信息失败');
        });
        //读取未处理的提醒消息
        var notificationPromis = serviceResource.queryNotification(0, null,null,"processStatus=0");
        notificationPromis.then(function (data) {
            $rootScope.notificationNumber = data.page.totalElements;
            $window.sessionStorage["notificationNumber"] = $rootScope.notificationNumber;
          }, function (reason) {
            Notification.error('获取提醒信息失败');
          }
        );

        $rootScope.$state.go('home');
      },function(reason){
        $rootScope.userInfo = null;
        $window.sessionStorage["userInfo"] = null;
        Notification.error('用户名或密码错误');
      });
    };
  }
})();
