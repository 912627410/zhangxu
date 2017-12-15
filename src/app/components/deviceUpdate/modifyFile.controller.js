/**
 * Created by long on 16-12-9.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('modifyFileController', modifyFileController);

  function modifyFileController($rootScope, $http, $confirm, updateFile, projectTeams, $uibModalInstance, serviceResource, Notification, MODIFY_FILE_URL, UPDATE_OBJECT_LIST) {
    var vm = this;
    vm.updateFile = angular.copy(updateFile);
    vm.softVersion = (updateFile.softVersion/100).toFixed(2);
    vm.projectTeamList = projectTeams;

    /**
     * 初始化加载项目代号、客户编码集合
     */
    vm.init = function() {
      var id = vm.getIdByCode(vm.projectTeamList, vm.updateFile.projectTeam);
      var restCallURL = UPDATE_OBJECT_LIST;
      restCallURL += "?parentId=" + id;
      var dataPromis = serviceResource.restCallService(restCallURL, "QUERY");
      dataPromis.then(function (data) {
        vm.projectCodeList = data;
        var id2 = vm.getIdByCode(vm.projectCodeList, vm.updateFile.projectCode);
        var restCallURL2 = UPDATE_OBJECT_LIST + "?parentId=" + id2;
        var dataPromis = serviceResource.restCallService(restCallURL2, "QUERY");
        dataPromis.then(function (data2) {
          vm.customerCodeList = data2;
        })
      });
    };

    /**
     * 获取项目代号集合
     * @param code
       */
    vm.getProjectCodeList = function (code) {
      vm.updateFile.projectCode = null;
      vm.updateFile.customerCode = null;
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
      vm.updateFile.customerCode = null;
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

    vm.ok = function(softVersion, updateFile){
      if(null == updateFile.versionNum){
        Notification.error({message: '请输入协议版本!', positionX: 'center'});
        return;
      }
      if(updateFile.versionNum%1 != 0 || updateFile.versionNum < 1 || updateFile.versionNum > 9999) {
        Notification.error({message: '请重新录入协议版本!', positionX: 'center'});
        return;
      }
      var verArr = softVersion.split(".");
      if(softVersion * 100 > 9999 || verArr.length > 1 && verArr[1].length > 2) {
        Notification.error({message: '请重新录入软件版本!', positionX: 'center'});
        return;
      }
      if(softVersion <= 0) {
        Notification.error({message: '版本号取值范围：0.01~99.99', positionX: 'center'});
        return;
      }

      if(updateFile.projectTeam == null || updateFile.projectTeam == "") {
        Notification.error({message: '请选择项目组!', positionX: 'center'});
        return;
      }
      if(updateFile.projectCode == null || updateFile.projectCode == "") {
        Notification.error({message: '请选择项目代号!', positionX: 'center'});
        return;
      }
      if(updateFile.customerCode == null || updateFile.customerCode == "") {
        Notification.error({message: '请选择客户编码!', positionX: 'center'});
        return;
      }
      if(updateFile.hardwareVersion == null || updateFile.hardwareVersion == "") {
        Notification.error({message: '请选择硬件版本!', positionX: 'center'});
        return;
      }
      if(updateFile.upgradeMethod == null || updateFile.upgradeMethod == "") {
        Notification.error({message: '请选择升级方式!', positionX: 'center'});
        return;
      }

      var modifyFile = {
          versionNum: updateFile.versionNum,
          softVersion: Math.round(softVersion*100),
          remarks: updateFile.remarks,
        id: updateFile.id,
        projectTeam: updateFile.projectTeam,
        projectCode: updateFile.projectCode,
        customerCode: updateFile.customerCode,
        hardwareVersion: updateFile.hardwareVersion,
        upgradeMethod: updateFile.upgradeMethod
      };

      $confirm({
        title:"操作提示",
        text:"您确定修改此文件的信息?"
      }).then(function () {
        var restPromise = serviceResource.restAddRequest(MODIFY_FILE_URL, modifyFile);
        restPromise.then(function (data) {
          if(data.code == 0){
            Notification.success(data.content);
            $uibModalInstance.close();
          }else{
            Notification.error(data.content);
          }
        }, function (reason) {
          Notification.error(reason.data.content);
        });

      })
    };

    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    };

    vm.init();

  }
})();
