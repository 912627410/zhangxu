(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .run(runBlock);

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
  }
  /** @ngInject */
  function runBlock($rootScope, $state, $stateParams, serviceResource,ORG_TREE_JSON_DATA_URL,$window,$log,Notification,Idle) {


    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    if ($window.sessionStorage["userInfo"]) {
      $rootScope.userInfo = JSON.parse($window.sessionStorage["userInfo"]);
    }
    if ($window.sessionStorage["statisticInfo"]) {
      $rootScope.statisticInfo = JSON.parse($window.sessionStorage["statisticInfo"]);
    }

    //判断是否登录
    if ($rootScope.userInfo){
      var rspData = serviceResource.restCallService(ORG_TREE_JSON_DATA_URL,"QUERY");
      rspData.then(function(data){
        $rootScope.orgChart = unflatten(data);
        //var treedata_org = data[0];
        //var my_data = new Array();
        //my_data.push(treedata_org);
        //$rootScope.orgChart = my_data;
      },function(reason){
        Notification.error('获取组织机构信息失败');
      })
      //监控用户登录超时
      Idle.watch();
    }

    //保存当前打开的modal,用于超时时关闭
    $rootScope.currentOpenModal = null;

    $log.debug('runBlock end');

  }

})();
