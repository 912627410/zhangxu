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
    vm.updateSoftVersion = null;
    vm.fileType1 = null;
    vm.fileType2 = null;

    ngTableDefaults.params.count = 8;
    ngTableDefaults.settings.counts = [];

    vm.query=function(page, size, sort, updateFile){
      var restCallURL = UPDATE_FILE_UPLOAD_QUERY;
      var pageUrl = page || 0;
      var sizeUrl = size || 8;
      var sortUrl = sort || UPDATE_FILE_DATA_BY;
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl + "&search_EQ_status=1";
      if(vm.updateDevice.length > 0) {
        restCallURL += "&search_EQ_versionNum=" + vm.updateDevice[0].versionNum;
      }
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

    vm.fileSelection = function (updateFile) {
      vm.checked = updateFile.id;
      vm.updateVersionNum = updateFile.versionNum;
      vm.updateSoftVersion = updateFile.softVersion;
      vm.projectTeam = updateFile.projectTeam;
      vm.projectCode = updateFile.projectCode;
      vm.customerCode = updateFile.customerCode;
      vm.hardwareVersion = updateFile.hardwareVersion;
      vm.upgradeMethod = updateFile.upgradeMethod;
    };

    vm.ok = function () {
      if(null == vm.checked || vm.checked == ""){
        Notification.warning({message: '请选择升级文件', positionY: 'top', positionX: 'center'});
        return;
      }
      var updateDevice = angular.copy(vm.updateDevice);
      var content = "", count = 0;
      if(vm.upgradeMethod == "1") { // GPS自身升级
        for(var i=0,flag=true,len=updateDevice.length;i<len;flag?i++:i) {
          if(updateDevice[i] && (updateDevice[i].terminalVersion == vm.updateSoftVersion)) {
            content += updateDevice[i].deviceNum + ",";
            updateDevice.splice(i, 1);
            flag = false;
          } else {
            count++;
            flag = true;
          }
        }
        if(updateDevice.length <=0) {
          content = "选择的设备的软件版本与选择的升级文件的软件版本相同，不做升级。";
          vm.confirmUpdate = false;
        } else if(content && count > 0) {
          content = content.slice(0, -1);
          content += "的软件版本与选择的升级文件的软件版本相同，不作升级。" + "您确定将选择的其余设备升级成VER" + (vm.updateSoftVersion/100).toFixed(2) + "版本?";
          vm.confirmUpdate = true;
        } else {
          content += "您确定将选择的设备升级成VER" + (vm.updateSoftVersion/100).toFixed(2) + "版本?";
          vm.confirmUpdate = true;
        }
      } else {
        content += "您确定升级成VER" + (vm.updateSoftVersion/100).toFixed(2) + "版本?";
        vm.confirmUpdate = true;
      }
      var updateDataVo = {
        devices : updateDevice,
        fileId : vm.checked
      };

      $confirm({
        title:"操作提示",
        text: content
      }).then(function () {
        if(vm.confirmUpdate) {
          var restPromise = serviceResource.restAddRequest(UPDATE_URL, updateDataVo);
          restPromise.then(function (data) {
            if(data.code == 0){
              Notification.success(data.content);
              $uibModalInstance.close();
            } else if(data.code == -1){
              Notification.warning(data.content);
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
