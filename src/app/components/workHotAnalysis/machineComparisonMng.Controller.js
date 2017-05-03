/**
 * Created by mengwei on 17-4-24.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineComparedMngController', machineComparedMngController);

  /** @ngInject */
  function machineComparedMngController($rootScope, $scope, $http, $filter,Notification) {
    var vm = this;
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);
    vm.startDate = startDate;
    vm.endDate = new Date();

    vm.startDateDeviceData = startDate;
    vm.endDateDeviceData = new Date();

    //date picker
    vm.startDateOpenStatusDeviceData = {
      opened: false
    };
    vm.endDateOpenStatusDeviceData = {
      opened: false
    };

    vm.startDateOpenDeviceData = function ($event) {
      vm.startDateOpenStatusDeviceData.opened = true;
    };
    vm.endDateOpenDeviceData = function ($event) {
      vm.endDateOpenStatusDeviceData.opened = true;
    };

    vm.maxDate = new Date();
    vm.dateOptions = {
      formatYear: 'yyyy',
      startingDay: 1
    };


    vm.echartsInit = function (id) {
      var item = echarts.init(document.getElementById(id));
      return item;
    }

    var mapChart1 = vm.echartsInit('mapContainer1');
    var subMap1 = vm.echartsInit('subMap1');
    var subMap2 = vm.echartsInit('subMap2');
    var subMap3 = vm.echartsInit('subMap3');



    var chinaOption1 = {
      title: {
        text: '车辆开工热度分布',
        subtext: '全国',
        left: 'center'
      },
      tooltip: [
        {
          trigger: 'item',
          backgroundColor: 'rgba(219,219,216,0.8)',
          textStyle: {
            color: '#333333'
          },
          formatter: function(params) {
            if(params.componentSubType == 'map') {
              var unit =  '小时' ;
              var name = '平均开工时长';

              if(params.value) {
                return params.data.name + '<br />'
                  + name + '：' +  params.data.value + unit +  '<br />'
                  + '车辆数量：' + params.data.count + ' 台';
              }
              return params.name + '<br />'
                + name + '：' + 0 + unit +  '<br />'
                + '车辆数量：' + 0 + ' 台';
            }
            return '';
          }
        }
      ],
      toolbox: {
        show: true,
        orient: 'vertical',
        top: 'bottom',
        right: 20,
        itemGap: 30,
        feature: {
          restore: {show: true},
          saveAsImage: {show: true}
        },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      visualMap: {
        type: 'continuous',
        min: 0,
        left: 20,
        bottom: 15,
        calculable: true,
        precision: 2,
        seriesIndex: [0],
        color: ['#075e89','#FFFFFF'],
        text: ['高', '低']
      },
      geo: {
        map: 'china',
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: true
          }
        },
        roam: true,
        scaleLimit: {
          min: 0.5
        }
      },
      series: [
        {
          name: '开工热度',
          type: 'map',
          map: 'china',
          roam: true,
          scaleLimit: {
            min: 0.5
          },
          showLegendSymbol: false,
          label: {
            emphasis: {
              show: true
            }
          },
          data: [{name: "山东", count: 829, value: 94.85},

            {name: "河北", count: 574, value: 161.98},

            {name: "山东", count: 829, value: 94.85},

            {name: "河北", count: 574, value: 161.98},

            {name: "云南", count: 481, value: 70.3},

            {name: "山西", count: 425, value: 101.45},

            {name: "河南", count: 307, value: 78.87},

            {name: "安徽", count: 249, value: 71.22},

            {name: "西藏", count: 226, value: 28.78},

            {name: "贵州", count: 186, value: 62.52},

            {name: "广东", count: 182, value: 68.87},

            {name: "内蒙古", count: 160, value: 111.8},

            {name: "江西", count: 154, value: 66.27},

            {name: "湖北", count: 145, value: 60.42},

            {name: "辽宁", count: 143, value: 116.67},

            {name: "江苏", count: 142, value: 80.73},

            {name: "", count: 132, value: 91.13},

            {name: "湖南", count: 126, value: 52.87},

            {name: "四川", count: 115, value: 76.77},

            {name: "陕西", count: 112, value: 85.65},

            {name: "甘肃", count: 111, value: 38.3},

            {name: "广西", count: 106, value: 91.05},

            {name: "福建省", count: 86, value: 72.67},

            {name: "浙江", count: 73, value: 60.97},

            {name: "吉林", count: 57, value: 54.43},

            {name: "黑龙江", count: 51, value: 138.38},

            {name: "海南", count: 50, value: 78.6},

            {name: "北京", count: 37, value: 94.1},

            {name: "宁夏", count: 35, value: 120},

            {name: "重庆", count: 28, value: 56.18},

            {name: "青海", count: 27, value: 77.55},

            {name: "天津", count: 8, value: 94.27},

            {name: "新疆", count: 4, value: 34.93},

            {name: "上海", count: 1, value: 46.1}]

        }
      ]
    };
    var chinaOption2 = {
      title: {
        text: '车辆销售热度分布',
        subtext: '全国',
        left: 'center'
      },
      tooltip: [
        {
          trigger: 'item',
          backgroundColor: 'rgba(219,219,216,0.8)',
          textStyle: {
            color: '#333333'
          },
          formatter: function(params) {
            if(params.componentSubType == 'map') {
              var unit =  '小时' ;
              var name = '平均开工时长';

              if(params.value) {
                return params.data.name + '<br />'
                  + name + '：' +  params.data.value + unit +  '<br />'
                  + '车辆数量：' + params.data.count + ' 台';
              }
              return params.name + '<br />'
                + name + '：' + 0 + unit +  '<br />'
                + '车辆数量：' + 0 + ' 台';
            }
            return '';
          }
        }
      ],
      toolbox: {
        show: true,
        orient: 'vertical',
        top: 'bottom',
        right: 20,
        itemGap: 30,
        feature: {
          restore: {show: true},
          saveAsImage: {show: true}
        },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      visualMap: {
        type: 'continuous',
        min: 0,
        left: 20,
        bottom: 5,
        calculable: true,
        precision: 2,
        seriesIndex: [0],
        color: ['#075e89','#FFFFFF'],
        text: ['高', '低']
      },
      geo: {
        map: 'china',
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: true
          }
        },
        roam: true,
        scaleLimit: {
          min: 0.5
        }
      },
      series: [
        {
          name: '开工热度',
          type: 'map',
          map: 'china',
          roam: true,
          scaleLimit: {
            min: 0.5
          },
          showLegendSymbol: false,
          label: {
            emphasis: {
              show: true
            }
          },
          data: [{name: "山东", count: 829, value: 94.85},

            {name: "河北", count: 574, value: 161.98},

            {name: "山东", count: 829, value: 94.85},

            {name: "河北", count: 574, value: 161.98},

            {name: "云南", count: 481, value: 70.3},

            {name: "山西", count: 425, value: 101.45},

            {name: "河南", count: 307, value: 78.87},

            {name: "安徽", count: 249, value: 71.22},

            {name: "西藏", count: 226, value: 28.78},

            {name: "贵州", count: 186, value: 62.52},

            {name: "广东", count: 182, value: 68.87},

            {name: "内蒙古", count: 160, value: 111.8},

            {name: "江西", count: 154, value: 66.27},

            {name: "湖北", count: 145, value: 60.42},

            {name: "辽宁", count: 143, value: 116.67},

            {name: "江苏", count: 142, value: 80.73},

            {name: "", count: 132, value: 91.13},

            {name: "湖南", count: 126, value: 52.87},

            {name: "四川", count: 115, value: 76.77},

            {name: "陕西", count: 112, value: 85.65},

            {name: "甘肃", count: 111, value: 38.3},

            {name: "广西", count: 106, value: 91.05},

            {name: "福建省", count: 86, value: 72.67},

            {name: "浙江", count: 73, value: 60.97},

            {name: "吉林", count: 57, value: 54.43},

            {name: "黑龙江", count: 51, value: 138.38},

            {name: "海南", count: 50, value: 78.6},

            {name: "北京", count: 37, value: 94.1},

            {name: "宁夏", count: 35, value: 120},

            {name: "重庆", count: 28, value: 56.18},

            {name: "青海", count: 27, value: 77.55},

            {name: "天津", count: 8, value: 94.27},

            {name: "新疆", count: 4, value: 34.93},

            {name: "上海", count: 1, value: 46.1}]

        }
      ]
    };

    mapChart1.setOption(chinaOption1);

    //右侧热度分布初始化
    vm.subMapInit = function () {

      var subMapOption1 = chinaOption1;
      subMapOption1.title.text = "矿车开工热度分布";
      subMap1.setOption(subMapOption1);

      var subMapOption2 = chinaOption1;
      subMapOption1.title.text = "装载机开工热度分布";
      subMap2.setOption(subMapOption2);

      var subMapOption3 = chinaOption1;
      subMapOption1.title.text = "挖掘机开工热度分布";
      subMap3.setOption(subMapOption2);
    }
    vm.subMapInit();

    vm.query = function (machineType1,heatType1) {
      vm.mapchartLeftInit(machineType1,heatType1);
    }

    vm.mapchartLeftInit = function (machineType1,heatType1){
      var mapOption1 = chinaOption1;
      if(machineType1=="A1"){
        if(heatType1==1){
          mapOption1.title.text = "小挖开工热度分布";
        }else if(heatType1==0){
          mapOption1.title.text = "小挖销售热度分布";
        }
      }
      if(machineType1=="30"){
        if(heatType1==1){
          mapOption1.title.text = "矿机开工热度分布";
        }else if(heatType1==0){
          mapOption1.title.text = "矿机销售热度分布";
        }
      }
      if(machineType1=="40"){
        if(heatType1==1){
          mapOption1.title.text = "中挖开工热度分布";
        }else if(heatType1==0){
          mapOption1.title.text = "中挖销售热度分布";
        }
      }
      mapChart1.setOption(mapOption1);
    }

    //车辆各年份月度工作情况
    var mmuChart1 = echarts.init(document.getElementById('mmu-container1'));
    var mmuOption1 = {
      title: {
        text: '月度工作车辆变化',
        padding: [10, 20]
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        top: 'center',
        right: 20,
        itemGap: 30,
        feature: {
          restore: {show: true},
          saveAsImage: {show: true}
        },
        iconStyle: {
          emphasis: {
            color: '#2F4056'
          }
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer : {
          type : 'shadow'
        },
        backgroundColor: 'rgba(219,219,216,0.8)',
        textStyle: {
          color: '#333333'
        }
      },
      legend: {
        data:['2016','2017']
      },
      grid: {
        left: '3%',
        right: 80,
        bottom: '3%',
        borderColor: '#e6e6e6',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#666666'
          }
        },
        nameTextStyle: {
          color: '#666666'
        },
        data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
      },
      yAxis: {
        name: '车辆数量(台)',
        type: 'value',
        minInterval: 1,
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        axisLabel: {
          show: true,
          textStyle: {
            color: '#666666'
          }
        },
        nameTextStyle: {
          color: '#666666'
        }
      },
      series: [
        {
          name:'2016',
          type: 'line',
          data:[0,0,0,0,1546,1886,2141,2545,3138,3612,4024,4221]
        },{
          name:'2017',
          type: 'line',
          data:[4380,5362]
        }
      ]
    };
    mmuChart1.setOption(mmuOption1);

    //查看对比结果
    vm.viewResults = function (machineType1,machineType2,heatType1,heatType2) {
      if(null==machineType1||null==machineType2||null==heatType1||null==heatType2){
        Notification.warning({message: '请选择相关参数'});
      }else{
        //热度对比显示格局样式
        var mapContainerList = document.getElementsByClassName("mapContainer");
        mapContainerList[0].style.width = "100%";
        mapContainerList[1].style.width = "100%";

        var mapContainerBoxList = document.getElementsByClassName("mapContainerBox");
        mapContainerBoxList[0].style.width = "50%";
        mapContainerBoxList[1].style.width = "50%";

        var mapContainerQushi2 = document.getElementById("mapContainerQushi2");
        mapContainerQushi2.style.display = "block";

        var lineContainerList = document.getElementsByClassName("chart-container");
        lineContainerList[0].style.width = "50%";
        lineContainerList[1].style.width = "50%";

        var backButtons = document.getElementsByClassName("backChina");


        var mapChart1 = vm.echartsInit("mapContainer1");
        var mapChart2 = vm.echartsInit("mapContainer2");


        var mapOption1 = chinaOption1;
        var mapOption2 = chinaOption2;

        if(machineType1=="A1"){
          if(heatType1==1){
            mapOption1.title.text = "小挖开工热度分布";
          }else if(heatType1==0){
            mapOption1.title.text = "小挖销售热度分布";
          }
        }
        if(machineType1=="30"){
          if(heatType1==1){
            mapOption1.title.text = "矿机开工热度分布";
          }else if(heatType1==0){
            mapOption1.title.text = "矿机销售热度分布";
          }
        }
        if(machineType1=="40"){
          if(heatType1==1){
            mapOption1.title.text = "中挖开工热度分布";
          }else if(heatType1==0){
            mapOption1.title.text = "中挖销售热度分布";
          }
        }


        if(machineType2=="A1"){
          if(heatType2==1){
            mapOption2.title.text = "小挖开工热度分布";
          }else if(heatType2==0){
            mapOption2.title.text = "小挖销售热度分布";
          }
        }
        if(machineType2=="30"){
          if(heatType2==1){
            mapOption2.title.text = "矿机开工热度分布";
          }else if(heatType2==0){
            mapOption2.title.text = "矿机销售热度分布";
          }
        }
        if(machineType2=="40"){
          if(heatType1==2){
            mapOption2.title.text = "中挖开工热度分布";
          }else if(heatType2==0){
            mapOption2.title.text = "中挖销售热度分布";
          }
        }

        mapChart1.setOption(mapOption1);
        mapChart2.setOption(mapOption2);

        mapChart1.on("click", function (param){
          backButtons[0].style.display = "block";
          var n = getindex(param.name,provincesText);
          var Cname = provinces[n];
          showProvince(Cname,'mapContainer1');

        })

        mapChart2.on("click", function (param){
          backButtons[1].style.display = "block";
          var n = getindex(param.name,provincesText);
          var Cname = provinces[n];
          showProvince(Cname,'mapContainer2');
        })

        var mmuChart1 = echarts.init(lineContainerList[0]);
        var mmuOption1 = {
          title: {
            text: '月度工作车辆变化',
            padding: [10, 20]
          },
          toolbox: {
            show: true,
            orient: 'vertical',
            top: 'center',
            right: 20,
            itemGap: 30,
            feature: {
              restore: {show: true},
              saveAsImage: {show: true}
            },
            iconStyle: {
              emphasis: {
                color: '#2F4056'
              }
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer : {
              type : 'shadow'
            },
            backgroundColor: 'rgba(219,219,216,0.8)',
            textStyle: {
              color: '#333333'
            }
          },
          legend: {
            data:['2016','2017']
          },
          grid: {
            left: '3%',
            right: 80,
            bottom: '3%',
            borderColor: '#e6e6e6',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: true,
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#666666'
              }
            },
            nameTextStyle: {
              color: '#666666'
            },
            data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
          },
          yAxis: {
            name: '车辆数量(台)',
            type: 'value',
            minInterval: 1,
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#666666'
              }
            },
            nameTextStyle: {
              color: '#666666'
            }
          },
          series: [
            {
              name:'2016',
              type: 'line',
              data:[0,0,0,0,1546,1886,2141,2545,3138,3612,4024,4221]
            },{
              name:'2017',
              type: 'line',
              data:[4380,5362]
            }
          ]
        };
        mmuChart1.setOption(mmuOption1);
        var mmuChart2 = echarts.init(lineContainerList[1]);
        var mmuOption2 = {
          title: {
            text: '月度车辆销售分布',
            padding: [10, 20]
          },
          toolbox: {
            show: true,
            orient: 'vertical',
            top: 'center',
            right: 20,
            itemGap: 30,
            feature: {
              restore: {show: true},
              saveAsImage: {show: true}
            },
            iconStyle: {
              emphasis: {
                color: '#2F4056'
              }
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer : {
              type : 'shadow'
            },
            backgroundColor: 'rgba(219,219,216,0.8)',
            textStyle: {
              color: '#333333'
            }
          },
          legend: {
            data:['2016','2017']
          },
          grid: {
            left: '3%',
            right: 80,
            bottom: '3%',
            borderColor: '#e6e6e6',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: true,
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#666666'
              }
            },
            nameTextStyle: {
              color: '#666666'
            },
            data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
          },
          yAxis: {
            name: '车辆数量(台)',
            type: 'value',
            minInterval: 1,
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              show: true,
              textStyle: {
                color: '#666666'
              }
            },
            nameTextStyle: {
              color: '#666666'
            }
          },
          series: [
            {
              name:'2016',
              type: 'line',
              data:[0,0,0,0,15,186,41,45,38,32,24,21]
            },{
              name:'2017',
              type: 'line',
              data:[5,6,41,5,23,12,22,36]
            }
          ]
        };
        mmuChart2.setOption(mmuOption2);

        vm.backChina1 = function () {
          var mapChart1 = vm.echartsInit("mapContainer1");
          mapChart1.setOption(mapOption1);
          backButtons[0].style.display = "none";
        }

        vm.backChina2 = function () {
          var mapChart2 = vm.echartsInit("mapContainer2");
          mapChart2.setOption(mapOption2);
          backButtons[0].style.display = "none";
        }

      }

    }


    function getindex(name,arr){
      for (var i = 0; i < arr.length; i++) {
        if(name==arr[i]){
          return i;
        }
      }
    }


    function showProvince(Cname,id) {

      $http.get('assets/json/province/'+Cname+'.json').success(function (geoJson){

        var mapChart = vm.echartsInit(id);

        echarts.registerMap(Cname, geoJson);
        var option;
        var n = getindex(Cname,provinces);
        var name = provincesText[n];
        console.log(name)
        mapChart.setOption(
          option = {
            title: {
              text: name,
              left: 'center',
              textStyle:{
                color:'#000'
              }
            },
            visualMap: {
              type: 'continuous',
              min: 0,
              max: 200,
              left: 20,
              bottom: 15,
              calculable: true,
              precision: 2,
              seriesIndex: [0],
              color: ['#980000', '#f6f3d2', '#075e89'],
              text: ['高', '低']
            },
            toolbox: {
              show: true,
              itemSize: 20,
              itemGap: 30,
              left: 'right',
              feature: {
                restore: {},
                saveAsImage: {}
              }
            },
            series: [
              {
                type: 'map',
                mapType: Cname,
                roam: true,
                label: {
                  emphasis: {
                    show: true
                  }
                },
                itemStyle: {
                  normal: {
                  },
                  emphasis: {
                    areaColor: '#389BB7',
                    borderWidth: 0
                  }
                },
                animation: false
              }
            ]
          });
      });
    }


    var provinces = ['shanghai', 'hebei','shanxi','neimenggu','liaoning','jilin','heilongjiang','jiangsu','zhejiang','anhui','fujian','jiangxi','shandong','henan','hubei','hunan','guangdong','guangxi','hainan','sichuan','guizhou','yunnan','xizang','shanxi1','gansu','qinghai','ningxia','xinjiang', 'beijing', 'tianjin', 'chongqing', 'xianggang', 'aomen'];
    var provincesText = ['上海', '河北', '山西', '内蒙古', '辽宁', '吉林','黑龙江',  '江苏', '浙江', '安徽', '福建', '江西', '山东','河南', '湖北', '湖南', '广东', '广西', '海南', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '北京', '天津', '重庆', '香港', '澳门'];



    //查看各类车车辆热度分布
    vm.showMachineHeatDetails = function (heatType) {
      if(heatType==1){
        vm.subMapInit();
      }else if(heatType==0){
        var subMapOption1 = chinaOption2;
        subMapOption1.title.text = "矿车销售热度分布";
        subMap1.setOption(subMapOption1);

        var subMapOption2 = chinaOption2;
        subMapOption1.title.text = "装载机销售热度分布";
        subMap2.setOption(subMapOption2);

        var subMapOption3 = chinaOption2;
        subMapOption1.title.text = "挖掘机销售热度分布";
        subMap3.setOption(subMapOption3);
      }

    }


    vm.reset = function () {
      vm.machineType1 = null;
      vm.machineType2 = null;
      vm.heatType1 = null;
      vm.heatType2 = null;
    }




  }
})();
