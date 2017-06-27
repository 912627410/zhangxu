/**
 * Created by zhenyu on 17-6-20.
 */

(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('addDataController', addDataController);

  function addDataController($rootScope,$scope,$uibModalInstance,jsonData) {
    var vm = this;

    if(jsonData==undefined){
      vm.templateInfo = {
        name: '',
        type: '',
        length: null,
        register: null,
        converter: ''
      }
    }else{
      vm.templateInfo = {
        name: jsonData.name,
        type: jsonData.type,
        length: jsonData.length,
        register: jsonData.register,
        converter: jsonData.converter
      };
    }

    vm.showCharLengthInputBox = function () {

      if(vm.templateInfo.type=="char"){
        return true;
      }else{
        return false;
      }
    };

    vm.ok = function () {

      if(vm.templateInfo.type == 'int'){
        vm.templateInfo.length = 4;
      }else if(vm.templateInfo.type == 'short'){
        vm.templateInfo.length = 2;
      }

      $uibModalInstance.close(vm.templateInfo);
    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
