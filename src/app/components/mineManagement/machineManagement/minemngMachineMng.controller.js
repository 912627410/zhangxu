

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngMachineController', minemngMachineController);

  /** @ngInject */
  function minemngMachineController($rootScope, MINE_PAGE_URL, languages,$uibModal,$http,  $confirm,$filter,permissions, NgTableParams,
                                treeFactory, ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE,
                                MACHINE_PAGE_URL,MACHINE_UNBIND_DEVICE_URL, MACHINE_MOVE_ORG_URL,
                                MACHINE_URL,MACHINE_ALLOCATION,MACHINE_EXCELEXPORT) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.org = {label: ""};    //所属组织
    vm.allot = {label: ""}; //调拨组织
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id
    vm.querySubOrg = true;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.query = function (page, size, sort, machine) {
      var restCallURL = MINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;

      if (null != machine) {

        if (null != machine.deviceNum&&machine.deviceNum!="") {
          restCallURL += "&search_LIKE_deviceinfo.deviceNum=" + $filter('uppercase')(machine.deviceNum);
        }
        if (null != machine.licenseId&&machine.licenseId!="") {
          restCallURL += "&search_LIKE_licenseId=" + $filter('uppercase')(machine.licenseId);
        }

      }

      if (null != vm.org&&null != vm.org.id&&!vm.querySubOrg) {
        restCallURL += "&search_EQ_orgEntity.id=" + vm.org.id;
      }

      if(null != vm.org&&null != vm.org.id&&undefined != vm.org&&vm.querySubOrg){
        restCallURL += "&parentOrgId=" +vm.org.id;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {

        vm.tableParams = new NgTableParams({
          // initial sort order
          // sorting: { name: "desc" }
        }, {
          dataset: data.content
        });
        vm.page = data.page;
        vm.pageNumber = data.page.number + 1;
      }, function (reason) {
        vm.machineList = null;
        Notification.error(languages.findKey('getDataVeFail'));
      });
    };


    //默认查询
    vm.query(null,null,null,null);







    vm.newMachineMng = function (size) {

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/mineManagement/machineManagement/newMineMachinemng.html',
        controller: 'newMineMachinemngController as newMineMachinemngCtrl',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          },
          machineTypeInfo: function () {
            return vm.machineTypeList;
          }
        }
      });

      modalInstance.result.then(function (result) {
        //console.log(result);
        vm.tableParams.data.splice(0, 0, result);

      }, function () {
        //取消
      });
    };



    //批量导入
    vm.uploadMineMachine = function (size) {
      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/machineManagement/uploadMachine.html',
        controller: 'uploadMachineController as uploadMachineController',
        size: size,
        backdrop: false,
        resolve: {
          operatorInfo: function () {
            return vm.operatorInfo;
          }
        }
      });

      modalInstance.result.then(function (result) {
        for(var i=0; i <result.length;i++){
          vm.tableParams.data.splice(0, 0, result[i]);

        }

      }, function () {
        //取消
      });
    };

    //导出至Excel
    vm.excelExport=function (org) {

      if (org&&org.id) {
        var filterTerm = "id=" + org.id;
        var restCallURL = MACHINE_EXCELEXPORT;
        if (filterTerm){
          restCallURL += "?";
          restCallURL += filterTerm;
        }
        if(vm.querySubOrg) {
          restCallURL += "&parentOrgId="+ org.id;
        }

        $http({
          url: restCallURL,
          method: "GET",
          responseType: 'arraybuffer'
        }).success(function (data, status, headers, config) {
          var blob = new Blob([data], { type: "application/vnd.ms-excel" });
          var objectUrl = window.URL.createObjectURL(blob);

          var anchor = angular.element('<a/>');

          //兼容多种浏览器
          if (window.navigator.msSaveBlob) { // IE
            window.navigator.msSaveOrOpenBlob(blob, org.label +'.xls')
          } else if (navigator.userAgent.search("Firefox") !== -1) { // Firefox
            anchor.css({display: 'none'});
            angular.element(document.body).append(anchor);
            anchor.attr({
              href: URL.createObjectURL(blob),
              target: '_blank',
              download: org.label +'.xls'
            })[0].click();
            anchor.remove();
          } else { // Chrome
            anchor.attr({
              href: URL.createObjectURL(blob),
              target: '_blank',
              download: org.label +'.xls'
            })[0].click();
          }


        }).error(function (data, status, headers, config) {
          Notification.error(languages.findKey('failedToDownload'));
        });
      }else {
        Notification.error("请选择所属组织!");
      }

    }











    vm.isSelected = function (id) {

      return vm.selected.indexOf(id) >= 0;
    }

    vm.checkAll = function () {
      var operStatus = false;
      if (vm.selectAll) {
        operStatus = false;
        vm.selectAll = false;
      } else {
        operStatus = true;
        vm.selectAll = true;
      }

      vm.deviceinfoList.forEach(function (deviceinfo) {
        deviceinfo.checked = operStatus;
      })
    }












  }
})();
