/**
 * Created by riqina.ma on 16/5/24.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('newMenuController', newMenuController);

  /** @ngInject */
  function newMenuController($scope, $uibModalInstance, serviceResource, MENU_URL,Notification, parentMenu) {
    var vm = this;
    vm.operatorInfo = $scope.userInfo;
    vm.parentMenu = parentMenu;
    vm.menu = {parentId: vm.parentMenu.id};

      vm.ok = function (menu) {

       var restPromise = serviceResource.restAddRequest(MENU_URL, menu);
        restPromise.then(function (data) {
          if(data.code===0){
            Notification.success("新建菜单信息成功!");
            $uibModalInstance.close(data.content);
          }else{
            Notification.error(data.message);
          }
        }, function (reason) {
            vm.errorMsg=reason.data.message;
            Notification.error(reason.data.message);
        }

        );
      };

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };

  }
})();
