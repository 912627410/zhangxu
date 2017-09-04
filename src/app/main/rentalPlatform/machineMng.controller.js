/**
 * Created by xielongwang on 2017/7/21.
 */
(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalMachineMngController', rentalMachineMngController);

  /** @ngInject */
  function rentalMachineMngController($rootScope, $scope, $window, $http, $location, $anchorScroll, NgTableParams,$uibModal, ngTableDefaults, languages, serviceResource, Notification,
                                      RENTAL_HOME_MAP_GPSDATA_URL, RENTAL_ALARM_MSG_URL, RENTAL_MACHINE_COUNT_URL,RENTAL_MACHINE_MONITOR_URL, ALERT_TREND_URL,RENTAL_MACHINE_RATE_URL,MACHINE_RENT_URL) {
    var vm = this;
    //定义页面导航
    $scope.navs = [{
      "title": "rental", "alias": "当前位置", "icon": "fa-map"
    }, {
      "title": "rental.machineCurrentStatus", "alias": "当前状态", "icon": "fa-signal"
    }, {
      "title": "rental.machineAlarmInfo", "alias": "报警信息", "icon": "fa-exclamation-triangle"
    }];
    vm.rightBoxBottomHeight = 20;
    vm.rightBoxTopHeightTemp = 20;
    //定义报警类型,1:围栏报警 2:保养提醒 3:离线提醒(长时间未回传数据)
    vm.fenceAlarm = 0;//围栏报警
    vm.machineAlarm = 0;//车辆报警
    vm.keepAlarm = 0;//保养报警
    vm.offLineAlarm = 0;//离线报警
    //定义车辆类型数量 1:"剪叉",2:"直臂",3:"曲臂"
    vm.machineCount = 0;//总数
    vm.shearFork = 0;//剪叉
    vm.straightArm = 0;//直臂
    vm.crankArm = 0;//曲臂
    /**
     * 自适应高度函数
     * @param windowHeight
     */
    vm.adjustWindow = function (windowHeight) {
      var baseBoxContainerHeight = windowHeight - 50 - 10 - 25 - 5 - 90 - 30 + 5;//50 topBar的高,10间距,25面包屑导航,5间距90msgBox高,15间距
      //baseBox自适应高度
      vm.baseBoxContainer = {
        "min-height": baseBoxContainerHeight + "px"
      }
      var baseBoxMapContainerHeight = baseBoxContainerHeight - 45 - 15;//地图上方的header高度
      //地图的自适应高度
      vm.baseBoxMapContainer = {
        "min-height": baseBoxMapContainerHeight + "px"
      }

      var rightBoxTopHeight = (baseBoxContainerHeight  - 50) / 2;
      vm.rightBoxTopHeightTemp = rightBoxTopHeight;
      //地图的右边自适应高度
      vm.rightBoxTopHeight = {
        "min-height": vm.rightBoxTopHeightTemp + "px"
      }
      vm.rightBoxBottomHeight = rightBoxTopHeight;
    }
    //初始化高度
    vm.adjustWindow($window.innerHeight);
    /**
     * 初始化地图数据
     */
    vm.loadHomeDeviceData = function () {
      var rspdata = serviceResource.restCallService(RENTAL_HOME_MAP_GPSDATA_URL, "GET");
      rspdata.then(function (data) {
        vm.drawPointAggregation("homeMap", data.content, 4);
      }, function (reason) {
        Notification.error(languages.findKey('failedToGetDeviceInformation'));
      })
    }
    /**
     * 点聚合绘制
     * @param mapId 页面上地图的id
     * @param pointArray 点集合
     * @param zone 缩放级别
     */
    vm.drawPointAggregation = function (mapId, pointArray, zone) {
      //点聚合方式和自定义回调函数弹出框
      serviceResource.refreshMapWithDeviceInfo(mapId, pointArray, zone, [104.06, 30.83], true, function (item) {
        var restCallUrl = RENTAL_MACHINE_MONITOR_URL + "?deviceNum=" + item.deviceNum;
        var deviceDataPromis = serviceResource.restCallService(restCallUrl, "GET");
        deviceDataPromis.then(function (data) {
          //打开模态框
          $rootScope.currentOpenModal = $uibModal.open({
            animation: true,
            backdrop: false,
            templateUrl: 'app/components/rentalPlatform/machineMng/machineMonitor.html',
            controller: 'machineMonitorController',
            controllerAs:'vm',
            openedClass: 'hide-y',//class名 加载到整个页面的body 上面可以取消右边的滚动条
            windowClass: 'top-spacing',//class名 加载到ui-model 的顶级div上面
            size: 'super-lgs',
            resolve: { //用来向controller传数据
              deviceInfo: function () {
                return data.content;
              }
            }
          });
        },function (reason) {
          Notification.error(languages.findKey('failedToGetDeviceInformation'));
        })
      });
    };
    //加载地图设备数据
    vm.loadHomeDeviceData();
    /**
     * 监听窗口大小改变后重新自适应高度
     */
    $scope.$watch('height', function (oldHeight, newHeight) {
      vm.adjustWindow(newHeight);
      barChart.resize({height: vm.rightBoxBottomHeight});
    })
    /**
     * 根据类型获取报警信息的数量
     * @param type
     */
    vm.getAlarmCountByType = function (alarmType) {
      if (alarmType == 4) {//车辆报警单独处理

        return;
      }

      var url = RENTAL_ALARM_MSG_URL + "?alarmType=" + alarmType;
      var respData = serviceResource.restCallService(url, "GET");
      respData.then(function (data) {
        var msgNum = data.content;
        if (alarmType == 1) {
          vm.fenceAlarm = msgNum;
        }
        if (alarmType == 2) {
          vm.keepAlarm = msgNum;//保养报警
        }
        if (alarmType == 3) {
          vm.offLineAlarm = msgNum;//离线报警
        }
      }, function (reason) {
        Notification.error("获取信息失败");
      })
    }
    vm.getAlarmCountByType(1);//围栏报警
    vm.getAlarmCountByType(2);//保养提醒
    vm.getAlarmCountByType(3);//离线提醒
    vm.getAlarmCountByType(4);//车辆报警
    /**
     * 根据车辆类型获取车辆数量
     * @param machineType
     */
    vm.getMachineCountByType = function (machineType) {
      var url = RENTAL_MACHINE_COUNT_URL;
      if (machineType) {
        url = url + "?type=" + machineType;
      }
      var respData = serviceResource.restCallService(url, "GET");
      respData.then(function (data) {
        var msgNum = data.content;
        if (machineType==undefined || machineType==null){
          vm.machineCount=msgNum;
        }
        if (machineType == 1) {
          vm.shearFork = msgNum;//剪叉
        }
        if (machineType == 2) {
          vm.straightArm = msgNum;//直臂
        }
        if (machineType == 3) {
          vm.crankArm = msgNum;//曲臂
        }
      }, function (reason) {
        Notification.error("获取信息失败");
      })

    }
    vm.getMachineCountByType(1);//剪叉车
    vm.getMachineCountByType(2);//直臂
    vm.getMachineCountByType(3);//曲臂
    vm.getMachineCountByType();//总数
    /**
     * 名称转到某个视图
     * @param view 视图名称
     */
    vm.gotoView = function (view) {
      $rootScope.$state.go(view);
    }

    /**
     * 根据机型转到当前位置页面
     * @param machineType
     */
    vm.queryByMachineType=function (machineType) {
      if (machineType){
        $rootScope.machinType=machineType;
      }
      $rootScope.$state.go("rental.machineCurrentStatus");
    }

    /**
     * 根据报警信息类型转到报警页面
     *
     * @param alarmType
     */
    vm.queryAlarmMsg=function (alarmType) {
      if (alarmType){
        $rootScope.alarmType=alarmType;
      }
      $rootScope.$state.go("rental.machineAlarmInfo");
    }



    //main height
    var machineContent = document.getElementsByClassName('machine-content');
    machineContent[0].style.height = $window.innerHeight + 'px';
    machineContent[0].style.background = '#fff';

    var middlePicBox = document.getElementsByClassName('middlePicBox')[0];
    middlePicBox.style.height = vm.rightBoxTopHeightTemp - 10 + 'px';

    var machineNumlis = document.getElementsByClassName('machineNumlis');
    var lineHeight = vm.rightBoxTopHeightTemp - 30;
    machineNumlis[0].style.height = (lineHeight / 4) + 'px';
    machineNumlis[1].style.height = (lineHeight / 4) + 'px';
    machineNumlis[2].style.height = (lineHeight / 4) + 'px';
    machineNumlis[3].style.height = (lineHeight / 4) + 'px';
    machineNumlis[0].style.lineHeight = (lineHeight / 4) + 'px';
    machineNumlis[1].style.lineHeight = (lineHeight / 4) + 'px';
    machineNumlis[2].style.lineHeight = (lineHeight / 4) + 'px';
    machineNumlis[3].style.lineHeight = (lineHeight / 4) + 'px';


    /**
     * 出租率
     */
    var barChart = echarts.init(document.getElementById('machineBarChart'), '', {
      width: 'auto',
      height: vm.rightBoxBottomHeight - 35 + 'px'
    });

    function creatRentChart(){
      var rspData = serviceResource.restCallService(MACHINE_RENT_URL,"GET");
      rspData.then(function (data) {

        function getLocalTime(nS) {
          return new Date(parseInt(nS)).toLocaleString().substr(0,9)
        }

        for(var i=0,len = data.content.startDate.length;i<len;i++){
          data.content.startDate[i] = getLocalTime(data.content.startDate[i])
        }

        var rentOption =  {
          backgroundColor: '#fff',
          tooltip: {
            trigger: 'axis',
            formatter:function(params){
              var temp  = '<div>' + params[0].name + '</div>' + '<div style="margin-top:5px;margin-right: 3px;width: 12px;height: 12px;background-color: rgb(38, 173, 88);border-radius: 4px;display: inline-block;float: left;"></div>' + '<div style="margin-right: 16px">' + params[0].seriesName+ '：' + params[0].data + ' 辆' + '</div>' + '<div style="margin-top:5px;margin-right: 3px;width: 12px;height: 12px;background-color: rgb(35,142,250);border-radius: 4px;display: inline-block;float: left;"></div>' + '<div style="margin-right: 16px">' + params[1].seriesName + '：' + params[1].data + ' 辆' + '</div>' + '<div>' + '出租率：' + data.content.rate[params[1].dataIndex] + '%' + '</div>';
              return temp;
            }
          },
          legend: {
            // top: 20,
            // data: [{
            //   name: '已租',
            //   icon: false,
            //   textStyle: {
            //     color: 'rgb(35, 142, 250)'
            //   }
            // },{
            //   name: '待租',
            //   icon: false,
            //   textStyle: {
            //     color: 'rgb(38, 173, 88)'
            //   }
            // }]
          },
          grid: {
            top:'20%',
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: '#999'
              }
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              textStyle: {
                color: '#000'
              }
            },
            data: data.content.startDate
          },
          yAxis: {
            name:'出租统计',
            nameTextStyle: {
              fontSize: 14,
              fontFamily:''
            },
            nameGap:20,
            type: 'value',
            axisLine: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              inside: false
            }
          },
          series: [{
            name: '待租',
            type: 'line',
            stack: '总量',
            itemStyle: {
              normal: {
                opacity: 0
              },
              emphasis: {
                color: 'rgb(204,204,204)',
                borderColor: '#fff',
                opacity: 1
              }
            },
            lineStyle: {
              normal: {
                width:1,
                color: 'rgb(204,204,204)'
              }
            },
            areaStyle: {
              normal: {
                color: 'rgb(204,204,204)'
              }
            },
            data: data.content.unRentalList,
            smooth: true,
            smoothMonotone: 'x'
          }, {
            name: '已租',
            type: 'line',
            stack: '总量',
            itemStyle: {
              normal: {
                opacity: 0
              },
              emphasis: {
                color: 'rgb(0,160,152)',
                borderColor: '#fff',
                opacity: 1
              }
            },
            lineStyle: {
              normal: {
                width:1,
                color: 'rgb(0,160,152)'
              }
            },
            areaStyle: {
              normal: {
                color: 'rgb(0,160,152)'
              }
            },
            data: data.content.rentalingList,
            smooth: true,
            smoothMonotone: 'x'
          }]
        };
        barChart.setOption(rentOption);
      }, function (reason) {
        Notification.error("获取信息失败");
      });

    }
    creatRentChart();


    /**
     * pieChart
     */

    var homePie = echarts.init(document.getElementById('homePie'), '', {
      width: 'auto',
      height: vm.rightBoxTopHeightTemp + 'px'
    });

    function crateHomePieOption() {
      var rspData = serviceResource.restCallService(RENTAL_MACHINE_RATE_URL,"GET");
      rspData.then(function (data) {
        var homePieOption = {
          title: {
            text: data.content.machineRate+'%',
            x: 'center',
            y: 'center',
            textStyle: {
              fontWeight: 'normal',
              color: "rgb(38, 173, 88)",
              fontSize: 40
            }
          },
          backgroundColor: '#fff',
          series: [{
            name: 'Line 1',
            type: 'pie',
            clockWise: false,
            radius: ['60%', '65%'],
            itemStyle: {
              normal: {
                color: 'rgba(38, 173, 88,1)',
                label: {
                  show: false
                },
                labelLine: {
                  show: false
                }
                // shadowBlur: 20,
                // shadowColor: 'rgba(40, 40, 40, 0.2)'
              },
              emphasis: {
                color: 'rgba(38, 173, 88,1)',
                label: {
                  show: false
                },
                labelLine: {
                  show: false
                },
                shadowBlur: 10,
                shadowColor: 'rgba(40, 40, 40, 0.2)'
              }
            },
            hoverAnimation: false,
            data: [{
              value: data.content.rentalMachineCount,
              name: '01'
            }, {
              value: data.content.unRentalMachineCount,
              name: 'invisible',
              itemStyle: {
                normal: {
                  color: 'rgba(0, 0, 0,0.2)',
                  label: {
                    show: false
                  },
                  labelLine: {
                    show: false
                  }
                  // shadowBlur: 20,
                  // shadowColor: 'rgba(40, 40, 40, 0.2)'
                },
                emphasis: {
                  color: 'rgba(0, 0, 0, 0.2)',
                  label: {
                    show: false
                  },
                  labelLine: {
                    show: false
                  },
                  shadowBlur: 10,
                  shadowColor: 'rgba(40, 40, 40, 0.2)'
                }
              }
            }

            ]
          }]
        };
        homePie.setOption(homePieOption);
      }, function (reason) {
        Notification.error("获取信息失败");
      })

    }
    //加载出租率
    crateHomePieOption();


    /**
     *  miniPie
     */
    var miniPie = document.querySelectorAll('.miniPie');
    var miniPie1 = echarts.init(miniPie[0]);
    var miniPie2 = echarts.init(miniPie[1]);
    var miniPie3 = echarts.init(miniPie[2]);

    function creatMiniPie(chart,type){
      var restCallURL = RENTAL_MACHINE_RATE_URL;
      restCallURL += '?type=' + type;
      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function(data){
        var miniPieOption = {
          title: {
            text: data.content.machineRate + '%',
            x: 'center',
            y: 'center',
            textStyle: {
              fontWeight: 'normal',
              color: "rgb(38, 173, 88)",
              fontSize: 12
            }
          },
          backgroundColor: '#fff',
          series: [{
            name: 'Line 1',
            type: 'pie',
            clockWise: false,
            radius: ['50%', '60%'],
            hoverAnimation: false,
            data: [{
              value: data.content.rentalMachineCount,
              itemStyle: {
                normal: {
                  color: 'rgba(38, 173, 88,1)',
                  label: {
                    show: false
                  },
                  labelLine: {
                    show: false
                  }
                  // shadowBlur: 20,
                  // shadowColor: 'rgba(40, 40, 40, 0.2)'
                },
                emphasis: {
                  color: 'rgba(38, 173, 88,1)',
                  label: {
                    show: false
                  },
                  labelLine: {
                    show: false
                  },
                  shadowBlur: 10,
                  shadowColor: 'rgba(40, 40, 40, 0.2)'
                }
              }
            }, {
              value: data.content.unRentalMachineCount,
              itemStyle: {
                normal: {
                  color: 'rgba(0, 0, 0,0.2)',
                  label: {
                    show: false
                  },
                  labelLine: {
                    show: false
                  }
                  // shadowBlur: 20,
                  // shadowColor: 'rgba(40, 40, 40, 0.2)'
                },
                emphasis: {
                  color: 'rgba(0, 0, 0, 0.2)',
                  label: {
                    show: false
                  },
                  labelLine: {
                    show: false
                  },
                  shadowBlur: 10,
                  shadowColor: 'rgba(40, 40, 40, 0.2)'
                }
              }
            }]
          }]
        };
        chart.setOption(miniPieOption);
      }, function (reason) {
        Notification.error("获取信息失败");
      })

    }

    creatMiniPie(miniPie1,1);
    creatMiniPie(miniPie2,3);
    creatMiniPie(miniPie3,3);

    /**
     * miniChart
     */

    var miniChart = document.getElementsByClassName('miniChart'),
      miniChart1 = echarts.init(miniChart[0]),
      miniChart2 = echarts.init(miniChart[1]),
      miniChart3 = echarts.init(miniChart[2]),
      miniChart4 = echarts.init(miniChart[3]);

    function creatMiniChart(chart,alarmType){

      var restCallURL = ALERT_TREND_URL;
      restCallURL += '?alarmType=' + alarmType;
      var rspData = serviceResource.restCallService(restCallURL, "GET");
      rspData.then(function(data){
        function getLocalTime(nS) {
          return new Date(parseInt(nS)).toLocaleString().substr(0,10)
        }

        for(var i=0;i<7;i++){
          data.content.alarmDates[i] = getLocalTime(data.content.alarmDates[i])
        }

        var option = {
          tooltip: {
            // showContent: false,
            trigger: 'axis',
            axisPointer: {
              type: 'line',
              lineStyle:{
                color:'rgba(124, 181, 236, 0.5)'
              }
            }
          },
          grid: {
            top:'35%',
            left: '',
            right: '6%',
            bottom: '-10%',
            containLabel: true
          },
          xAxis: {
            boundaryGap: false,
            axisLine: {
              lineStyle: {
                color: 'rgba(124, 181, 236, 0.5)'
              }
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show:false
            },
            data: data.content.alarmDates
          },
          yAxis: {
            type: 'value',
            axisLine: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: false
            }
          },
          series: {
            name: '提醒数量',
            type: 'line',
            label: {
              emphasis: {
                show: true,
                textStyle:{
                  color: 'rgba(124, 181, 236, 1)'
                },
                formatter: function(param) {
                  return param.data[3];
                },
                position: 'top'
              }
            },
            itemStyle: {
              normal: {
                opacity: 0
              },
              emphasis: {
                color: 'rgba(124, 181, 236, 1)',
                borderColor: '#fff',
                borderWidth: 2,
                opacity: 1
              }
            },
            lineStyle: {
              normal: {
                width:1,
                color: 'rgba(124, 181, 236, 1)'
              }
            },
            areaStyle: {
              normal: {
                color: 'rgba(124, 181, 236, 0.25)'
              }
            },
            data: data.content.countList,
            smooth: true,
            smoothMonotone: 'x'
          }
        };
        chart.setOption(option);
      },function(){});

    }

    creatMiniChart(miniChart1,1);
    creatMiniChart(miniChart2,4);
    creatMiniChart(miniChart3,2);
    creatMiniChart(miniChart4,3);


  }
})();
