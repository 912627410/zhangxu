/**
 * Created by zhenyu on 17-7-6.
 */

(function(){
  'use strict';

  angular.module('GPSCloud')
    .controller('warZoneController',warZoneController);

  function warZoneController(){

    var pieChartList = document.getElementsByClassName('piechart');
    var barChartList = document.getElementsByClassName('barchart');

    var pieChart1 = echarts.init(pieChartList[0]);
    var pieChart2 = echarts.init(pieChartList[1]);
    var barChart1 = echarts.init(barChartList[0]);
    var barChart2 = echarts.init(barChartList[1]);

    var pieChartOption = {
      title : {
        text: '五大战区分布图',
        x:'center'
      },
      tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['第一战区','第二战区','第三战区','第四战区','第五战区']
      },
      series : [
        {
          name: '战区分布',
          type: 'pie',
          radius : '55%',
          center: ['50%', '60%'],
          data:[
            {value:335, name:'第一战区'},
            {value:310, name:'第二战区'},
            {value:234, name:'第三战区'},
            {value:135, name:'第四战区'},
            {value:1548, name:'第五战区'}
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };


    var barChartOption = {
      tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
          type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      legend: {
        data:['第一战区','第二战区','第三战区','第四战区','第五战区']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis : [
        {
          type : 'category',
          data : ['第一季度','第二季度','第三季度','第四季度']
        }
      ],
      yAxis : [
        {
          type : 'value'
        }
      ],
      series : [
        {
          name:'第一战区',
          type:'bar',
          data:[320, 332, 301, 334]
        },
        {
          name:'第二战区',
          type:'bar',
          data:[120, 132, 101, 134]
        },
        {
          name:'第三战区',
          type:'bar',
          data:[220, 182, 191, 234]
        },
        {
          name:'第四战区',
          type:'bar',
          data:[150, 232, 201, 154]
        },
        {
          name:'第五战区',
          type:'bar',
          data:[862, 1018, 964, 1026],
          markLine : {
            lineStyle: {
              normal: {
                type: 'dashed'
              }
            },
            data : [
              [{type : 'min'}, {type : 'max'}]
            ]
          }
        }
      ]
    };


    pieChart1.setOption(pieChartOption);
    pieChart2.setOption(pieChartOption);
    barChart1.setOption(barChartOption);
    barChart2.setOption(barChartOption);






  }


})();
