/**
 * Created by mengwei on 17-7-31.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('profitStatisticsController', profitStatisticsController);

  /** @ngInject */
  function profitStatisticsController($scope) {

    var vm = this;
    vm.type = 'all';
    vm.typeList = ['all','one','two'];

    vm.height = 'all';
    vm.heightList = ['8','6','4'];

    vm.Brand = 'all'
    vm.BrandList = ['1','2','3'];

    vm.sim = 'all';
    vm.simList = ['1111','2222','33333'];


    //income
    var lineChart = echarts.init(document.getElementById('incomeLine'));
    var option = {
        title: {
          text: '收入统计'
        },
        tooltip : {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data:['租金收入','其他收入']
        },
        toolbox: {
          feature: {
            saveAsImage: {}
          }
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
            boundaryGap : false,
            data : ['周一','周二','周三','周四','周五','周六','周日']
          }
        ],
        yAxis : [
          {
            type : 'value'
          }
        ],
        series : [
          {
            name:'租金收入',
            type:'line',
            stack: '总量',
            areaStyle: {normal: {}},
            data:[120, 132, 101, 134, 90, 230, 210]
          },
          {
            name:'其他收入',
            type:'line',
            stack: '总量',
            areaStyle: {normal: {}},
            data:[220, 182, 191, 234, 290, 330, 310]
          }
        ]
      };
    lineChart.setOption(option);

    //cost
    var topPie =  echarts.init(document.getElementById('topPie'));
    var topPieOption = {
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        x: 'left',
        data:['直达','营销广告','搜索引擎','邮件营销','联盟广告','视频广告','百度','谷歌','必应','其他']
      },
      series: [
        {
          name:'访问来源',
          type:'pie',
          selectedMode: 'single',
          radius: [0, '30%'],

          label: {
            normal: {
              position: 'inner'
            }
          },
          labelLine: {
            normal: {
              show: false
            }
          },
          data:[
            {value:335, name:'直达', selected:true},
            {value:679, name:'营销广告'},
            {value:1548, name:'搜索引擎'}
          ]
        },
        {
          name:'访问来源',
          type:'pie',
          radius: ['40%', '55%'],

          data:[
            {value:335, name:'直达'},
            {value:310, name:'邮件营销'},
            {value:234, name:'联盟广告'},
            {value:135, name:'视频广告'},
            {value:1048, name:'百度'},
            {value:251, name:'谷歌'},
            {value:147, name:'必应'},
            {value:102, name:'其他'}
          ]
        }
      ]
    };
    topPie.setOption(topPieOption);

    var bottomPie = echarts.init(document.getElementById('bottomPie'));
    var bottomPieoption = {
      title : {
        text: '某站点用户访问来源',
        subtext: '纯属虚构',
        x:'center'
      },
      tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['直接访问','邮件营销','联盟广告','视频广告','搜索引擎']
      },
      series : [
        {
          name: '访问来源',
          type: 'pie',
          radius : '55%',
          center: ['50%', '60%'],
          data:[
            {value:335, name:'直接访问'},
            {value:310, name:'邮件营销'},
            {value:234, name:'联盟广告'},
            {value:135, name:'视频广告'},
            {value:1548, name:'搜索引擎'}
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
    bottomPie.setOption(bottomPieoption);

    //profit
    var profitBar = echarts.init(document.getElementById('profitBar'));
    var profitBarOption = {
      tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
          type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      legend: {
        data: ['剪叉', '直臂','曲臂']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis:  {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: ['周一','周二','周三','周四','周五','周六','周日']
      },
      series: [
        {
          name: '剪叉',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: [320, 302, 301, 334, 390, 330, 320]
        },
        {
          name: '直臂',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: [120, 132, 101, 134, 90, 230, 210]
        },
        {
          name: '曲臂',
          type: 'bar',
          stack: '总量',
          label: {
            normal: {
              show: true,
              position: 'insideRight'
            }
          },
          data: [220, 182, 191, 234, 290, 330, 310]
        }
      ]
    };
    profitBar.setOption(profitBarOption);

  }
})();
