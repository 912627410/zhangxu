/**
 * Created by shuangshan on 16/1/1.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('ReportChartController', ReportChartController);

  /** @ngInject */
  function ReportChartController($filter, serviceResource, permissions, LOAD_RECENT_UPLOAD_PAGE_URL, LOAD_TODAY_UPLOAD_PAGE_URL) {
    var vm = this;

    //查询最近上传数据的设备
    vm.loadRecentUploadDevice = function () {
      var date = new Date();
      date.setDate(date.getDate() - 6);  //默认查询最近一个月的异常数据

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


    vm.loadTodayUploadDeviceType = function () {
      //var url ="http://localhost:8080/rest/deviceMonitor/deviceDataTypeToday";
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
            }],
          }
        }
      })
    }

    vm.uploadTodayDeviceType = {
      options: {
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          type: 'pie',
          // zoomType: 'xy',
        }
      },
      title: {
        text: '当天设备类型'
      },
      tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            style: {
              color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            }
          }
        }
      },
      series: [{
        name: '设备类型',
        colorByPoint: true,
        data: [{
          name: 'Microsoft Internet Explorer',
          y: 56.33
        }, {
          name: 'Chrome',
          y: 24.03,
          sliced: true,
          selected: true
        }, {
          name: 'Firefox',
          y: 10.38
        }, {
          name: 'Safari',
          y: 4.77
        }, {
          name: 'Opera',
          y: 0.91
        }, {
          name: 'Proprietary or Undetectable',
          y: 0.2
        }]
      }]
    }


    if (permissions.getPermissions("device:reportChart")) {
      vm.loadRecentUploadDevice();
      vm.loadTodayUploadDeviceType();
    }

  }
})();
