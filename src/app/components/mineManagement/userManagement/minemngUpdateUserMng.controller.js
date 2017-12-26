(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngUpdateUserMngController', minemngUpdateUserMngController);

  /** @ngInject */
  function minemngUpdateUserMngController($uibModalInstance,minemnguserinfo,serviceResource,Notification) {
    var vm = this;
    vm.minemnguser=minemnguserinfo;

    vm.ok = function () {

      // var rspdata = serviceResource.restAddRequest(MINEMNG_UPDATEUSERINFO_URL,vm.minemnguser);
      // rspdata.then(function (data) {
      //   Notification.success("修改用户信息成功!");
      //   $uibModalInstance.close(data.content);
      //
      // },function (reason) {
      //   Notification.error(reason.data.message);
      // })
    }

    vm.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
