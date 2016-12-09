/**
 * Created by long on 16-10-19.
 */
(function () {
  'use strict';


  angular
    .module('GPSCloud')
    .controller('selectUpdateFileController', selectUpdateFileController);

  function selectUpdateFileController($rootScope, $scope, $confirm, $uibModalInstance, serviceResource, Notification, NgTableParams, updateDeviceId, UPDATE_FILE_UPLOAD_QUERY, UPDATE_FILE_DATA_BY, UPDATE_URL) {
    var vm = this;
    vm.updateDeviceId = updateDeviceId;
    vm.checked = null; //选中的设备id
    vm.updateVersionNum = null;

    vm.query=function(page, size, sort, updateFile){
      var restCallURL = UPDATE_FILE_UPLOAD_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || 8;
      var sortUrl = sort || UPDATE_FILE_DATA_BY;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      var updateFilePromis = serviceResource.restCallService(restCallURL, "GET");
      updateFilePromis.then(function(data){
        vm.updateFileList = data.content;
        vm.tableParams = new NgTableParams({},{
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        Notification.error("获取升级文件信息失败");
      });
    };

    vm.query(null, null, null, null);

    vm.fileSelection = function (id, versionNum) {
      vm.checked = id;
      vm.updateVersionNum = versionNum;
    };

    vm.ok = function () {
      if(null == vm.checked || vm.checked == ""){
        Notification.warning({message: '请选择升级文件', positionY: 'top', positionX: 'center'});
        return;
      }

      var updateDataVo = {
        deviceIds : vm.updateDeviceId,
        fileId : vm.checked
      };

      $confirm({
        title:"操作提示",
        text:"您确定升级成VER" + (vm.updateVersionNum/100).toFixed(2) + "版本?"
      }).then(function () {
        var restPromise = serviceResource.restAddRequest(UPDATE_URL, updateDataVo);
        restPromise.then(function (data) {
          if(data.code == 0){
            Notification.success("升级指令已下发!");
            $uibModalInstance.close();
          }else{
            Notification.error(data.message);
          }
        }, function (reason) {
          Notification.error(reason.data.message);
        });

      })

    };

    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    }

  }
})();
