/**
 * Created by songyutao on 17-6-5.
 */
(function(){
  'use strict';

  angular
    .module('GPSCloud')
    .controller('modelsCompareController',modelsCompareController);

  function modelsCompareController($scope,$http,Notification,GET_MACHINE_TYPE_URL){

    var vm = this;

    vm.quarterQuery=true;
    vm.monthQuery = false;
    vm.dayQuery = false;
    vm.hidden = true;
    vm.comparedQuery = true;
    vm.singleQuery = false;
    vm.comparedType = false;
    vm.heatType1 = "1";
    vm.dateType1 = "1";
    vm.dateType2 = "201702";
    vm.hours=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
    vm.hour="2";
    //获取车型种类
    $http.get(GET_MACHINE_TYPE_URL).then(function (type) {
      vm.machineType=type.data;
    });
    //装载机型号
    $http.get(GET_MACHINE_TYPE_URL+'?type=1').then(function (type1) {
      vm.models1=type1.data;
    });
    //挖掘机型号
    $http.get(GET_MACHINE_TYPE_URL+'?type=2').then(function (type2) {
      vm.models2=type2.data;
    });
    //重机型号
    $http.get(GET_MACHINE_TYPE_URL+'?type=3').then(function (type3) {
      vm.models3=type3.data;
    });
    vm.machineType1 = "1";
    vm.option1=true;
    vm.changes = function(machineType1){
      if(machineType1==1){
        vm.option1=true;
        vm.option2=false;
        vm.option3=false;
      } else if(machineType1==3){
        vm.option1=false;
        vm.option2=true;
        vm.option3=false;
      }else if(machineType1==2){
        vm.option1=false;
        vm.option2=false;
        vm.option3=true;
      }
    }

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 5);
    vm.startDate = startDate;
    //选择查询周期的触发时间
    vm.change=function(dateType1){
      if(dateType1==2){
        vm.quarterQuery=false;
        vm.monthQuery = true;
        vm.dayQuery = false;
        vm.hidden = true;
        vm.startDateDeviceData = null;
        vm.endDateDeviceData = null;
        vm.dateType2 = null;
        vm.monthDateDeviceData = new Date();
      }else if(dateType1==3){
        vm.quarterQuery=false;
        vm.monthQuery = false;
        vm.dayQuery = true;
        vm.hidden = false;
        vm.dateType2 = null;
        vm.startDateDeviceData = startDate;
        vm.endDateDeviceData = new Date();
        vm.monthDateDeviceData = null;
      }else if(dateType1==1){
        vm.quarterQuery=true;
        vm.monthQuery = false;
        vm.dayQuery = false;
        vm.hidden = true;
        vm.dateType2 = "201702";
        vm.startDateDeviceData = null;
        vm.endDateDeviceData = null;
        vm.monthDateDeviceData = null;
      }
    }

    vm.toggle = function () {
      vm.comparedQuery=!vm.comparedQuery;
      vm.singleQuery=!vm.singleQuery;
      vm.comparedType = !vm.comparedType;
        vm.reset();
    }

    //
    // vm.startDateDeviceData = startDate;
    // vm.endDateDeviceData = new Date();
    // vm.monthDateDeviceData = new Date();

    //date picker
    vm.monthDateOpenStatusDeviceData = {
      opened: false
    };
    vm.startDateOpenStatusDeviceData = {
      opened: false
    };
    vm.endDateOpenStatusDeviceData = {
      opened: false
    };
    vm.monthDateOpenDeviceData = function ($event) {
      vm.monthDateOpenStatusDeviceData.opened = true;
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
    vm.dateOptions1 = {
      formatYear: 'yyyy',
      startingDay: 1,
      minMode: 'month'
    };

    vm.echartsInit = function (id) {
      var item = echarts.init(document.getElementById(id));
      return item;
    }
    //开工热度地图
    var chinaOption1 = {
      title: {
        text: '车辆开工热度分布',
        textStyle:{
          fontSize: 26,
        },
        subtext: '全国',
        subtextStyle:{
          fontSize: 17,
        },
        top:'3%',
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
              var unit =  '%' ;
              var name = '开工率';

              if(params.value) {
                return params.data.name + '<br />'
                  + name + '：' +  params.data.value + unit +  '<br />'
                  + '车辆数量：' + params.data.count + ' 台/天';
              }
              return params.name + '<br />'
                + name + '：' + 0 + unit +  '<br />'
                + '车辆数量：' + 0 + ' 台/天';
            }
            return '';
          }
        }
      ],
      toolbox: {
        show: true,
        orient: 'vertical',
        // top: 'bottom',
        bottom:20,
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
        max:100,
        left: 10,

        calculable: true,
        precision: 2,
        seriesIndex: [0],
        // color: ['#075e89','#FFFFFF'],
        color: ['#075e89','#f6f3d2'],
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
        roam:true,
        scaleLimit: {
          min: 1
        }
      },
      series: [
        {
          name: '开工热度',
          type: 'map',
          map: 'china',
          roam:true,
          scaleLimit: {
            min: 1
          },
          showLegendSymbol: false,
          label: {
            // normal: {
            //   show: true
            // },
            emphasis: {
              show: true
            }
          },
          data:[
            {
              "name": "湖北省",
              "value": 70.662,
              "count": 144
            },
            {
              "name": "河北省",
              "value": 80.745,
              "count": 544
            },
            {
              "name": "海南省",
              "value": 82.887,
              "count": 58
            },
            {
              "name": "黑龙江省",
              "value": 75.943,
              "count": 69
            },
            {
              "name": "吉林省",
              "value": 62.647,
              "count": 61
            },
            {
              "name": "辽宁省",
              "value": 67.775,
              "count": 151
            },
            {
              "name": "广东省",
              "value": 76.916,
              "count": 187
            },
            {
              "name": "四川省",
              "value": 70.114,
              "count": 138
            },
            {
              "name": "安徽省",
              "value": 72.144,
              "count": 258
            },
            {
              "name": "甘肃省",
              "value": 55.917,
              "count": 124
            },
            {
              "name": "湖南省",
              "value": 61.84,
              "count": 107
            },
            {
              "name": "云南省",
              "value": 70.934,
              "count": 422
            },
            {
              "name": "河南省",
              "value": 76.429,
              "count": 349
            },
            {
              "name": "江苏省",
              "value": 77.98,
              "count": 150
            },
            {
              "name": "天津市",
              "value": 62.743,
              "count": 7
            },
            {
              "name": "澳門特別行政區",
              "value": 100,
              "count": 1
            },
            {
              "name": "山西省",
              "value": 69.343,
              "count": 412
            },
            {
              "name": "陕西省",
              "value": 70.046,
              "count": 133
            },
            {
              "name": "山东省",
              "value": 48.265,
              "count": 908
            },
            {
              "name": "上海市",
              "value": 90.217,
              "count": 2
            },
            {
              "name": "西藏自治区",
              "value": 67.736,
              "count": 261
            },
            {
              "name": "宁夏回族自治区",
              "value": 64.619,
              "count": 51
            },
            {
              "name": "北京市",
              "value": 67.644,
              "count": 29
            },
            {
              "name": "江西省",
              "value": 68.092,
              "count": 143
            },
            {
              "name": "浙江省",
              "value": 74.838,
              "count": 81
            },
            {
              "name": "青海省",
              "value": 51.224,
              "count": 34
            },
            {
              "name": "贵州省",
              "value": 68.675,
              "count": 204
            },
            {
              "name": "重庆市",
              "value": 70.31,
              "count": 30
            },
            {
              "name": "内蒙古自治区",
              "value": 63.199,
              "count": 184
            },
            {
              "name": "新疆维吾尔自治区",
              "value": 69.107,
              "count": 41
            },
            {
              "name": "福建省",
              "value": 69.255,
              "count": 88
            },
            {
              "name": "广西壮族自治区",
              "value": 71.892,
              "count": 93
            }
          ]
        }
      ]
    };
    //销售热度地图
    var chinaOption2 = {
      title: {
        text: '车辆销售热度分布',
        textStyle:{
          fontSize: 21,
        },
        subtext: '全国',
        subtextStyle:{
          fontSize: 12,
        },
        top:'3%',
        left: 'left'
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
              if(params.value) {
                return params.data.name + '<br />'
                  + '车辆数量：' + params.data.value + ' 台';
              }
              return params.name + '<br />'
                + '车辆数量：' + 0 + ' 台';
            }
            return '';
          }
        }
      ],
      toolbox: {
        show: true,
        orient: 'vertical',
        // top: 'bottom',
        bottom:20,
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
        max:100,
        left: 10,

        calculable: true,
        precision: 2,
        seriesIndex: [0],
        color: ['orangered','yellow','lightskyblue'],
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
        roam:true,
        scaleLimit: {
          min: 1
        }
      },
      series: [
        {
          name: '销售热度',
          type: 'map',
          map: 'china',
          roam:true,
          scaleLimit: {
            min: 1
          },
          showLegendSymbol: false,
          label: {
            emphasis: {
              show: true
            }
          },
          data:[
            {
              "name": "山西省",
              "value": 174,
              "count": null
            },
            {
              "name": "陕西省",
              "value": 90,
              "count": null
            },
            {
              "name": "山东省",
              "value": 406,
              "count": null
            },
            {
              "name": "湖北省",
              "value": 66,
              "count": null
            },
            {
              "name": "河北省",
              "value": 201,
              "count": null
            },
            {
              "name": "海南省",
              "value": 23,
              "count": null
            },
            {
              "name": "黑龙江省",
              "value": 37,
              "count": null
            },
            {
              "name": "吉林省",
              "value": 43,
              "count": null
            },
            {
              "name": "辽宁省",
              "value": 73,
              "count": null
            },
            {
              "name": "广东省",
              "value": 56,
              "count": null
            },
            {
              "name": "上海市",
              "value": 1,
              "count": null
            },
            {
              "name": "西藏自治区",
              "value": 200,
              "count": null
            },
            {
              "name": "宁夏回族自治区",
              "value": 27,
              "count": null
            },
            {
              "name": "北京市",
              "value": 15,
              "count": null
            },
            {
              "name": "四川省",
              "value": 61,
              "count": null
            },
            {
              "name": "安徽省",
              "value": 118,
              "count": null
            },
            {
              "name": "甘肃省",
              "value": 85,
              "count": null
            },
            {
              "name": "湖南省",
              "value": 65,
              "count": null
            },
            {
              "name": "云南省",
              "value": 135,
              "count": null
            },
            {
              "name": "河南省",
              "value": 215,
              "count": null
            },
            {
              "name": "江苏省",
              "value": 59,
              "count": null
            },
            {
              "name": "天津市",
              "value": 2,
              "count": null
            },
            {
              "name": "贵州省",
              "value": 93,
              "count": null
            },
            {
              "name": "重庆市",
              "value": 11,
              "count": null
            },
            {
              "name": "江西省",
              "value": 66,
              "count": null
            },
            {
              "name": "浙江省",
              "value": 31,
              "count": null
            },
            {
              "name": "青海省",
              "value": 23,
              "count": null
            },
            {
              "name": "内蒙古自治区",
              "value": 90,
              "count": null
            },
            {
              "name": "新疆维吾尔自治区",
              "value": 20,
              "count": null
            },
            {
              "name": "福建省",
              "value": 66,
              "count": null
            },
            {
              "name": "广西壮族自治区",
              "value": 37,
              "count": null
            }
          ]
        }
      ]
    };
    //开工热度城市地图
    var cityOption1 = {
      title: {
        text: '开工热度省级地图',
        left: 'center',
        top:'3%',
        textStyle:{
          color:'#000',
          fontSize: 20,
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
        color: ['#075e89','#f6f3d2'],
        text: ['高', '低']
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
              var unit =  '%' ;
              var name = '开工率';

              if(params.value) {
                return params.data.name + '<br />'
                  + name + '：' +  params.data.value + unit +  '<br />'
                  + '车辆数量：' + params.data.count + ' 台/天';
              }
              return params.name + '<br />'
                + name + '：' + 0 + unit +  '<br />'
                + '车辆数量：' + 0 + ' 台/天';
            }
            return '';
          }
        }
      ],
      toolbox: {
        show: true,
        itemSize: 20,
        itemGap: 30,
        top: 'bottom',
        feature: {
          saveAsImage: {}
        }
      },
      series: [
        {
          type: 'map',
          mapType: 'china',
          label: {
            emphasis: {
              show: true
            }
          },
          roam:true,
          scaleLimit: {
            min: 1
          },
          itemStyle: {
            normal: {
            },
            emphasis: {
              areaColor: '#389BB7',
              borderWidth: 0
            }
          },
          animation: false,
          data:''
        }
      ]
    };
    //销售热度城市地图
    var cityOption2 = {
      title: {
        text: '销售热度省级地图',
        left: 'center',
        top:'3%',
        textStyle:{
          fontSize: 20,
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
        color: ['orangered','yellow','lightskyblue'],
        text: ['高', '低']
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
              if(params.value) {
                return params.data.name + '<br />'
                  + '车辆数量：' + params.data.value + ' 台';
              }
              return params.name + '<br />'
                + '车辆数量：' + 0 + ' 台';
            }
            return '';
          }
        }
      ],
      toolbox: {
        show: true,
        itemSize: 20,
        itemGap: 30,
        top: 'bottom',
        feature: {
          saveAsImage: {}
        }
      },
      series: [
        {
          type: 'map',
          mapType: 'china',
          label: {
            emphasis: {
              show: true
            }
          },
          roam:true,
          scaleLimit: {
            min: 1
          },
          itemStyle: {
            normal: {
            },
            emphasis: {
              areaColor: '#389BB7',
              borderWidth: 0
            }
          },
          animation: false,
          data:''
        }
      ]
    };


    var mapChart1 = vm.echartsInit('mapContainer1');
    mapChart1.setOption(chinaOption1);
    vm.vehicleType1=1;
    vm.vehicleType2=2;
    //单一车型查询\
    vm.query = function(startDate,endDate,dateType1,dateType2,monthDate,hours,machineType1,vehicleType1,heatType1){
      if(null==machineType1||null==heatType1) {
        Notification.warning({message: '请选择单一车型状态下查询相关参数'});
        return;
      }


      var monthDateFormated;
      var provinceSales;//省总销售额
      var beforeProvinceSales;//上周期省总销售额
      var totalData;//总销售额
      var beforeTotalData;//上周期总销售额

      if(heatType1==1){
        var mapOption1= chinaOption1;

      }else if(heatType1==0){
        var mapOption1= chinaOption2;

      }

        var mapChart1 = vm.echartsInit('mapContainer1');
        mapOption1.title.left = "center";
        mapOption1.title. textStyle={fontSize: 26};
        mapOption1.title. subtextStyle={fontSize: 17};
        if(machineType1=="2"){
          if(heatType1==1){
            mapOption1.title.text = "挖掘机开工热度分布";
            mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType1==0){
            mapOption1.title.text = "挖掘机销售热度分布";
            mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }
        if(machineType1=="1"){
          if(heatType1==1){
            mapOption1.title.text = "装载机开工热度分布";
            mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType1==0){
            mapOption1.title.text = "装载机销售热度分布";
            mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }
        var mapTitleText = mapOption1.title.text;
        var mapTitleTextstyle = mapOption1.title.textStyle;
        var mapTitleSubtextstyle = mapOption1.title.subtextStyle;
        mapChart1.setOption(mapOption1);
        var backButtons = document.getElementsByClassName("backChina");
        backButtons[0].style.display = "none";

        //地图下钻
        mapChart1.on("click", function (param){
          if(heatType1==1){
            var cityMap = cityOption1;
          } else if(heatType1==0) {
            var cityMap = cityOption2;
          }
          backButtons[0].style.display = "block";
          var n = getindex(param.name,provincesText);
          var Cname = provinces[n];
          cityMap.title.text=param.name;
          cityMap.series[0].mapType=Cname;
          var cityChart = vm.echartsInit('mapContainer1');
          $http.get('assets/json/province/'+Cname+'.json').success(function (geoJson){
            echarts.registerMap(Cname, geoJson);


            cityChart.setOption(cityMap);
          });

            // cityChart.setOption(cityMap);


        })
        //省级地图返回到中国地图
        vm.backChina1 = function () {
          mapChart1 = vm.echartsInit("mapContainer1");
          mapOption1.title.text = mapTitleText;
          mapOption1.title. textStyle=mapTitleTextstyle;
          mapOption1.title. subtextStyle=mapTitleSubtextstyle;
          mapChart1.setOption(mapOption1);
          backButtons[0].style.display = "none";
          //省级地图返回到中国地图再次点击地图下钻
          mapChart1.on("click", function (param){
            if(heatType1==1){
              var cityMap = cityOption1;
            } else if(heatType1==0) {
              var cityMap = cityOption2;
            }
            backButtons[0].style.display = "block";
            var n = getindex(param.name,provincesText);
            var Cname = provinces[n];
            cityMap.title.text=param.name;
            cityMap.series[0].mapType=Cname;
            var cityChart = vm.echartsInit('mapContainer1');
            $http.get('assets/json/province/'+Cname+'.json').success(function (geoJson){
              echarts.registerMap(Cname, geoJson);
            });

              cityChart.setOption(cityMap);
        })

        }
      var mapContainerList = document.getElementsByClassName("mapContainer");
      mapContainerList[0].style.width = "100%";
      mapContainerList[1].style.width = "100%";

      var mapContainerBoxList = document.getElementsByClassName("mapContainerBox");
      mapContainerBoxList[0].style.width = "100%";
      mapContainerBoxList[1].style.width = "0%";
      var mapContainerBox = document.getElementById("mapContainerBox");
      mapContainerBox.style.display = "none";









    }





    //车型对比查询
    vm.viewResults = function(startDate,endDate,dateType1,dateType2,monthDate,hours,machineType1,machineType2,vehicleType1,vehicleType2,heatType1,heatType2){
      if(null==machineType1||null==machineType2||null==heatType1||null==heatType2||null==vehicleType1||null==vehicleType2){
        Notification.warning({message: '请选择相关参数'});
      }else if(machineType1 == machineType2&&heatType1==heatType2&&vehicleType1==vehicleType2){
        Notification.warning({message: "相同参数类型的数据没有对比意义，请重新选择参数!"});
      }else {







        //热度对比显示格局样式
        var mapContainerBoxList = document.getElementsByClassName("mapContainerBox");
        mapContainerBoxList[0].style.width = "50%";
        mapContainerBoxList[1].style.width = "50%";
        // var mapContainerQushi2 = document.getElementById("mapContainerQushi2");
        // mapContainerQushi2.style.display = "block";
        var mapContainerBox = document.getElementById("mapContainerBox2");
        mapContainerBox.style.display = "block";


        var mapChart1 = vm.echartsInit('mapContainer1');
        mapChart1.setOption(chinaOption1);
        var mapChart2 = vm.echartsInit('mapContainer2');
        mapChart2.setOption(chinaOption2);
      }
    }

    function getindex(name,arr){
      for (var i = 0; i < arr.length; i++) {
        if(name==arr[i]){
          return i;
        }
      }
    }

    var provinces = ['shanghai', 'hebei','shanxi','neimenggu','liaoning','jilin','heilongjiang','jiangsu','zhejiang','anhui','fujian','jiangxi','shandong','henan','hubei','hunan','guangdong','guangxi','hainan','sichuan','guizhou','yunnan','xizang','shanxi1','gansu','qinghai','ningxia','xinjiang', 'beijing', 'tianjin', 'chongqing', 'xianggang', 'aomen', 'taiwan'];
    var provincesText = ['上海市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省','黑龙江省',  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省','河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区', '北京市', '天津市', '重庆市', '香港特別行政區', '澳門特別行政區', '台湾省'];

    //重置按钮
    vm.reset = function () {
      // vm.machineType1 = null;
      // vm.machineType2 = null;
      // vm.heatType1 = null;
      // vm.heatType2 = null;
      // vm.machineType = null;
      // vm.heatType = null;
    }


  }
})();
