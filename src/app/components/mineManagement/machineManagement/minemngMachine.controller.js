

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('minemngMachineController', minemngMachineController);

  /** @ngInject */
  function minemngMachineController($rootScope, MINE_PAGE_URL, languages,$uibModal,$http,MINE_QUERY_URL ,$filter, NgTableParams,
                                    MINE_MACHINE_DELETE, ngTableDefaults, Notification, serviceResource, DEFAULT_SIZE_PER_PAGE,
                                    $confirm ,MACHINE_EXCELEXPORT) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.selectAll = false;//是否全选标志
    vm.selected = []; //选中的设备id
    vm.querySubOrg = true;
    vm.machineType = 1;

    ngTableDefaults.params.count = DEFAULT_SIZE_PER_PAGE;
    ngTableDefaults.settings.counts = [];

    vm.query= function (page, size, sort, machine) {
      var restCallURL = MINE_PAGE_URL;
      var pageUrl = page || 0;
      var sizeUrl = size || DEFAULT_SIZE_PER_PAGE;
      var sortUrl = sort || "id,desc";
      restCallURL += "?page=" + pageUrl + '&size=' + sizeUrl + '&sort=' + sortUrl;
      restCallURL += "&search_EQ_machineType=" + vm.machineType;
      if (null != machine) {

        if (null != machine.carNumber&&machine.carNumber!="") {
          restCallURL += "&search_LIKE_carNumber=" + $filter('uppercase')(machine.carNumber);
        }
        if (null != machine.licenseId&&machine.licenseId!="") {
          restCallURL += "&search_LIKE_licenseId=" + $filter('uppercase')(machine.licenseId);
        }
        if (null != machine.productModel&&machine.productModel!="") {
          restCallURL += "&search_LIKE_productModel=" + $filter('uppercase')(machine.productModel);
        }
        if (null != machine.manufacotryName&&machine.manufacotryName!="") {
          restCallURL += "&search_LIKE_manufacotryName=" + $filter('uppercase')(machine.manufacotryName);
        }
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

    vm.selectTab = function (machineType) {
      vm.machineType = machineType;
      vm.query(null, null, null, null);
    };

    //重置查询框
    vm.reset = function () {
      vm.machine = null;
      vm.org=null;
      vm.selected=[]; //把选中的设备设置为空
      vm.allot=null;
    }

    vm.reset2 = function () {
      vm.machine = null;
      vm.org=null;
      vm.selected=[]; //把选中的设备设置为空
      vm.allot=null;
    }
   /* //默认查询
    vm.query(null,null,null,null);*/

    //更新车辆
    vm.updateMineMachine = function (machine, size) {
      //var sourceMachine = angular.copy(machine); //深度copy

      var singlUrl = MINE_QUERY_URL + "?id=" + machine.id;
      var deviceinfoPromis = serviceResource.restCallService(singlUrl, "GET");
      deviceinfoPromis.then(function (data) {
        var operMachine = data.content;
        var modalInstance = $uibModal.open({
          animation: vm.animationsEnabled,
          templateUrl: 'app/components/mineManagement/machineManagement/updateMinemngMachine.html',
          controller: 'updateMineMachineController as updateMineMachineCtrl',
          size: size,
          backdrop: false,
          resolve: {
            machine: function () {
              return operMachine;
            },
          }
        });

        modalInstance.result.then(function(result) {

          var tabList=vm.tableParams.data;
          //更新内容
          for(var i=0;i<tabList.length;i++){
            if(tabList[i].id==result.id){
              tabList[i]=result;
            }
          }

        }, function(reason) {

        });


      }, function (reason) {
        Notification.error('获取车辆信息失败');
      });
    };

    /**
     * 删除车辆
     * @param id
     */
    vm.delete = function (id) {
      $confirm({text: languages.findKey('areYouWanttoDeleteIt'), title: languages.findKey('deleteConfirmation'), ok: languages.findKey('confirm'), cancel:languages.findKey('cancel')})
        .then(function () {
          var restCall = MINE_MACHINE_DELETE + "?id=" + id;
          var restPromise = serviceResource.restCallService(restCall, "UPDATE");
          restPromise.then(function (data) {
            Notification.success(languages.findKey('delSuccess'));
            vm.query(null, null, null, null);
          }, function (reason) {
            Notification.error(languages.findKey('delFail'));
          });
        });
    };



    vm.newMachineMng = function (size,type) {
      var machineType ;

      if(null!=type){
        if(type ==1 ){
           machineType = 1
        }
        if(type ==2 ){
           machineType = 2
        }
      }

      var modalInstance = $uibModal.open({
        animation: vm.animationsEnabled,
        templateUrl: 'app/components/mineManagement/machineManagement/newMinemngMachine.html',
        controller: 'newMineMachinemngController as newMineMachinemngCtrl',
        size: size,
        backdrop: false,
        resolve: {
          machineType: function () {
            return machineType;
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
