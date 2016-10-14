/**
 * Created by shuangshan on 16/1/1.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('ReportChartController', ReportChartController);

  /** @ngInject */
  function ReportChartController($rootScope,$filter, serviceResource,permissions,HOME_STATISTICS_DATA_URL,Notification) {
    var vm = this;


    //查询最近上传数据的设备
    vm.loadRecentUploadDevice=function () {
      var date = new Date();
      date.setDate(date.getDate()-6);  //默认查询最近一个月的异常数据
      var beginDate=$filter('date')(date,'yyyy-MM-dd');;
      var endDate=$filter('date')(new Date(),'yyyy-MM-dd');;



      var url ="http://localhost:8080/rest/deviceMonitor/deviceDataWeekly";
      var result = serviceResource.restCallService(url,"GET");
      result.then(function (data) {
        if (data.code == 0 && data.content!= null) {
          var dataContent  = data.content;
     //     vm.uploadDevice.series.data=[1,3,6,9];

      //    vm.uploadDevice.series[0].remove(false);
        //  vm.uploadDevice.splice(0, 1)
          var rnd = [];
          var reportDates=[];
          for(var i=0;i<dataContent.length;i++){
            rnd.push(dataContent[i].num);
            reportDates.push(dataContent[i].statDesc);
          }

          vm.uploadDevice.series.push({
            data: rnd
          });

          vm.uploadDevice.xAxis.categories=reportDates;

        }
      })
    }

    vm.uploadDevice={
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
        categories:[],
        labels: {

        }
      },
      //y轴坐标显示
      yAxis: {
        title: {text: '次数'},
      },
      series: [],
    }

    vm.loadTodayUploadDevice=function () {

      var url ="http://localhost:8080/rest/deviceMonitor/deviceDataToday";
      var result = serviceResource.restCallService(url,"GET");
      result.then(function (data) {
        if (data.code == 0 && data.content!= null) {
          var dataContent  = data.content;
          //     vm.uploadDevice.series.data=[1,3,6,9];

          //    vm.uploadDevice.series[0].remove(false);
          //  vm.uploadDevice.splice(0, 1)
          var rnd = [];
          var reportDates=[];
          for(var i=0;i<dataContent.length;i++){
            rnd.push(dataContent[i].num);
            reportDates.push(dataContent[i].statDesc);
          }

          vm.uploadTodayDevice.series.push({
            data: rnd
          });

          vm.uploadTodayDevice.xAxis.categories=reportDates;

        }
      })
    }

    vm.uploadTodayDevice={
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
        categories:[],
        labels: {

        }
      },
      //y轴坐标显示
      yAxis: {
        title: {text: '次数'},
      },
      series: [],
    }

    vm.loadRecentUploadDevice();
    vm.loadTodayUploadDevice();
  }
})();
