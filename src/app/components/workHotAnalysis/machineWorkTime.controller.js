/**
 * Created by zhenyu on 17-5-22.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineWorkTimeController', machineWorkTimeController);

  /** @ngInject */
  function machineWorkTimeController($rootScope, $scope, $http, $filter, Notification, WORK_DISTRIBUTE_TIME_QUERY, serviceResource) {

    //初始化
    var barChart = echarts.init(document.getElementById('barChartContainer'));

    //图表数据
    var data = [[]];
    //请求数据
    var restUrl = WORK_DISTRIBUTE_TIME_QUERY + "workTime?machineType=1";
    var proMiss = serviceResource.restCallService(restUrl, "QUERY");
    proMiss.then(function (datas) {
      //装载数据
      angular.forEach(datas, function (dataa, index, array) {
        data[0].push(new Array(dataa.cumulativeHours, dataa.avgHours, dataa.licenseId));
      })
      //计算机器总数
      var machine = data[0].length;
      //日均作业台数
      var machine0_900 = 0;
      var machine900_1800 = 0;
      var machine1800_3600 = 0;
      //累计作业台数
      var machine0_6 = 0;
      var machine6_12 = 0;
      var machine12_18 = 0;
      var machine18_24 = 0;
      //日均作业台数百分比
      var machine0_900_p, machine900_1800_p, machine1800_3600_p;
      //累计作业台数百分比
      var machine0_6_p, machine6_12_p, machine12_18_p, machine18_24_p;
      //日平均作业时间
      var time0_900 = 0;
      var time900_1800 = 0;
      var time1800_3600 = 0;

      //计算日均作业台数
      for (var i = 0; i < data[0].length; i++) {
        if (data[0][i][0] < 900) {
          machine0_900++;
          time0_900 += data[0][i][1];
        } else if (data[0][i][0] < 1800) {
          machine900_1800++;
          time900_1800 += data[0][i][1];
        } else {
          machine1800_3600++;
          time1800_3600 += data[0][i][1];
        }
      }

      //计算累计作业台数
      for (var i = 0; i < data[0].length; i++) {
        if (data[0][i][1] < 6) {
          machine0_6++;
        } else if (data[0][i][1] < 12) {
          machine6_12++;
        } else if (data[0][i][1] < 18) {
          machine12_18++;
        } else {
          machine18_24++;
        }
      }


      //计算日均作业台数百分比
      machine0_900_p = machine0_900 / machine * 100;
      machine900_1800_p = machine900_1800 / machine * 100;
      machine1800_3600_p = machine1800_3600 / machine * 100;
      machine0_900_p = machine0_900_p.toFixed(2);
      machine900_1800_p = machine900_1800_p.toFixed(2);
      machine1800_3600_p = machine1800_3600_p.toFixed(2);

      //计算累计作业台数百分比
      machine0_6_p = machine0_6 / machine * 100;
      machine6_12_p = machine6_12 / machine * 100;
      machine12_18_p = machine12_18 / machine * 100;
      machine18_24_p = machine18_24 / machine * 100;
      machine0_6_p = machine0_6_p.toFixed(2);
      machine6_12_p = machine6_12_p.toFixed(2);
      machine12_18_p = machine12_18_p.toFixed(2);
      machine18_24_p = machine18_24_p.toFixed(2);

      //计算日均时间
      time0_900 /= machine0_900;
      time900_1800 /= machine900_1800;
      time1800_3600 /= machine1800_3600;
      time0_900 = time0_900.toFixed(2);
      time900_1800 = time900_1800.toFixed(2);
      time1800_3600 = time1800_3600.toFixed(2);


      var barOption = {
        title: {
          text: '机器作业时间分布',
          // textAlign: 'center'
          left: 'center'
        },
        toolbox: {
          feature: {
            dataZoom: {},
            brush: {
              type: ['rect', 'polygon', 'clear']
            }
          }
        },
        brush: {},
        xAxis: {
          name: '累计作业时间(h)',
          nameLocation: 'middle',
          nameGap: 30,
          type: 'value',
          max: 7000,
          splitNumber: 14,
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        yAxis: {
          name: '日平均作业时间(h)',
          nameLocation: 'middle',
          nameGap: 30,
          type: 'value',
          max: 24,
          splitNumber: 5,
          splitLine: {
            lineStyle: {
              color: '#f0f0f0'
            }
          }
        },
        dataZoom: [
          //底部缩放滑动条
          // {
          //     type: 'slider',
          //     show: true,
          //     xAxisIndex: [0],
          //     start: 0,
          // },
          {
            type: 'inside',
            xAxisIndex: [0],
            start: 0
          }, {
            type: 'inside',
            yAxisIndex: [0],
            start: 0
          }
        ],
        series: [{
          animation: false,
          data: data[0],
          type: 'scatter',
          symbol: 'circle',
          symbolSize: 4,
          itemStyle: {
            normal: {
              opacity: 0.8
            }
          },
          markLine: {
            data: [{
              name: '0-5',
              yAxis: 6
            }, {
              name: '5-10',
              yAxis: 12
            }, {
              name: '10-15',
              yAxis: 18
            }, {
              name: '20-25',
              yAxis: 24
            }, {
              name: '0-900',
              xAxis: 900
            }, {
              name: '900-1800',
              xAxis: 1800
            }],
            lineStyle: {
              normal: {
                color: '#6797e5',
                type: 'solid'
              }
            },
            label: {
              normal: {
                show: false
              }
            },
            symbol: false
          },
          markArea: {
            data: [
              [{
                name: machine0_6 + '台(' + machine0_6_p + '%)',
                coord: [3000, 2]
              }, {
                coord: [3400, 4]
              }],
              [{
                name: machine6_12 + '台(' + machine6_12_p + '%)',
                coord: [3000, 8]
              }, {
                coord: [3400, 10]
              }],
              [{
                name: machine12_18 + '台(' + machine12_18_p + '%)',
                coord: [3000, 14]
              }, {
                coord: [3400, 16]
              }],
              [{
                name: machine18_24 + '台(' + machine18_24_p + '%)',
                coord: [3000, 20]
              }, {
                coord: [3400, 22]
              }],
              [{
                name: machine0_900 + '台(' + machine0_900_p + '%)\n日均作业：' + time0_900 + 'h',
                coord: [200, 20]
              }, {
                coord: [600, 22]
              }],
              [{
                name: machine900_1800 + '台(' + machine900_1800_p + '%)\n日均作业：' + time900_1800 + 'h',
                coord: [1200, 20]
              }, {
                coord: [1600, 22]
              }],
              [{
                name: machine1800_3600 + '台(' + machine1800_3600_p + '%)\n日均作业：' + time1800_3600 + 'h',
                coord: [2200, 20]
              }, {
                coord: [2600, 22]
              }]
            ],
            label: {
              normal: {
                position: 'inside',
                textStyle: {
                  color: 'green'
                }
              }
            },
            itemStyle: {
              normal: {
                color: '#f3f3f3',
                borderColor: '#999',
                borderWidth: '1'
              }
            }
          }
        }]


      };
      //矩形选中事件
      barChart.on('brushselected', renderBrushed);

      //set option
      barChart.setOption(barOption);


      function renderBrushed(params) {
        var mainSeries = params.batch[0].selected[0];
        var selectedItems = [];

        for (var i = 0; i < mainSeries.dataIndex.length; i++) {
          var rawIndex = mainSeries.dataIndex[i];
          var dataItem = data[0][rawIndex];
          selectedItems.push(dataItem);
        }

        console.log(selectedItems);
      }

    }, function (reason) {
      Notification.error("获取数据失败");
    })

  }
})();
