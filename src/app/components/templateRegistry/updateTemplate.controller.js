/**
 * Created by zhenyu on 17-6-26.
 */
(function(){
  'use strict';

  angular
    .module("GPSCloud")
    .controller("updateTemplateController",updateTemplateController);

  function updateTemplateController($uibModalInstance,rspData) {
    var vm = this;

    vm.templateInfo = {
      tName : '',
      deviceType : '',
      status : '',
      description : ''
    };

    vm.templateInfo.tName = rspData.tName;
    vm.templateInfo.deviceType = rspData.deviceType;
    vm.templateInfo.status = rspData.status;
    vm.templateInfo.description = rspData.description;

    vm.ok = function () {

    };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }

})();
