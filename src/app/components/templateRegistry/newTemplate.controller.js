/**
 * Created by mengwei on 17-4-1.
 */
/**
 * Created by mengwei on 17-3-31.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newTemplateController', newTemplateController);

  /** @ngInject */
  function newTemplateController($state,$uibModal,$resource,TEMPLATE_CREATE_URL) {
    var vm = this;
    var templateItem = {
      tName:"",
      deviceType:"",
      description:"",
      templateJson:[]
    };

    vm.templateJson = [];

    vm.addData = function (index) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/templateRegistry/addData.html',
        controller: 'addDataController as addDataCtrl',
        backdrop: false,
        resolve: {
          jsonData: function () {
            return vm.templateJson[index];
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.templateJson.push(result);
      }, function () {
        //取消
      })
    };

    vm.editData = function(index){
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/templateRegistry/addData.html',
        controller: 'addDataController as addDataCtrl',
        backdrop: false,
        resolve: {
          jsonData: function () {
            return vm.templateJson[index];
          }
        }
      });

      modalInstance.result.then(function (result) {
        vm.templateJson[index] = result;
      }, function () {
        //取消
      })
    };

    vm.deleteData = function (index){
      for(index;index<vm.templateJson.length;index++){
        vm.templateJson[index] = vm.templateJson[index+1];
      }
      vm.templateJson.pop();
    };


    vm.confirm = function () {

      templateItem.tName = vm.templateInfo.tName;
      templateItem.deviceType = vm.templateInfo.deviceType;
      templateItem.description = vm.templateInfo.description;
      templateItem.templateJson = vm.templateJson;

      var rspPromise = $resource(TEMPLATE_CREATE_URL, {}, {'createTemplate': {method: 'POST', isArray: true}});
      rspPromise.createTemplate(templateItem,function(rspData){
        $state.go("home.templateMng");
      });

    };

    vm.reset = function(){
      vm.templateInfo = [];
      vm.templateJson = [];
    };

    vm.cancel = function(){
      $state.go("home.templateMng");
    };


    vm.return=function () {
      $state.go("home.templateMng");
    };

  }
})();
