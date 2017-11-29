/**
 * Created by shuangshan on 16/1/1.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('ReportChartController', ReportChartController);

  /** @ngInject */
  function ReportChartController(serviceResource, permissions, LOAD_RECENT_UPLOAD_PAGE_URL, LOAD_TODAY_UPLOAD_PAGE_URL) {
    var vm = this;

    /**
     * 查询最近六天上传数据的设备
     */
    vm.loadRecentUploadDevice = function () {
      var date = new Date();
      date.setDate(date.getDate() - 6);
      var result = serviceResource.restCallService(LOAD_RECENT_UPLOAD_PAGE_URL, "GET");
      result.then(function (data) {
        if (data.code == 0 && data.content != null) {
          var dataContent = data.content;
          var rnd = [];
          var reportDates = [];
          for (var i = 0; i < dataContent.length; i++) {
            rnd.push(dataContent[i].num);
            reportDates.push(dataContent[i].statDesc);
          }

          vm.uploadDevice.series.push({
            name: '最近6天数据上传',
            data: rnd
          });

          vm.uploadDevice.xAxis.categories = reportDates;

        }
      })
    }

    vm.uploadDevice = {
      options: {
        chart: {
          type: 'line',
          zoomType: 'xy',
        }
      },
      title: {
        text: '最近6天数据上传情况',
      },
      //x轴坐标显示
      xAxis: {
        title: {
          text: '日期'
        },
        categories: [],
        labels: {}
      },
      //y轴坐标显示
      yAxis: {
        title: {text: '次数'},
      },
      series: [],
    }


    /**
     * 当天每小时的上传数量
     */
    vm.loadTodayUploadDeviceType = function () {
      var result = serviceResource.restCallService(LOAD_TODAY_UPLOAD_PAGE_URL, "GET");
      result.then(function (data) {
        if (data.code == 0 && data.content != null) {
          var dataContent = data.content;
          var rnd = [];
          var reportDates = [];
          for (var i = 0; i < dataContent.length; i++) {
            rnd.push(dataContent[i].num);
            reportDates.push(dataContent[i].statDesc);
          }
          vm.uploadTodayDevice = {
            options: {
              chart: {
                type: 'line',
                zoomType: 'xy',
              }
            },
            title: {
              text: '当天数据上传情况',
            },
            //x轴坐标显示
            xAxis: {
              title: {
                text: '时间'
              },
              categories: reportDates,
              labels: {}
            },
            //y轴坐标显示
            yAxis: {
              title: {text: '次数'},
            },
            series: [{
              name: '当天数据上传',
              data: rnd
            }]
          }
        }
      })
    }

    /**
     * 如果有图表的查看权限就去load图表数据
     */
    if (permissions.getPermissions("device:reportChart")) {
      vm.loadRecentUploadDevice();
      //性能问题,暂时隐掉
      //vm.loadTodayUploadDeviceType();
    }

  }
})();
