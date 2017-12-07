/**
 * Created by long on 16-10-19.
 */
(function () {
  'use strict';


  angular
    .module('GPSCloud')
    .controller('newUpdateFileController', newUpdateFileController);

  function newUpdateFileController($rootScope, $http, $timeout, Upload, projectTeams, $uibModalInstance, Notification, serviceResource, UPDATE_FILE_UPLOAD_URL, UPDATE_OBJECT_LIST) {
    var vm = this;
    vm.file = null;
    vm.projectTeamList = projectTeams;

    /**
     * 获取项目代号集合
     * @param code
       */
    vm.getProjectCodeList = function (code) {
      vm.file.projectCode = null;
      vm.file.customerCode = null;
      vm.projectCodeList = null;
      vm.customerCodeList = null;
      var id = vm.getIdByCode(vm.projectTeamList, code);
      var restCallURL = UPDATE_OBJECT_LIST;
      restCallURL += "?parentId=" + id;
      var dataPromis = serviceResource.restCallService(restCallURL, "QUERY");
      dataPromis.then(function (data) {
        vm.projectCodeList = data;
      });
    };

    /**
     * 获取客户编码集合
     * @param code
       */
    vm.getCustomerCodeList = function (code) {
      vm.file.customerCode = null;
      vm.customerCodeList = null;
      var id = vm.getIdByCode(vm.projectCodeList, code);
      var restCallURL = UPDATE_OBJECT_LIST;
      restCallURL += "?parentId=" + id;
      var dataPromis = serviceResource.restCallService(restCallURL, "QUERY");
      dataPromis.then(function (data) {
        vm.customerCodeList = data;
      });
    };

    /**
     * 根据code获得相应的id
     * @param list
     * @param code
     * @returns {*}
       */
    vm.getIdByCode = function(list, code) {
      var len = list.length;
      if(len <= 0) return;
      for(var i = 0;i < len;i++) {
        if(list[i].code == code) {
          return list[i].id;
        }
      }
    };

    vm.ok = function(file){
      vm.errorMsg = null;

      if(null == file || null == file.name){
        Notification.error({message: '请选择上传的文件!', positionX: 'center'});
        return;
      }

      if(null == file.versionNum){
        Notification.error({message: '请输入协议版本!', positionX: 'center'});
        return;
      }
      if(file.versionNum%1 != 0 || file.versionNum < 1 || file.versionNum > 9999) {
        Notification.error({message: '请重新录入协议版本!', positionX: 'center'});
        return;
      }
      if(null == file.softVersion){
        Notification.error({message: '请输入软件版本!', positionX: 'center'});
        return;
      }

      var verArr = file.softVersion.split(".");
      if(file.softVersion * 100 > 9999 || verArr.length > 1 && verArr[1].length > 2) {
        Notification.error({message: '请重新录入软件版本!', positionX: 'center'});
        return;
      }

      if(file.projectTeam == null || file.projectTeam == "") {
        Notification.error({message: '请选择项目组!', positionX: 'center'});
        return;
      }
      if(file.projectCode == null || file.projectCode == "") {
        Notification.error({message: '请选择项目代号!', positionX: 'center'});
        return;
      }
      if(file.customerCode == null || file.customerCode == "") {
        Notification.error({message: '请选择客户编码!', positionX: 'center'});
        return;
      }
      if(file.hardwareVersion == null || file.hardwareVersion == "") {
        Notification.error({message: '请选择硬件版本!', positionX: 'center'});
        return;
      }
      if(file.upgradeMethod == null || file.upgradeMethod == "") {
        Notification.error({message: '请选择升级方式!', positionX: 'center'});
        return;
      }

      file.upload = Upload.upload({
        url: UPDATE_FILE_UPLOAD_URL,
        data: {
          versionNum: Math.round(file.versionNum),
          softVersion: Math.round(file.softVersion*100),
          remarks: file.remarks,
          projectTeam:file.projectTeam,
          projectCode:file.projectCode,
          customerCode:file.customerCode,
          hardwareVersion:file.hardwareVersion,
          upgradeMethod:file.upgradeMethod
        },
        file: file
      });
      file.upload.then(function(response){
        $timeout(function(){
          file.result = response.data;
          if(file.result.code == 0){
            Notification.success("新增升级文件成功!");
            $uibModalInstance.close();
          }else{
            Notification.error(data.message);
          }
        })
      },function(reason){
        vm.errorMsg=reason.data.message;
        Notification.error(vm.errorMsg);
      },function(evt){

      });
    };

    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    };


  }
})();
