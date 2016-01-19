(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $state, $stateParams, serviceResource,ORG_TREE_JSON_DATA_URL,$window,$log) {


    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    if ($window.sessionStorage["userInfo"]) {
      $rootScope.userInfo = JSON.parse($window.sessionStorage["userInfo"]);
    }
    if ($window.sessionStorage["statisticInfo"]) {
      $rootScope.statisticInfo = JSON.parse($window.sessionStorage["statisticInfo"]);
    }
    $log.debug('runBlock end');

    var rspData = serviceResource.restCallService(ORG_TREE_JSON_DATA_URL,"QUERY");
    rspData.then(function(data){
      $rootScope.orgChart = data;
      //var treedata_org = data[0];
      //var my_data = new Array();
      //my_data.push(treedata_org);
      //$rootScope.orgChart = my_data;
    },function(reason){
      Notification.error('获取组织机构信息失败');
    })


  }

})();
