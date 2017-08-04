/**
 * Created by long on 16-10-19.
 */
(function () {
  'use strict';


  angular
    .module('GPSCloud')
    .controller('selectUpdateFileController', selectUpdateFileController);

  function selectUpdateFileController($rootScope, ngTableDefaults, $confirm, $uibModalInstance, serviceResource, Notification, NgTableParams, updateDevice, UPDATE_FILE_UPLOAD_QUERY, UPDATE_FILE_DATA_BY, UPDATE_URL) {
    var vm = this;
    vm.updateDevice = updateDevice;
    vm.checked = null; //选中的设备id
    vm.updateVersionNum = null;
    vm.updateApplicableProducts = null;

    ngTableDefaults.params.count = 8;
    ngTableDefaults.settings.counts = [];

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

    vm.fileSelection = function (id, versionNum, applicableProducts) {
      vm.checked = id;
      vm.updateVersionNum = versionNum;
      vm.updateApplicableProducts = applicableProducts;
    };

    vm.ok = function () {
      if(null == vm.checked || vm.checked == ""){
        Notification.warning({message: '请选择升级文件', positionY: 'top', positionX: 'center'});
        return;
      }
      var updateDevice = angular.copy(vm.updateDevice);
      var content = "", count = 0;
      for(var i=0,flag=true,len=updateDevice.length;i<len;flag?i++:i) {
        if(updateDevice[i] && updateDevice[i].terminalVersion == vm.updateVersionNum) {
          content += updateDevice[i].deviceNum + ",";
          updateDevice.splice(i, 1);
          flag = false;
        } else {
          count++;
          flag = true;
        }
      }
      if(updateDevice.length <=0) {
        content += "所选设备的终端软件版本与选择的升级版本相同，不作升级。";
        vm.confirmUpdate = false;
      } else if(content && count > 0) {
        content += "当前的终端软件版本与选择的升级版本相同，不作升级。" + "您确定将选择的其余的设备升级成VER" + (vm.updateVersionNum/100).toFixed(2) + "版本?";
        vm.confirmUpdate = true;
      } else {
        content += "您确定将所选设备升级成VER" + (vm.updateVersionNum/100).toFixed(2) + "版本?";
        vm.confirmUpdate = true;
      }
      var updateDataVo = {
        devices : updateDevice,
        fileId : vm.checked
      };

      if(vm.updateApplicableProducts != "1") {
        content = "您选择的升级文件不适合当前设备，请重新选择！";
        vm.confirmUpdate = false;
      }

      $confirm({
        title:"操作提示",
        text: content
      }).then(function () {
        if(vm.confirmUpdate) {
          var restPromise = serviceResource.restAddRequest(UPDATE_URL, updateDataVo);
          restPromise.then(function (data) {
            if(data.code == 0){
              Notification.success("升级指令已下发!");
              $uibModalInstance.close();
            } else if(data.code == -1){

            } else {
              Notification.error(data.content);
            }
          }, function (reason) {
            Notification.error(reason.data.message);
          });
        }

      })

    };

    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    }

  }
})();