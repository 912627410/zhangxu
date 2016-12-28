/**
 * Created by xiaopeng on 16-12-14.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('attendanceController', attendanceController);

  /** @ngInject */
  function attendanceController($rootScope, $scope ,$filter, $http, treeFactory,  Notification, serviceResource, DEVICEREPORT_ATTENDANCE_URL, DEVICEREPORT_EXPORT_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;

    // 默认查询7天
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

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

    //水温图
    vm.attendanceChart = {
      options: {
        chart: {
          type: 'column',
        },
        credits: {enabled: false},
        //exporting: {enabled: false},

        xAxis: {
          type: 'category',
          categories: [],
          labels: {
            rotation: -45,
            style: {
              fontSize: '13px',
              fontFamily: 'Verdana, sans-serif'
            }
          }
        },
        yAxis: {
          min: 0,
          max: 100,
          title: {
            text: '车辆出勤率'
          }
        },
        legend: {
          enabled: false
        },
        tooltip: {
          pointFormat: '设备编号: <b>{point.deviceNum} </b><br>' +
          '出勤率: <b>{point.y:.1f} %</b><br>' +
          '总工作时长: <b>{point.totalDuration} 小时</b><br>' +
          '累计里程: <b>{point.totalMileage} KM</b><br>'
        }

      },
      title: {text: '车辆出勤率'},
      series: [{
        data: [],
        dataLabels: {
          enabled: true,
          rotation: -90,
          color: '#FFFFFF',
          align: 'right',
          format: '{point.y:.1f}', // one decimal
          y: 10, // 10 pixels down from the top
          style: {
            fontSize: '13px',
            fontFamily: 'Verdana, sans-serif'
          }
        }
      }]
    };

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

    vm.exportHistory = function (queryOrg,queryDate) {

      var restCallURL = DEVICEREPORT_EXPORT_URL;

      if (null != queryOrg && null != queryOrg.id) {
        restCallURL += "?orgId=" + queryOrg.id;

      }

      if (null != queryDate && null != queryDate.startDate && null != queryDate.endDate ) {
        restCallURL += "&startDate=" + $filter('date')(queryDate.startDate, 'yyyy-MM-dd');
        restCallURL += "&endDate=" + $filter('date')(queryDate.endDate, 'yyyy-MM-dd');

      }

      $http({
        url: restCallURL,
        method: "GET",
        responseType: 'arraybuffer'
      }).success(function (data, status, headers, config) {
        var blob = new Blob([data], { type: "application/vnd.ms-excel" });
        var objectUrl = window.URL.createObjectURL(blob);

        var anchor = angular.element('<a/>');
        anchor.attr({
          href: objectUrl,
          target: '_blank',
          download: queryOrg.label +'.xls'
        })[0].click();

      }).error(function (data, status, headers, config) {
        Notification.error("下载失败!");
      });

    }


    vm.reset = function () {
      $scope.queryDate = {
        startDate: startDate,
        endDate: new Date()
      };
      $scope.queryOrg = vm.operatorInfo.userdto.organizationDto;
    }

    vm.query($scope.queryOrg,$scope.queryDate);

  }
})();
