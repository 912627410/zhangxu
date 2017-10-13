/**
 * Created by xiaopeng on 16-12-14.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('attendanceController', attendanceController);

  /** @ngInject */
  function attendanceController($rootScope, $scope ,languages,$filter, $http, treeFactory,  Notification, serviceResource, DEVICEREPORT_ATTENDANCE_URL, DEVICEREPORT_EXPORT_URL) {
    var vm = this;
    vm.operatorInfo = $rootScope.userInfo;
    vm.querySubOrg = true;

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
            text: languages.findKey('machineAttendance')
          }
        },
        legend: {
          enabled: false
        },
        tooltip: {
          pointFormat: languages.findKey('deviceNum')+': <b>{point.deviceNum} </b><br>' +
          languages.findKey('attendance')+':<b>{point.y:.1f} %</b><br>' +
          languages.findKey('totalWorkingHours')+': <b>{point.totalDuration} '+languages.findKey('hour')+'</b><br>' +
          languages.findKey('totalMileage')+': <b>{point.totalMileage} KM</b><br>'
        }

      },
      title: {text: languages.findKey('machineAttendance')},
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
        Notification.warning(reason.data.message);
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

      if(vm.querySubOrg){
        restCallURL += "&parentOrgId=" + queryOrg.id;
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
          window.navigator.msSaveOrOpenBlob(blob,  queryOrg.label +'.xls')
        } else if (navigator.userAgent.search("Firefox") !== -1) { // Firefox
          anchor.css({display: 'none'});
          angular.element(document.body).append(anchor);
          anchor.attr({
            href: URL.createObjectURL(blob),
            target: '_blank',
            download:   queryOrg.label +'.xls'
          })[0].click();
          anchor.remove();
        } else { // Chrome
          anchor.attr({
            href: URL.createObjectURL(blob),
            target: '_blank',
            download:  queryOrg.label +'.xls'
          })[0].click();
        }

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
      vm.SubOrg = true;
    }

    vm.query($scope.queryOrg,$scope.queryDate);

  }
})();
