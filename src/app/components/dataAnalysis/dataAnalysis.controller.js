/**
 * Created by worker on 16/2/10.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('dataAnalysisController', dataAnalysisController);

  /** @ngInject */
  function dataAnalysisController($rootScope,$scope, $sce,$window,$timeout, $state ,$stateParams,serviceResource,Notification,languages) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    //生产环境
    var reqUrl ="https://iotserver2.nvr-china.com/LinGongMachineProfile/lg/NvrUrl/simulationLogin?username=beigu&password=beigukey&menuType="+$stateParams.menuType+"&getToken="+vm.operatorInfo.authtoken+"&role="+$stateParams.role;
    $scope.k2dataUrl={"src":reqUrl}

    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    }

  }



})();
