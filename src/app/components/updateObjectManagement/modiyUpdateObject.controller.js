/**
 * Created by yalong on 17-11-30.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('modifyUpdateObjectController', modifyUpdateObjectController);

  /** @ngInject */
  function modifyUpdateObjectController($rootScope, $uibModalInstance, Notification, serviceResource, selectedObject, UPDATE_OBJECT_URL) {
    var vm = this;
    vm.operatorInfo =$rootScope.userInfo;
    vm.selectedObject = selectedObject;
    vm.code = vm.selectedObject.code;
    vm.label = vm.selectedObject.label;

    vm.ok = function() {
      if(vm.label == null || vm.label == "") {
        Notification.warning("请录入名称");
        return;
      }
      if(vm.code == null || vm.code == "") {
        Notification.warning("请录入代码");
        return;
      }
      if(vm.label == vm.selectedObject.label && vm.code == vm.selectedObject.code) {
        Notification.success("内容没有变动");
        return;
      }

      var updateObject = {
        parentId: vm.selectedObject.parentId,
        id: vm.selectedObject.id,
        code: vm.code,
        label: vm.label
      };

      var restPromise = serviceResource.restUpdateRequest(UPDATE_OBJECT_URL, updateObject);
      restPromise.then(function (data) {
        if(data.code===0){
          Notification.success(data.content);
          $uibModalInstance.close();
        }else{
          Notification.error(data.message);
        }
      }, function (reason) {
        Notification.error(reason.data.message);
      });
    };


    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    }

  }
})();
