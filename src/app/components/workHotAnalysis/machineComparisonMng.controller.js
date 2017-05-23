/**
 * Created by mengwei on 17-4-24.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineComparedMngController', machineComparedMngController);

  /** @ngInject */
  function machineComparedMngController($rootScope, $scope, $http, $filter,Notification,serviceResource,START_WITH_SALE_QUERY) {
    var vm = this;
    var mapChart1;
    var mapChart2;

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
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

    vm.machineType = "A1";
    vm.heatType = "1";
    //修改查询单一车型和对比车型的切换
    vm.only=true;
    vm.comtrast=false;
    vm.toggle = function () {
      vm.only=!vm.only;
      vm.contrast=!vm.contrast;
      vm.reset();
    }
    vm.otherQuery=true;
    vm.dayQuery = false;
    vm.dayReset = false;
    vm.one = true;
    vm.two = false;
    // vm.dates = [{1,2,3},{4,5,6},{7,8,9}];
    //触发选择框时间
    vm.change = function (dateType1) {
      if(dateType1==3){
        vm.dayQuery = true;
        vm.otherQuery= false;
        vm.dayReset = true;
      } else if(dateType1==2){
        vm.otherQuery=true;
        vm.dayQuery = false;
        vm.dayReset = false;
        vm.two = true;
        vm.one = false;
      } else {
        vm.otherQuery=true;
        vm.dayQuery = false;
        vm.dayReset = false;
        vm.one = true;
        vm.two = false;
      }

    }

    // var mapDatas = [{"name":"西藏自治区","value":70.792,"count":11329},{"name":"宁夏回族自治区","value":66.195,"count":2331},{"name":"湖北省","value":72.186,"count":6015},{"name":"湖南省","value":62.47,"count":5060},{"name":"云南省","value":71.727,"count":17543},{"name":"贵州省","value":65.658,"count":8858},{"name":"福建省","value":68.904,"count":3695},{"name":"安徽省","value":70.09,"count":10632},{"name":"江苏省","value":77.593,"count":5708},{"name":"青海省","value":45.477,"count":2432},{"name":"重庆市","value":71.488,"count":1210},{"name":"上海市","value":93.939,"count":66},{"name":"新疆维吾尔自治区","value":66.631,"count":1888},{"name":"四川省","value":71.654,"count":5761},{"name":"山西省","value":66.314,"count":17402},{"name":"黑龙江省","value":76.793,"count":2594},{"name":"江西省","value":70.121,"count":6098},{"name":"浙江省","value":74.735,"count":3297},{"name":"广东省","value":77.198,"count":7153},{"name":"天津市","value":62.5,"count":328},{"name":"陕西省","value":72.174,"count":5599},{"name":"甘肃省","value":58.157,"count":6534},{"name":"辽宁省","value":67.079,"count":6464},{"name":"山东省","value":48.732,"count":54237},{"name":"河北省","value":80.368,"count":19733},{"name":"海南省","value":81.76,"count":2045},{"name":"澳門特別行政區","value":100.0,"count":21},{"name":"北京市","value":64.65,"count":1256},{"name":"吉林省","value":63.288,"count":2871},{"name":"河南省","value":77.491,"count":13777},{"name":"内蒙古自治区","value":64.411,"count":8511},{"name":"广西壮族自治区","value":73.365,"count":3762}]
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
        top:'2%',
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
        scaleLimit: {
          min: 0.5
        }
      },
      series: [
        {
          name: '开工热度',
          type: 'map',
          map: 'china',
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
        textStyle:{
          fontSize: 21,
        },
        subtext: '全国',
        subtextStyle:{
          fontSize: 12,
        },
        top:'2%',
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
        scaleLimit: {
          min: 0.5
        }
      },
      series: [
        {
          name: '销售热度',
          type: 'map',
          map: 'china',
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

    //地图大图初始化  默认显示小挖全国开工热度分布
    var mapChart1 = vm.echartsInit('mapContainer1');
    var mapOption1 = chinaOption1;
    mapOption1.title.text = "小挖开工热度分布";
    mapChart1.setOption(mapOption1);

    var backButtons = document.getElementsByClassName("backChina");

    mapChart1.on("click", function (param){
      mapOption1.title.text = "小挖开工热度分布";
      mapOption1.title. textStyle={fontSize: 26};
      mapOption1.title. subtextStyle={fontSize: 17};
      console.log("click");
      backButtons[0].style.display = "block";
      var n = getindex(param.name,provincesText);
      var Cname = provinces[n];
      showProvince(Cname,'mapContainer1');
    })

    vm.backChina1 = function () {
      mapChart1 = vm.echartsInit("mapContainer1");
      mapChart1.setOption(mapOption1);
      backButtons[0].style.display = "none";

      mapChart1.on("click", function (param){
        console.log("click");
        backButtons[0].style.display = "block";
        var n = getindex(param.name,provincesText);
        var Cname = provinces[n];
        showProvince(Cname,'mapContainer1');
      })
    }


    var subMap1 = vm.echartsInit('subMap1');
    var subMap2 = vm.echartsInit('subMap2');
    var subMap3 = vm.echartsInit('subMap3');
    //右侧按车辆类型的热度分布初始化
    vm.subMapInit = function () {
      var subMapOption1 = chinaOption1;
      subMapOption1.title.left = "center";
      subMapOption1.title. textStyle={fontSize: 17};
      subMapOption1.title. subtextStyle={fontSize: 8};
      subMapOption1.title.text = "小挖开工热度分布";
      subMapOption1.visualMap.color= ['#075e89','#FFFFFF'];

      subMap1.setOption(subMapOption1);

      var subMapOption2 = chinaOption1;
      subMapOption1.title.text = "装载机开工热度分布";
      subMapOption1.visualMap.color= ['#075e89','#FFFFFF'];
      subMap2.setOption(subMapOption1);

      var subMapOption3 = chinaOption1;
      subMapOption1.title.text = "中挖开工热度分布";
      subMapOption1.visualMap.color= ['#075e89','#FFFFFF'];
      subMap3.setOption(subMapOption1);
    }
    vm.subMapInit();
    //车辆各年份月度工作情况
    var mmuChart1 = echarts.init(document.getElementById('mmu-container1'));
    var mmuOption1 = {
      title: {
        text: '小挖开工变化趋势',
        padding: [10, 20]
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        top: 'center',
        right: 20,
        itemGap: 30,
        feature: {
          // restore: {show: true},
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
        name: '开工时长(小时)',
        nameLocation:'middle',
        nameGap:45,
        boundaryGap:true,
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

    //单一车型查询
    vm.query = function (startDate,endDate,machineType1,heatType1) {
      if(null==machineType1||null==heatType1) {
        Notification.warning({message: '请选择单一车型状态下查询相关参数'});
        return;
      }
      var mapOption1 = chinaOption1;
      var restCallURL = START_WITH_SALE_QUERY;
      // // var restCallURL = 'workRate/month?workRateMonth=201705&machineType=1&hourScope=2';
      // // if (machineType1) {
      // //   var filterTerm = "machineType=" + machineType1;
      // // }
      // // if(heatType1){
      // //   filterTerm = "&heatType=" + heatType1;
      // // }
      // // if (startDate) {
      // //   var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
      // //   var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
      // //   filterTerm += "&startDate=" + startDateFormated
      // // }
      // // if (endDate) {
      // //   var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
      // //   var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
      // //   filterTerm += "&endDate=" + endDateFormated;
      // // }
      // // if (filterTerm){
      // //   restCallURL += "?";
      // //   restCallURL += filterTerm;
      // // }
      var rspData = serviceResource.restCallService(restCallURL, 'QUERY');
      rspData.then(function (data) {
          mapOption1.series[0].data=data;
        console.log(mapOption1.series[0].data);

      }, function (reason) {

        Notification.error("获取数据失败");
      });


      var mapContainerList = document.getElementsByClassName("mapContainer");
      mapContainerList[0].style.width = "100%";
      mapContainerList[1].style.width = "100%";

      var mapContainerBoxList = document.getElementsByClassName("mapContainerBox");
      mapContainerBoxList[0].style.width = "100%";
      mapContainerBoxList[1].style.width = "0%";
      var mapContainerBox = document.getElementById("mapContainerBox");
      mapContainerBox.style.display = "none";

      //画大地图对应的变化趋势图
      var lineContainerList = document.getElementsByClassName("chart-container");
      lineContainerList[0].style.width = "65%";
      lineContainerList[1].style.width = "0%";
      mmuChart1 = echarts.init(lineContainerList[0]);
      if(machineType1=="A1"){
        if(heatType1==1){
          mmuOption1.title.text = "小挖开工变化趋势";
          mmuOption1.yAxis.name = '开工时长(小时)';

        }else if(heatType1==0){
          mmuOption1.title.text = "小挖销售热度分布";
          mmuOption1.yAxis.name = '车辆数量(台)';
        }
      }
      if(machineType1=="1,2,3"){
        if(heatType1==1){
          mmuOption1.title.text = "装载机开工变化趋势";
          mmuOption1.yAxis.name = '开工时长(小时)';

        }else if(heatType1==0){
          mmuOption1.title.text = "装载机销售变化趋势";
          mmuOption1.yAxis.name = '车辆数量(台)';
        }
      }
      if(machineType1=="40"){
        if(heatType1==1){
          mmuOption1.title.text = "中挖开工变化趋势";
          mmuOption1.yAxis.name = '开工时长(小时)';

        }else if(heatType1==0){
          mmuOption1.title.text = "中挖销售变化趋势";
          mmuOption1.yAxis.name = '车辆数量(台)';
        }
      }

      mmuChart1.setOption(mmuOption1);

    }

    vm.mapchartLeftInit = function (machineType1,heatType1){
      var mapChart1 = vm.echartsInit('mapContainer1');

      mapOption1.title.left = "center";
      mapOption1.title. textStyle={fontSize: 26};
      mapOption1.title. subtextStyle={fontSize: 17};
      if(machineType1=="A1"){
        if(heatType1==1){
          mapOption1.title.text = "小挖开工热度分布";
          mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
        }else if(heatType1==0){
          mapOption1.title.text = "小挖销售热度分布";
          mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
        }
      }
      if(machineType1=="1,2,3"){
        if(heatType1==1){
          mapOption1.title.text = "装载机开工热度分布";
          mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
        }else if(heatType1==0){
          mapOption1.title.text = "装载机销售热度分布";
          mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
        }
      }
      if(machineType1=="40"){
        if(heatType1==1){
          mapOption1.title.text = "中挖开工热度分布";
          mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
        }else if(heatType1==0){
          mapOption1.title.text = "中挖销售热度分布";
          mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
        }
      }
      var mapTitleText = mapOption1.title.text;
      var mapTitleTextstyle = mapOption1.title.textStyle;
      var mapTitleSubtextstyle = mapOption1.title.subtextStyle;
      mapChart1.setOption(mapOption1);
      vm.showMachineHeatDetails(heatType1);
      vm.heatType3 = heatType1;
      var backButtons = document.getElementsByClassName("backChina");
      backButtons[0].style.display = "none";
      mapChart1.on("click", function (param){
        console.log("click");
        backButtons[0].style.display = "block";
        var n = getindex(param.name,provincesText);
        var Cname = provinces[n];
        showProvince(Cname,'mapContainer1');
      })

      vm.backChina1 = function () {
        mapChart1 = vm.echartsInit("mapContainer1");
        mapOption1.title.text = mapTitleText;
        mapOption1.title. textStyle=mapTitleTextstyle;
        mapOption1.title. subtextStyle=mapTitleSubtextstyle;
        mapChart1.setOption(mapOption1);
        backButtons[0].style.display = "none";

        mapChart1.on("click", function (param){
          console.log("click");
          backButtons[0].style.display = "block";
          var n = getindex(param.name,provincesText);
          var Cname = provinces[n];
          showProvince(Cname,'mapContainer1');
        })
      }

    }




    //查看对比结果
    vm.viewResults = function (machineType1,machineType2,heatType1,heatType2) {
      if(null==machineType1||null==machineType2||null==heatType1||null==heatType2){
        Notification.warning({message: '请选择相关参数'});
      }else if(machineType1 == machineType2&&heatType1==heatType2){
        Notification.warning({message: "相同车辆类型的相同热度类型的数据没有对比意义，请重新选择参数!"});
      }else{

        //热度对比显示格局样式
        var mapContainerBoxList = document.getElementsByClassName("mapContainerBox");
        mapContainerBoxList[0].style.width = "50%";
        mapContainerBoxList[1].style.width = "50%";

        var mapContainerList = document.getElementsByClassName("mapContainer");
        mapContainerList[0].style.width = "100%";
        mapContainerList[1].style.width = "100%";

        var mapContainerQushi2 = document.getElementById("mapContainerQushi2");
        mapContainerQushi2.style.display = "block";
        var mapContainerBox = document.getElementById("mapContainerBox");
        mapContainerBox.style.display = "block";
        var lineContainerList = document.getElementsByClassName("chart-container");
        lineContainerList[0].style.width = "50%";
        lineContainerList[1].style.width = "50%";

        mapChart1 = vm.echartsInit("mapContainer1");
        mapChart2 = vm.echartsInit("mapContainer2");
        var mapOption1 = chinaOption1;
        mapOption1.title.left = "left";
        mapOption1.title. textStyle={fontSize: 21};
        mapOption1.title. subtextStyle={fontSize: 12};
        var mapOption2 = chinaOption2;
        mapOption2.title.left = "left";
        mapOption2.title. textStyle={fontSize: 21};
        mapOption2.title. subtextStyle={fontSize: 12};
        if(machineType1=="A1"){
          if(heatType1==1){
            mapOption1.title.text = "小挖开工热度分布";
            mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType1==0){
            mapOption1.title.text = "小挖销售热度分布";
            mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }
        if(machineType1=="1,2,3"){
          if(heatType1==1){
            mapOption1.title.text = "装载机开工热度分布";
            mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType1==0){
            mapOption1.title.text = "装载机销售热度分布";
            mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }
        if(machineType1=="40"){
          if(heatType1==1){
            mapOption1.title.text = "中挖开工热度分布";
            mapOption1.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType1==0){
            mapOption1.title.text = "中挖销售热度分布";
            mapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }


        if(machineType2=="A1"){
          if(heatType2==1){
            mapOption2.title.text = "小挖开工热度分布";serviceResource
            mapOption2.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType2==0){
            mapOption2.title.text = "小挖销售热度分布";
            mapOption2.visualMap.color= ['orangered','yellow','lightskyblue'];

          }
        }
        if(machineType2=="1,2,3"){
          if(heatType2==1){
            mapOption2.title.text = "装载机开工热度分布";
            mapOption2.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType2==0){
            mapOption2.title.text = "装载机销售热度分布";
            mapOption2.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }
        if(machineType2=="40"){
          if(heatType2==1){
            mapOption2.title.text = "中挖开工热度分布";
            mapOption2.visualMap.color= ['#075e89','#FFFFFF'];
          }else if(heatType2==0){
            mapOption2.title.text = "中挖销售热度分布";
            mapOption2.visualMap.color= ['orangered','yellow','lightskyblue'];
          }
        }

        mapChart1.setOption(mapOption1);
        mapChart2.setOption(mapOption2);
        mapChart1.on("click", function (param){
          backButtons[0].style.display = "block";
          backButtons[1].style.display = "block";
          var n = getindex(param.name,provincesText);
          var Cname = provinces[n];
          showProvince(Cname,'mapContainer1');
          showProvince(Cname,'mapContainer2');

        })
        mapChart2.on("click", function (param){
          backButtons[1].style.display = "block";
          backButtons[0].style.display = "block";
          var n = getindex(param.name,provincesText);
          var Cname = provinces[n];
          showProvince(Cname,'mapContainer2');
          showProvince(Cname,'mapContainer1');
        })

        var backButtons = document.getElementsByClassName("backChina");
        vm.backChina1 = function () {
          var mapChart1 = vm.echartsInit("mapContainer1");
          mapChart1.setOption(mapOption1);
          var mapChart2 = vm.echartsInit("mapContainer2");
          mapChart2.setOption(mapOption2);
          backButtons[0].style.display = "none";
          backButtons[1].style.display = "none";

          mapChart1.on("click", function (param){
            backButtons[0].style.display = "block";
            backButtons[1].style.display = "block";
            var n = getindex(param.name,provincesText);
            var Cname = provinces[n];
            showProvince(Cname,'mapContainer1');
            showProvince(Cname,'mapContainer2');

          });
          mapChart2.on("click", function (param){
            backButtons[1].style.display = "block";
            backButtons[0].style.display = "block";
            var n = getindex(param.name,provincesText);
            var Cname = provinces[n];
            showProvince(Cname,'mapContainer2');
            showProvince(Cname,'mapContainer1');
          })
        }

        vm.backChina2 = function () {
          var mapChart2 = vm.echartsInit("mapContainer2");
          mapChart2.setOption(mapOption2);
          var mapChart1 = vm.echartsInit("mapContainer1");
          mapChart1.setOption(mapOption1);
          backButtons[1].style.display = "none";
          backButtons[0].style.display = "none";

          mapChart2.on("click", function (param){
            backButtons[1].style.display = "block";
            backButtons[0].style.display = "block";
            var n = getindex(param.name,provincesText);
            var Cname = provinces[n];
            showProvince(Cname,'mapContainer2');
            showProvince(Cname,'mapContainer1');
          });
          mapChart1.on("click", function (param){
            backButtons[0].style.display = "block";
            backButtons[1].style.display = "block";
            var n = getindex(param.name,provincesText);
            var Cname = provinces[n];
            showProvince(Cname,'mapContainer1');
            showProvince(Cname,'mapContainer2');

          })
        }


        var mmuChart1 = echarts.init(lineContainerList[0]);
        if(machineType1=="A1"){
          if(heatType1==1){
            mmuOption1.title.text = "小挖开工变化趋势";
            mmuOption1.yAxis.name = '开工时长(小时)';

          }else if(heatType1==0){
            mmuOption1.title.text = "小挖销售热度分布";
            mmuOption1.yAxis.name = '车辆数量(台)';
          }
        }
        if(machineType1=="1,2,3"){
          if(heatType1==1){
            mmuOption1.title.text = "装载机开工变化趋势";
            mmuOption1.yAxis.name = '开工时长(小时)';

          }else if(heatType1==0){
            mmuOption1.title.text = "装载机销售变化趋势";
            mmuOption1.yAxis.name = '车辆数量(台)';
          }
        }
        if(machineType1=="40"){
          if(heatType1==1){
            mmuOption1.title.text = "中挖开工变化趋势";
            mmuOption1.yAxis.name = '开工时长(小时)';

          }else if(heatType1==0){
            mmuOption1.title.text = "中挖销售变化趋势";
            mmuOption1.yAxis.name = '车辆数量(台)';
          }
        }
        mmuChart1.setOption(mmuOption1);
        var mmuChart2 = echarts.init(lineContainerList[1]);
        var mmuOption2 = {
          title: {
            text: '开工变化趋势',
            padding: [10, 20]
          },
          toolbox: {
            show: true,
            orient: 'vertical',
            top: 'center',
            right: 20,
            itemGap: 30,
            feature: {
              // restore: {show: true},
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
            nameLocation:'middle',
            nameGap:39,
            boundaryGap:true,
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
        if(heatType2==1){
          mmuOption2.title.text = "开工变化趋势";
          mmuOption2.yAxis.name = '开工时长(小时)';
        }else if(heatType2==0){
          mmuOption2.title.text = "销售变化趋势";
          mmuOption2.yAxis.name = '车辆数量(台)';
        }
        if(machineType2=="A1"){
          if(heatType2==1){
            mmuOption2.title.text = "小挖开工变化趋势";
            mmuOption2.yAxis.name = '开工时长(小时)';

          }else if(heatType2==0){
            mmuOption2.title.text = "小挖销售热度分布";
            mmuOption2.yAxis.name = '车辆数量(台)';
          }
        }
        if(machineType2=="1,2,3"){
          if(heatType2==1){
            mmuOption2.title.text = "装载机开工变化趋势";
            mmuOption2.yAxis.name = '开工时长(小时)';
          }else if(heatType2==0){
            mmuOption2.title.text = "装载机销售变化趋势";
            mmuOption2.yAxis.name = '车辆数量(台)';
          }
        }
        if(machineType2=="40"){
          if(heatType2==1){
            mmuOption2.title.text = "中挖开工变化趋势";
            mmuOption2.yAxis.name = '开工时长(小时)';
          }else if(heatType2==0){
            mmuOption2.title.text = "中挖销售变化趋势";
            mmuOption2.yAxis.name = '车辆数量(台)';
          }
        }
        mmuChart2.setOption(mmuOption2);

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
              color: ['#075e89','#f6f3d2'],
              text: ['高', '低']
            },
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
                mapType: Cname,
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
        subMapOption1.title.left = "center";
        subMapOption1.title. textStyle={fontSize: 17};
        subMapOption1.title. subtextStyle={fontSize: 8};
        subMapOption1.title.text = "小挖销售热度分布";
        subMapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
        subMap1.setOption(subMapOption1);

        var subMapOption2 = chinaOption2;
        subMapOption1.title.text = "装载机销售热度分布";
        subMapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
        subMap2.setOption(subMapOption1);

        var subMapOption3 = chinaOption2;
        subMapOption1.title.text = "中挖销售热度分布";
        subMapOption1.visualMap.color= ['orangered','yellow','lightskyblue'];
        subMap3.setOption(subMapOption1);
      }

    }


    vm.reset = function () {
      vm.machineType1 = null;
      vm.machineType2 = null;
      vm.heatType1 = null;
      vm.heatType2 = null;
      vm.machineType = null;
      vm.heatType = null;
    }




  }
})();

