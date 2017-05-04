(function () {
  'use strict';

  angular
  .module('GPSCloud')
  .controller('speedAlarmController', speedAlarmController);

  /** @ngInject */
  function speedAlarmController($rootScope, $scope ,$filter, $window, treeFactory, Notification, serviceResource, DEVICEREPORT_ATTENDANCE_URL, DEVICEREPORT_EXPORT_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.querySubOrg = true;
    vm.data = "data";

    // 默认查询7天
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    $scope.queryDate = {
      startDate: startDate,
      endDate: new Date()
    };
    $scope.queryOrg = vm.operatorInfo.userdto.organizationDto;

    //date picker
    $scope.startDateOpenStatus = false;
    $scope.endDateOpenStatus = false;

    $scope.startDateOpen = function () {
      $scope.startDateOpenStatus = true;
    };
    $scope.endDateOpen = function () {
      $scope.endDateOpenStatus = true;
    };

    $scope.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };

    //组织树的显示
    vm.openTreeInfo=function() {
      treeFactory.treeShow(function (selectedItem) {
        $scope.queryOrg =selectedItem;
      });
    }

    vm.query = function (queryOrg,queryDate) {

      var restCallURL = DEVICEREPORT_ATTENDANCE_URL;
      var dateLength = 0;

      if (null != queryOrg && null != queryOrg.id) {
        restCallURL += "?orgId=" + queryOrg.id;

      }

      if (null != queryDate && null != queryDate.startDate && null != queryDate.endDate ) {
        restCallURL += "&startDate=" + $filter('date')(queryDate.startDate, 'yyyy-MM-dd');
        restCallURL += "&endDate=" + $filter('date')(queryDate.endDate, 'yyyy-MM-dd');

        dateLength = Math.round((queryDate.endDate - queryDate.startDate)/3600/1000/24);
      }

      if(vm.querySubOrg){
        restCallURL += "&parentOrgId=" + queryOrg.id;
      }

      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function (data) {
        var deviceList = data.content;

        var categoriesList =[];
        var dataList =[];

        for(var i =0 ;i < deviceList.length;i++){

          categoriesList.push(deviceList[i].licenseId);

          var data = {
            y: deviceList[i].attendance,
            deviceNum: deviceList[i].deviceNum,
            licenseId: deviceList[i].licenseId,
            totalDuration:deviceList[i].totalDuration,
            totalMileage:deviceList[i].totalMileage,
            oilLevel:deviceList[i].oilLevel
          };

          dataList.push(data);

        }

        vm.attendanceChart.options.xAxis.categories = categoriesList;

        vm.attendanceChart.series[0].data = dataList;

      }, function (reason) {
        Notification.error(reason.data.message);
      });

    }

    vm.reset = function () {
      $scope.queryDate = {
        startDate: startDate,
        endDate: new Date()
      };
      $scope.queryOrg = vm.operatorInfo.userdto.organizationDto;
      vm.SubOrg = true;
    };

    vm.reload = function () {
      ws = new WebSocket("ws://localhost:8085/webSocketServer/overSpeed");

      ws.onopen = function () {
        ws.send(vm.operatorInfo.authtoken);
      };

      ws.onmessage = function (evt) {
        console.log(evt.data);
        vm.data = evt.data;
        $scope.$apply();
      };

      ws.onclose = function (evt) {
         console.log("WebSocketClosed!");
      };

      ws.onerror = function (evt) {
         console.log("WebSocketError!");
      };
    };
  }
})();
