/**
 * Created by zhenyu on 17-5-22.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineWorkTimeController', machineWorkTimeController);

  /** @ngInject */
  function machineWorkTimeController($rootScope, $scope, $http, $filter, Notification, WORK_DISTRIBUTE_TIME_QUERY, WORK_DISTRIBUTE_DAYS_QUERY,serviceResource, NgTableParams, ngTableDefaults) {

    var vm = this;
    ngTableDefaults.settings.counts = [];

    vm.tableAverageDateType = 1; // 默认日平均作业时间
    vm.tableTotalDateType = 1;
    vm.averageDateType = 1;
    // vm.totalDateType=1;//默认累计作业时间为小时
    // vm.dateType1 = 0; //默认查询全部类型
    // vm.machineType = '1,2,3';//默认查询全部

    vm.monthDateDeviceData = new Date();
    vm.monthDateOpenStatusDeviceData = {
      opened: false
    };
    vm.monthDateOpenDeviceData = function ($event) {
      vm.monthDateOpenStatusDeviceData.opened = true;
    };
    vm.dateOptions1 = {
      formatYear: 'yyyy',
      startingDay: 1,
      minMode: 'month'
    };
    vm.change = function(dateType1){
      if(dateType1==1){
        vm.quarterQuery = true;
        vm.monthQuery = false;
        var quarterDate = new Date();
        var dates = [];
        //默认生成最近的8个季度周期供用户选择
        for(var i=0;i<8;i++) {
          quarterDate.setMonth(quarterDate.getMonth() - 3);
          var quarter = Math.ceil((quarterDate.getMonth()+1) / 3);
          switch (quarter) {
            case 1:
              var key = '01';
              var value = '年第一季度';
              break;
            case 2:
              key = '02';
              value = '年第二季度';
              break;
            case 3:
              key = '03';
              value = '年第三季度';
              break;
            case 4:
              key = '04';
              value = '年第四季度';
              break;
          }
          var date = {
            key: '' + quarterDate.getFullYear() + key,
            value: quarterDate.getFullYear() + value
          };
          dates.push(date);
        }
        vm.dateType2 = dates[0].key;
        vm.quarter = dates;
        vm.monthDateDeviceData = '';
        vm.title = dates[0].value;
      } else if(dateType1==2){
        vm.quarterQuery = false;
        vm.monthQuery = true;
        vm.monthDateDeviceData = new Date();
        vm.dateType2 = '';
        vm.title = vm.monthDateDeviceData.getFullYear()+'年'+(vm.monthDateDeviceData.getMonth()+1)+'月';
      } else if(dateType1==0){
        vm.quarterQuery = false;
        vm.monthQuery = false;
        vm.monthDateDeviceData = '';
      }
    };

    vm.change1 = function(){
      var x=document.getElementById("qwert").selectedIndex+3;
      var y=document.getElementsByTagName("option");
      vm.title = y[x].text ;
    };
    vm.change2 = function(monthDateDeviceData){

      var month = monthDateDeviceData.getMonth() +1;
      vm.title = monthDateDeviceData.getFullYear() +'年'+ month + '月';
    };


    vm.dataList = [];
    var barChart1 = echarts.init(document.getElementById('barChartContainer'));
    //设置图形自适应
    window.onresize = function(){barChart1.resize();}
    var barOption1 = {
      title: {
        text: '机器作业时间分布',
        // textAlign: 'center'
        left: 'center'
      },
      toolbox:{
        orient:'horizontal',
        itemSize:20,
        itemGap:15,
        right:200,
        top:'25',
        showTitle:'true',
        feature: {
          dataZoom: {
            show:true,
            iconStyle:{
              normal:{
                textPosition:'top'
              },
              emphasis: {
                textPosition: 'top'
              }
            }
          },
          brush: {
            type: ['rect', 'polygon', 'clear'],
            iconStyle:{
              normal:{
                opacity:0.8,
                textPosition:'top'
              },
              emphasis: {
                textPosition: 'top'
              }
            }
          },
          restore: {
            show:true,
            iconStyle:{
              normal:{
                opacity:0.8,
                textPosition:'top'
              },
              emphasis: {
                textPosition: 'top'
              }
            }
          }
        }
      },
      brush: {},
      xAxis: {
        name: '累计作业时间(h)',
        nameLocation: 'middle',
        nameGap: 30,
        type: 'value',
        min:0,
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
        min:0,
        max: 24,
        splitNumber: 5,
        splitLine: {
          lineStyle: {
            color: '#f0f0f0'
          }
        }
      },
      series: [{
        animation: false,
        data: '',
        type: 'scatter',
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: {
          normal: {
            opacity: 0.8
          }
        },
        markLine: {
          data: [],
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

    barOption1.series[0].markLine.lineStyle.normal.type='solid';
    barOption1.series[0].markLine.data.push({
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
        name: '0-1000',
        xAxis: 1000
      }, {
        name: '1000-2000',
        xAxis: 2000
      },
      [{
        coord: [0, 0]
      }, {
        coord: [7500, 28]
      }]);

    barOption1.series[0].markLine.data.push({
      name: '0-1000',
      xAxis: 1000
    }, {
      name: '1000-2000',
      xAxis: 2000
    });
    // barOption1.series[0].markArea.data.push(
    //   [{
    //     name: 0 + '台(' + 0+ '%)',
    //     coord: [3200, 2]
    //   }, {
    //     coord: [3900, 4]
    //   }],
    //   [{
    //     name: 0 + '台(' + 0 + '%)',
    //     coord: [3200, 8]
    //   }, {
    //     coord: [3900, 10]
    //   }],
    //   [{
    //     name: 0 + '台(' + 0 + '%)',
    //     coord: [3200, 14]
    //   }, {
    //     coord: [3900, 16]
    //   }],
    //   [{
    //     name: 0 + '台(' + 0 + '%)',
    //     coord: [3200, 20]
    //   }, {
    //     coord: [3900, 22]
    //   }],
    //   [{
    //     name: 0 + '台(' + 0 + '%)\n日均作业：' + 0 + 'h',
    //     coord: [200, 20]
    //   }, {
    //     coord: [980, 22]
    //   }],
    //   [{
    //     name: 0 + '台(' + 0 + '%)\n日均作业：' + 0 + 'h',
    //     coord: [1200, 20]
    //   }, {
    //     coord: [1950, 22]
    //   }],
    //   [{
    //     name: 0 + '台(' + 0 + '%)\n日均作业：' + 0 + 'h',
    //     coord: [2200, 20]
    //   }, {
    //     coord: [2950, 22]
    //   }]
    // );


    barChart1.setOption(barOption1);

    vm.ok = function (machineType, totalDateType,averageDateType, dateType1, dateType2,monthDateDeviceData) {
      if (null == machineType || "" == machineType) {
        machineType = 1; //默认为装载机
      }
      if (null == averageDateType || "" == averageDateType) {
        averageDateType = 1;
      }
      if (null == totalDateType || "" == totalDateType) {
        vm.totalDateType=1;
        totalDateType = 1; //默认为小时
      }
      if (null == dateType1 || "" == dateType1) {
        dateType1 = 0;  //默认为全部
      }
      // if (null == dateType2 || "" == dateType2) {
      //   dateType2 = 201702;  //默认为2017第二季度
      // }

      vm.tableAverageDateType = averageDateType;
      vm.tableTotalDateType = totalDateType;

      vm.tableParams = new NgTableParams({}, {});

      //图表数据
      var data = [[]];
      //判断查询时间还是天
      if (totalDateType == 1) {
        var restUrl = WORK_DISTRIBUTE_TIME_QUERY;//shijian
      } else if(totalDateType==2){
        var restUrl = WORK_DISTRIBUTE_DAYS_QUERY;//tian
      }
      //判断全部/季度/月
      if (dateType1 == 0) {
        restUrl += '?';
      } else if (dateType1 == 1) {
        restUrl += '/quarter?';
      } else if (dateType1 == 2) {
        restUrl += '/month?';
      }
      //判断车型
      restUrl += 'machineType=' + machineType;
      //拼接时间
      if (totalDateType == 1) {
        if(dateType1==1) {
          restUrl += '&workTimeQuarter=' + dateType2;
        } else if(dateType1==2){
          var month = monthDateDeviceData.getMonth() +1;
          if(month<10){
            var monthDateFormated = monthDateDeviceData.getFullYear() +'0'+ month;
          }else{
            monthDateFormated = ''+ monthDateDeviceData.getFullYear() + month;
          }
          restUrl += '&workTimeMonth=' + monthDateFormated;
        }
      } else if(totalDateType==2){
        if(dateType1==1) {
          restUrl += '&workDaysQuarter=' + dateType2;
        } else if(dateType1==2){
          var month = monthDateDeviceData.getMonth() +1;
          if(month<10){
            var monthDateFormated = monthDateDeviceData.getFullYear() +'0'+ month;
          }else{
            monthDateFormated = ''+ monthDateDeviceData.getFullYear() + month;
          }
          restUrl += '&workDaysMonth=' + monthDateFormated;
        }
      }

      var proMiss = serviceResource.restCallService(restUrl, "QUERY");
      proMiss.then(function (datas) {
        //装载数据
        angular.forEach(datas, function (dataa, index, array) {
          data[0].push(new Array(dataa.cumulative, dataa.avgHours, dataa.licenseId));
        });

        //计算机器总数
        var machine = data[0].length;
        //日均作业台数
        var machine0_1000 = 0;
        var machine1000_2000 = 0;
        var machine2000_4000 = 0;
        //累计作业台数
        var machine0_6 = 0;
        var machine6_12 = 0;
        var machine12_18 = 0;
        var machine18_24 = 0;
        //日均作业台数百分比
        var machine0_1000_p, machine1000_2000_p, machine2000_4000_p;
        //累计作业台数百分比
        var machine0_6_p, machine6_12_p, machine12_18_p, machine18_24_p;
        //日平均作业时间
        var time0_1000 = 0;
        var time1000_2000 = 0;
        var time2000_4000 = 0;

        var xMax =0;
        //计算日均作业台数
        for (var i = 0; i < data[0].length; i++) {
          if (data[0][i][0] < 1000) {
            machine0_1000++;
            time0_1000 += data[0][i][1];
          } else if (data[0][i][0] < 2000) {
            machine1000_2000++;
            time1000_2000 += data[0][i][1];
          } else if(data[0][i][0] >= 2000) {
            machine2000_4000++;
            time2000_4000 += data[0][i][1];
          }
          //找出X轴数据最大值
          if(xMax<data[0][i][0]){
            xMax = data[0][i][0];
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
          } else if (data[0][i][1] >= 18) {
            machine18_24++;
          }
        }

        if(totalDateType == 1) {
          //计算日均作业台数百分比
          machine0_1000_p = machine0_1000 / machine * 100;
          machine1000_2000_p = machine1000_2000 / machine * 100;
          machine2000_4000_p = machine2000_4000 / machine * 100;
          machine0_1000_p = machine0_1000_p.toFixed(2);
          machine1000_2000_p = machine1000_2000_p.toFixed(2);
          machine2000_4000_p = machine2000_4000_p.toFixed(2);
        }

        //计算累计作业台数百分比
        machine0_6_p = machine0_6 / machine * 100;
        machine6_12_p = machine6_12 / machine * 100;
        machine12_18_p = machine12_18 / machine * 100;
        machine18_24_p = machine18_24 / machine * 100;
        machine0_6_p = machine0_6_p.toFixed(2);
        machine6_12_p = machine6_12_p.toFixed(2);
        machine12_18_p = machine12_18_p.toFixed(2);
        machine18_24_p = machine18_24_p.toFixed(2);

        //初始化
        var barChart = echarts.init(document.getElementById('barChartContainer'));
        //设置图形自适应
        window.onresize = function(){barChart.resize();}
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
              },
              restore: {}
            }
          },
          brush: {},
          xAxis: {
            // name: '累计作业时间(h)',
            nameLocation: 'middle',
            nameGap: 30,
            max:'dataMax',
            type: 'value',
            // max: 7000,
            // splitNumber: 14,
            splitLine: {
              lineStyle: {
                color: '#f0f0f0'
              }
            }
          },
          yAxis: {
            // name: '日平均作业时间(h)',
            nameLocation: 'middle',
            nameGap: 30,
            type: 'value',
            // max: 24,
            // splitNumber: 5,
            splitLine: {
              lineStyle: {
                color: '#f0f0f0'
              }
            }
          },
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
              data: [],
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

        if(averageDateType == 1) {

          if(machineType=="1,2,3" && totalDateType ==1 && dateType1==0){
            //计算斜线
            var stringTime = "2016-03-01 00:00:00";
            var k2 = Date.parse(new Date(stringTime));
            var days =Math.floor(Math.abs(new Date() - k2) / 1000 / 60 / 60 /24);
            var xie=xMax/days;

            barOption.yAxis.name="日平均作业时间(h)";
            barOption.yAxis.max=24;
            barOption.yAxis.splitNumber=5;
            barOption.series[0].markLine.lineStyle.normal.type='solid';
            barOption.series[0].markLine.data.push({
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
                name: '0-1000',
                xAxis: 1000
              }, {
                name: '1000-2000',
                xAxis: 2000
              },
              [{
                coord: [0, 0]
              }, {
                coord: [xMax, xie]
              }]);
          }else {
            // //计算斜线
            // var stringTime = "2016-03-01 00:00:00";
            // var k2 = Date.parse(new Date(stringTime));
            // var days =Math.floor(Math.abs(new Date() - k2) / 1000 / 60 / 60 /24);
            // var xie=xMax/days;

            barOption.yAxis.name="日平均作业时间(h)";
            barOption.yAxis.max=24;
            barOption.yAxis.splitNumber=5;
            barOption.series[0].markLine.lineStyle.normal.type='solid';
            barOption.series[0].markLine.data.push({
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
                name: '0-1000',
                xAxis: 1000
              }, {
                name: '1000-2000',
                xAxis: 2000
              });
          }
        } else if(averageDateType == 2) {
          barOption.yAxis.name="月平均作业时间(h)";
          barOption.yAxis.max=750;
          barOption.yAxis.splitNumber=5;
          barOption.series[0].markLine.data.push({
            name: '0-150',
            yAxis: 188
          }, {
            name: '150-300',
            yAxis: 376
          }, {
            name: '300-450',
            yAxis: 564
          }, {
            name: '450-600',
            yAxis: 750
          });
        }

        if(totalDateType == 1) {
          barOption.xAxis.name="累计作业时间(h)";
          // barOption.xAxis.max = 8000;
          barOption.xAxis.splitNumber= 14;
          barOption.series[0].markLine.data.push({
            name: '0-1000',
            xAxis: 1000
          }, {
            name: '1000-2000',
            xAxis: 2000
          });
          barOption.series[0].markArea.data.push(
            [{
              name: machine0_6 + '台(' + machine0_6_p + '%)',
              coord: [3200, 2]
            }, {
              coord: [3900, 4]
            }],
            [{
              name: machine6_12 + '台(' + machine6_12_p + '%)',
              coord: [3200, 8]
            }, {
              coord: [3900, 10]
            }],
            [{
              name: machine12_18 + '台(' + machine12_18_p + '%)',
              coord: [3200, 14]
            }, {
              coord: [3900, 16]
            }],
            [{
              name: machine18_24 + '台(' + machine18_24_p + '%)',
              coord: [3200, 20]
            }, {
              coord: [3900, 22]
            }],
            [{
              name: machine0_1000 + '台(' + machine0_1000_p + '%)',
              coord: [200, 20]
            }, {
              coord: [980, 22]
            }],
            [{
              name: machine1000_2000 + '台(' + machine1000_2000_p + '%)',
              coord: [1200, 20]
            }, {
              coord: [1950, 22]
            }],
            [{
              name: machine2000_4000 + '台(' + machine2000_4000_p + '%)',
              coord: [2200, 20]
            }, {
              coord: [2950, 22]
            }]
          );
        } else if (totalDateType == 2) {
          barOption.xAxis.name="车龄(天)";
          // barOption.xAxis.max = 500;
          barOption.xAxis.splitNumber= 10;
          // barOption.series[0].markLine.data.push({
          //   name: '0-50',
          //   xAxis: 50
          // }, {
          //   name: '50-100',
          //   xAxis: 100
          // });
          barOption.series[0].markArea.data.push(
            [{
              name: machine0_6 + '台(' + machine0_6_p + '%)',
              coord: [455, 2]
            }, {
              coord: [495, 4]
            }],
            [{
              name: machine6_12 + '台(' + machine6_12_p + '%)',
              coord: [455, 8]
            }, {
              coord: [495, 10]
            }],
            [{
              name: machine12_18 + '台(' + machine12_18_p + '%)',
              coord: [455, 14]
            }, {
              coord: [495, 16]
            }],
            [{
              name: machine18_24 + '台(' + machine18_24_p + '%)',
              coord: [455, 20]
            }, {
              coord: [495, 22]
            }]
          );
        }

        //矩形选中事件
        barChart.on('brushselected', renderBrushed);

        //set option
        barChart.setOption(barOption);


        function renderBrushed(params) {
          var mainSeries = params.batch[0].selected[0];
          vm.dataList=[];
          for (var i = 0; i < mainSeries.dataIndex.length; i++) {
            var rawIndex = mainSeries.dataIndex[i];
            var dataItem = data[0][rawIndex];
            vm.dataList.push({name: dataItem[2], avgHours: dataItem[1],cumulative:dataItem[0]});
          }

          vm.tableParams = new NgTableParams({
            count: 10
          }, {
            dataset: vm.dataList
          });
          $scope.$apply();
        }

      }, function (reason) {
        Notification.error("获取数据失败");
      })
    };

    // vm.ok('1,2,3', 1,1, 0, null);

  }
})();
