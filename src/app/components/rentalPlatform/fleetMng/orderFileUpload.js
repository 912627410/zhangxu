(function(){
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalOrderFileUploadController',rentalOrderFileUploadController);

  function rentalOrderFileUploadController ($rootScope,$uibModalInstance,$stateParams,rentalOrder,$timeout,$uibModal,DEFAULT_SIZE_PER_PAGE,Upload,RENTANL_ATTACH_UPLOAD_URL,Notification){

    var vm = this;
    vm.userInfo = $rootScope.userInfo;
    vm.selectAll = false;
    vm.rentalOrder = rentalOrder
    vm.selected = [];
    vm.pageSize = 8;

    //附件上传
    vm.fileUpload = function(files){
      var uploadUrl = RENTANL_ATTACH_UPLOAD_URL;
      var id = vm.rentalOrder.id;
      uploadUrl += "?orderId="+id
      if(files!=null){
        angular.forEach(files,function(file){
          file.upload = Upload.upload({
            url:uploadUrl,
            file:file
          });
          file.upload.then(function(response){
              $timeout(function(){
                file.result = response.data;
                if(file.result.code==0){
                  Notification.success("新增附件成功!");
                  $uibModalInstance.close();
                }else{
                  Notification.error(data.message);
                }
              })
            },
            function(reason){
              vm.errorMsg = reason.data.message;
              Notification.error("新增附件失败!");
              Notification.error(vm.errorMsg);
            },function(evt){
            });
        })
      }
    }

    //关闭弹窗
    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    };
  }
})();
