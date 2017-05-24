/**
 * Created by mengwei on 17-4-24.
 */

(function () {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('machineComparedMngController', machineComparedMngController);

  /** @ngInject */
  function machineComparedMngController($rootScope, $scope, $http, $filter,Notification,serviceResource,SALES_HEAT_QUERY,START_HEAT_QUERY,AVG_WORK_HOUR_QUERY) {
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
    //刷新页面后设置默认的查询属性
    vm.machineType = "A1";
    vm.heatType = "1";
    vm.dateType1 = "1";
    vm.dateType2 = "11";
    vm.heatType3 = "1";
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
    vm.one = true;
    vm.two = false;
    //触发选择框时间
    vm.change = function (dateType1) {
      if(dateType1==3){
        vm.dayQuery = true;
        vm.otherQuery= false;
      } else if(dateType1==2){
        vm.otherQuery=true;
        vm.dayQuery = false;
        vm.two = true;
        vm.one = false;
        vm.dateType2 = "21";
      } else {
        vm.otherQuery=true;
        vm.dayQuery = false;
        vm.one = true;
        vm.two = false;
        vm.dateType2 = "11";
      }
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
              var unit =  '%' ;
              var name = '开工率';

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
        max:100,
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
          data:[{"name":"西藏自治区","value":70.792,"count":11329},
            {"name":"宁夏回族自治区","value":66.195,"count":2331},
            {"name":"湖北省","value":72.186,"count":6015},
            {"name":"湖南省","value":62.47,"count":5060},
            {"name":"云南省","value":71.727,"count":17543},
            {"name":"贵州省","value":65.658,"count":8858},
            {"name":"福建省","value":68.904,"count":3695},
            {"name":"安徽省","value":70.09,"count":10632},
            {"name":"江苏省","value":77.593,"count":5708},
            {"name":"青海省","value":45.477,"count":2432},
            {"name":"重庆市","value":71.488,"count":1210},
            {"name":"上海市","value":93.939,"count":66},
            {"name":"新疆维吾尔自治区","value":66.631,"count":1888},
            {"name":"四川省","value":71.654,"count":5761},
            {"name":"山西省","value":66.314,"count":17402},
            {"name":"黑龙江省","value":76.793,"count":2594},
            {"name":"江西省","value":70.121,"count":6098},
            {"name":"浙江省","value":74.735,"count":3297},
            {"name":"广东省","value":77.198,"count":7153},
            {"name":"天津市","value":62.5,"count":328},
            {"name":"陕西省","value":72.174,"count":5599},
            {"name":"甘肃省","value":58.157,"count":6534},
            {"name":"辽宁省","value":67.079,"count":6464},
            {"name":"山东省","value":48.732,"count":54237},
            {"name":"河北省","value":80.368,"count":19733},
            {"name":"海南省","value":81.76,"count":2045},
            {"name":"澳門特別行政區","value":100.0,"count":21},
            {"name":"北京市","value":64.65,"count":1256},
            {"name":"吉林省","value":63.288,"count":2871},
            {"name":"河南省","value":77.491,"count":13777},
            {"name":"内蒙古自治区","value":64.411,"count":8511},
            {"name":"广西壮族自治区","value":73.365,"count":3762}]
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
        max:100,
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
          data:[{"name":"西藏自治区","value":70.792,"count":11329},
            {"name":"宁夏回族自治区","value":66.195,"count":2331},
            {"name":"湖北省","value":72.186,"count":6015},
            {"name":"湖南省","value":62.47,"count":5060},
            {"name":"云南省","value":71.727,"count":17543},
            {"name":"贵州省","value":65.658,"count":8858},
            {"name":"福建省","value":68.904,"count":3695},
            {"name":"安徽省","value":70.09,"count":10632},
            {"name":"江苏省","value":77.593,"count":5708},
            {"name":"青海省","value":45.477,"count":2432},
            {"name":"重庆市","value":71.488,"count":1210},
            {"name":"上海市","value":93.939,"count":66},
            {"name":"新疆维吾尔自治区","value":66.631,"count":1888},
            {"name":"四川省","value":71.654,"count":5761},
            {"name":"山西省","value":66.314,"count":17402},
            {"name":"黑龙江省","value":76.793,"count":2594},
            {"name":"江西省","value":70.121,"count":6098},
            {"name":"浙江省","value":74.735,"count":3297},
            {"name":"广东省","value":77.198,"count":7153},
            {"name":"天津市","value":62.5,"count":328},
            {"name":"陕西省","value":72.174,"count":5599},
            {"name":"甘肃省","value":58.157,"count":6534},
            {"name":"辽宁省","value":67.079,"count":6464},
            {"name":"山东省","value":48.732,"count":54237},
            {"name":"河北省","value":80.368,"count":19733},
            {"name":"海南省","value":81.76,"count":2045},
            {"name":"澳門特別行政區","value":100.0,"count":21},
            {"name":"北京市","value":64.65,"count":1256},
            {"name":"吉林省","value":63.288,"count":2871},
            {"name":"河南省","value":77.491,"count":13777},
            {"name":"内蒙古自治区","value":64.411,"count":8511},
            {"name":"广西壮族自治区","value":73.365,"count":3762}]

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
    vm.query = function (startDate,endDate,dateType1,dateType,machineType1,heatType1) {
      if(null==machineType1||null==heatType1) {
        Notification.warning({message: '请选择单一车型状态下查询相关参数'});
        return;
      }
      if(heatType1==1){
        var mapOption1 = chinaOption1;
      } else if(heatType1==0) {
        var mapOption1 = chinaOption2;
      }

      //判断查询时间段
      if(dateType){
        if(dateType==11){
          var filterTerm = 201702;
        }
        if(dateType==12){
          filterTerm = 201701;
        }
        if(dateType==13){
          filterTerm = 201604;
        }
        if(dateType==14){
          filterTerm = 201603;
        }
        if(dateType==15){
          filterTerm = 201602;
        }
        if(dateType==16){
          filterTerm = 201601;
        }
        if(dateType==21){
          filterTerm = 201705;
        }
        if(dateType==22){
          filterTerm = 201704;
        }
        if(dateType==23){
          filterTerm = 201703;
        }
        if(dateType==24){
          filterTerm = 201702;
        }
        if(dateType==25){
          filterTerm = 201701;
        }
        if(dateType==26){
          filterTerm = 201612;
        }
        if(dateType==27){
          filterTerm = 201611;
        }
        if(dateType==28){
          filterTerm = 201610;
        }
        if(dateType==29){
          filterTerm = 201609;
        }
        if(dateType==30){
          filterTerm = 201608;

        }
        if(dateType==31){
          filterTerm = 201607;
        }
        if(dateType==32){
          filterTerm = 201606;
        }
      } else {
        if (startDate) {
          var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
          var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
          filterTerm = "startDate=" + startDateFormated;
        }
        if (endDate) {
          var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
          var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
          filterTerm += "&endDate=" + endDateFormated;
        }
      }
      //开工热度查询判断按某种周期
      if(heatType1==1){
        var restCallURL = START_HEAT_QUERY;
        if(dateType1==1){
          restCallURL += "quarter?workRateQuarter=";
        }
        if(dateType1==2){
          restCallURL += "month?workRateMonth=";
        }
        if(dateType1==3){
          restCallURL += "date?";
        }
        //判断是哪种车型
        if(machineType1=="1,2,3"){
          filterTerm += "&machineType=" + 1;
        }
        if(machineType1=="A1"){
          filterTerm += "&machineType=" + 3;
        }
        if(machineType1=="40"){
          filterTerm += "&machineType=" + 2;
        }
      }
      //销售热度查询判断按某种周期
      if(heatType1==0){
        var restCallURL = SALES_HEAT_QUERY;
        if(dateType1==1){
          restCallURL += "quarter?salesHeatQuarter=";
        }
        if(dateType1==2){
          restCallURL += "month?salesHeatMonth=";
        }
        if(dateType1==3){
          restCallURL += "date?";
        }
        //判断是哪种车型
        if(machineType1=="1,2,3"){
          filterTerm += "&machineType=" + 1;
        }
        if(machineType1=="A1"){
          filterTerm += "&machineType=" + 2;
        }
        if(machineType1=="40"){
          filterTerm += "&machineType=" + 2;
        }
      }

      //开工热度查询默认查询范围2小时
      if(heatType1==1){
        filterTerm += "&hourScope=2";
      }
      //拼接查询路径
      if (filterTerm){
        restCallURL += filterTerm;
      }
      var rspData = serviceResource.restCallService(restCallURL, 'QUERY');
      rspData.then(function (data) {
        var max =100;
        if(!data.length>0){
          mapOption1.series[0].data=null;
          // Notification.warning("所选时间段暂无数据！");
        } else {
          var max = data[0].value;
          for(var i=1;i<data.length;i++){
            if(max<data[i].value){
              max=data[i].value
            }
          }
        }
        mapOption1.series[0].data=data;
        mapOption1.visualMap.max=max;
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
        vm.showMachineHeatDetails(startDate,endDate,dateType1,dateType,heatType1);
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
      // vm.mapchartLeftInit(machineType1,heatType1);
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


    //查看对比结果
    vm.viewResults = function (startDate,endDate,dateType1,dateType,machineType1,machineType2,heatType1,heatType2) {
      if(dateType){
        startDate=null;
        endDate=null;
      }
      if(null==machineType1||null==machineType2||null==heatType1||null==heatType2){
        Notification.warning({message: '请选择相关参数'});
      }else if(machineType1 == machineType2&&heatType1==heatType2){
        Notification.warning({message: "相同车辆类型的相同热度类型的数据没有对比意义，请重新选择参数!"});
      }else{

        //开工热度查询判断按某种周期--左图
        if(heatType1==1){
          var restCallURL1 = START_HEAT_QUERY;
          if(dateType1==1){
            restCallURL1 += "quarter?workRateQuarter=";
          }
          if(dateType1==2){
            restCallURL1 += "month?workRateMonth=";
          }
          if(dateType1==3){
            restCallURL1 += "date?";
          }
        }
        //销售热度查询判断按某种周期--左图
        if(heatType1==0){
          var restCallURL1 = SALES_HEAT_QUERY;
          if(dateType1==1){
            restCallURL1 += "quarter?salesHeatQuarter=";
          }
          if(dateType1==2){
            restCallURL1 += "month?salesHeatMonth=";
          }
          if(dateType1==3){
            restCallURL1 += "date?";
          }
        }
        //开工热度查询判断按某种周期--右图
        if(heatType2==1){
          var restCallURL2 = START_HEAT_QUERY;
          if(dateType1==1){
            restCallURL2 += "quarter?workRateQuarter=";
          }
          if(dateType1==2){
            restCallURL2 += "month?workRateMonth=";
          }
          if(dateType1==3){
            restCallURL2 += "date?";
          }
        }
        //销售热度查询判断按某种周期--右图
        if(heatType2==0){
          var restCallURL2 = SALES_HEAT_QUERY;
          if(dateType1==1){
            restCallURL2 += "quarter?salesHeatQuarter=";
          }
          if(dateType1==2){
            restCallURL2 += "month?salesHeatMonth=";
          }
          if(dateType1==3){
            restCallURL2 += "date?";
          }
        }
        //判断查询时间段--左图
        if(dateType){
          if(dateType==11){
            var filterTerm1 = 201702;
          }
          if(dateType==12){
            filterTerm1 = 201701;
          }
          if(dateType==13){
            filterTerm1 = 201604;
          }
          if(dateType==14){
            filterTerm1 = 201603;
          }
          if(dateType==15){
            filterTerm1 = 201602;
          }
          if(dateType==16){
            filterTerm1 = 201601;
          }
          if(dateType==21){
            filterTerm1 = 201705;
          }
          if(dateType==22){
            filterTerm1 = 201704;
          }
          if(dateType==23){
            filterTerm1 = 201703;
          }
          if(dateType==24){
            filterTerm1 = 201702;
          }
          if(dateType==25){
            filterTerm1 = 201701;
          }
          if(dateType==26){
            filterTerm1 = 201612;
          }
          if(dateType==27){
            filterTerm1 = 201611;
          }
          if(dateType==28){
            filterTerm1 = 201610;
          }
          if(dateType==29){
            filterTerm1 = 201609;
          }
          if(dateType==30){
            filterTerm1 = 201608;

          }
          if(dateType==31){
            filterTerm1 = 201607;
          }
          if(dateType==32){
            filterTerm1 = 201606;
          }
        } else {
          if (startDate) {
            var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
            var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
            filterTerm1 = "startDate=" + startDateFormated;
          }
          if (endDate) {
            var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
            var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
            filterTerm1 += "&endDate=" + endDateFormated;
          }
        }
        //判断查询时间段--右图
        if(dateType){
          if(dateType==11){
            var filterTerm2 = 201702;
          }
          if(dateType==12){
            filterTerm2 = 201701;
          }
          if(dateType==13){
            filterTerm2 = 201604;
          }
          if(dateType==14){
            filterTerm2 = 201603;
          }
          if(dateType==15){
            filterTerm2 = 201602;
          }
          if(dateType==16){
            filterTerm2 = 201601;
          }
          if(dateType==21){
            filterTerm2 = 201705;
          }
          if(dateType==22){
            filterTerm2 = 201704;
          }
          if(dateType==23){
            filterTerm2 = 201703;
          }
          if(dateType==24){
            filterTerm2 = 201702;
          }
          if(dateType==25){
            filterTerm2 = 201701;
          }
          if(dateType==26){
            filterTerm2 = 201612;
          }
          if(dateType==27){
            filterTerm2 = 201611;
          }
          if(dateType==28){
            filterTerm2 = 201610;
          }
          if(dateType==29){
            filterTerm2 = 201609;
          }
          if(dateType==30){
            filterTerm2 = 201608;

          }
          if(dateType==31){
            filterTerm2 = 201607;
          }
          if(dateType==32){
            filterTerm2 = 201606;
          }
        } else {
          if (startDate) {
            var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
            var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
            filterTerm2 = "startDate=" + startDateFormated;
          }
          if (endDate) {
            var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
            var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
            filterTerm2 += "&endDate=" + endDateFormated;
          }
        }
        //判断是哪种车型--左图
        if(heatType1==1){
        if(machineType1=="1,2,3"){
          filterTerm1 += "&machineType=" + 1;
        }
        if(machineType1=="A1"){
          filterTerm1 += "&machineType=" + 3;
        }
        if(machineType1=="40"){
          filterTerm1 += "&machineType=" + 2;
        }
        } else {
          if(machineType1=="1,2,3"){
            filterTerm1 += "&machineType=" + 1;
          }
          if(machineType1=="A1"){
            filterTerm1 += "&machineType=" + 2;
          }
          if(machineType1=="40"){
            filterTerm1 += "&machineType=" + 2;
          }
        }
        //判断是哪种车型--右图
        if(heatType2==1){
        if(machineType2=="1,2,3"){
          filterTerm2 += "&machineType=" + 1;
        }
        if(machineType2=="A1"){
          filterTerm2 += "&machineType=" + 3;
        }
        if(machineType2=="40"){
          filterTerm2 += "&machineType=" + 2;
        }
        } else {
          if(machineType2=="1,2,3"){
            filterTerm2 += "&machineType=" + 1;
          }
          if(machineType2=="A1"){
            filterTerm2 += "&machineType=" + 2;
          }
          if(machineType2=="40"){
            filterTerm2 += "&machineType=" + 2;
          }
        }
        //开工热度查询默认查询范围2小时
        if(heatType1==1){
          filterTerm1 += "&hourScope=2";
        }
        if(heatType2==1){
          filterTerm2 += "&hourScope=2";
        }
        //拼接查询路径
        if (filterTerm1){
          restCallURL1 += filterTerm1;
        }
        if (filterTerm2){
          restCallURL2 += filterTerm2;
        }
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
        if(heatType1==1){
          var mapOption1 = chinaOption1;
        } else if(heatType1==0) {
          var mapOption1 = chinaOption2;
        }
        mapOption1.title.left = "left";
        mapOption1.title. textStyle={fontSize: 21};
        mapOption1.title. subtextStyle={fontSize: 12};
        if(heatType1==1){
          var mapOption2 = chinaOption1;
        } else if(heatType1==0) {
          var mapOption2 = chinaOption2;
        }
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
            mapOption2.title.text = "小挖开工热度分布";
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
        var max1=100;
        var max2=100;
        var rspData1 = serviceResource.restCallService(restCallURL1, 'QUERY');
        rspData1.then(function (data1) {
          if(!data1.length>0){
            mapOption2.series[0].data=null;
            // Notification.warning("左图所选时间段暂无数据！");
          }else{
            max1 = data1[0].value;
            for(var i=1;i<data1.length;i++){
              if(max1<data1[i].value){
                max1=data1[i].value
              }
            }
          }
          mapOption1.series[0].data=data1;
          var rspData2 = serviceResource.restCallService(restCallURL2, 'QUERY');
          rspData2.then(function (data2) {
            if(!data2.length>0){
              mapOption2.series[0].data=null;
              // Notification.warning("右图所选时间段暂无数据！");
            } else {
              max2 = data2[0].value;
              for(var i=1;i<data2.length;i++){
                if(max2<data2[i].value){
                  max2=data2[i].value
                }
              }
            }
            mapOption2.series[0].data=data2;
            var max3=100;
            if(max1>=max2){
              max3 = max1;
            } else {
              max3 = max2;
            }
            mapOption1.visualMap.max=max3;
            mapChart1.setOption(mapOption1);
            mapOption2.visualMap.max=max3;
            mapChart2.setOption(mapOption2);
          }, function (reason) {

            Notification.error("获取数据失败");
          });

        }, function (reason) {

          Notification.error("获取数据失败");
        });

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
    var provincesText = ['上海市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省','黑龙江省',  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省','河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区', '北京市', '天津市', '重庆市', '香港特別行政區', '澳门特別行政區'];

    //查看各类车车辆热度分布
    vm.showMachineHeatDetails = function (startDate,endDate,dateType1,dateType,heatType1) {
      if(dateType){
        startDate=null;
        endDate=null;
      }
      chinaOption1.title.left = "center";
      chinaOption1.title. textStyle={fontSize: 17};
      chinaOption1.title. subtextStyle={fontSize: 8};
      chinaOption1.visualMap.color= ['#075e89','#FFFFFF'];
      chinaOption2.title.left = "center";
      chinaOption2.title. textStyle={fontSize: 17};
      chinaOption2.title. subtextStyle={fontSize: 8};
      chinaOption2.visualMap.color= ['orangered','yellow','lightskyblue'];
      var subMapOption1 = chinaOption1;
      var subMapOption2 = chinaOption1;
      var subMapOption3 = chinaOption1;
      var subMapOption4 = chinaOption2;
      var subMapOption5 = chinaOption2;
      var subMapOption6 = chinaOption2;
      //开工热度查询判断按某种周期
      if(heatType1==1){
        var restCallURL = START_HEAT_QUERY;
        if(dateType1==1){
          restCallURL += "quarter?workRateQuarter=";
        }
        if(dateType1==2){
          restCallURL += "month?workRateMonth=";
        }
        if(dateType1==3){
          restCallURL += "date?";
        }
      }
      //销售热度查询判断按某种周期
      if(heatType1==0){
        var restCallURL = SALES_HEAT_QUERY;
        if(dateType1==1){
          restCallURL += "quarter?salesHeatQuarter=";
        }
        if(dateType1==2){
          restCallURL += "month?salesHeatMonth=";
        }
        if(dateType1==3){
          restCallURL += "date?";
        }
      }

      //判断查询时间段
      if(dateType){
        if(dateType==11){
          var filterTerm = 201702;
        }
        if(dateType==12){
          filterTerm = 201701;
        }
        if(dateType==13){
          filterTerm = 201604;
        }
        if(dateType==14){
          filterTerm = 201603;
        }
        if(dateType==15){
          filterTerm = 201602;
        }
        if(dateType==16){
          filterTerm = 201601;
        }
        if(dateType==21){
          filterTerm = 201705;
        }
        if(dateType==22){
          filterTerm = 201704;
        }
        if(dateType==23){
          filterTerm = 201703;
        }
        if(dateType==24){
          filterTerm = 201702;
        }
        if(dateType==25){
          filterTerm = 201701;
        }
        if(dateType==26){
          filterTerm = 201612;
        }
        if(dateType==27){
          filterTerm = 201611;
        }
        if(dateType==28){
          filterTerm = 201610;
        }
        if(dateType==29){
          filterTerm = 201609;
        }
        if(dateType==30){
          filterTerm = 201608;

        }
        if(dateType==31){
          filterTerm = 201607;
        }
        if(dateType==32){
          filterTerm = 201606;
        }
      } else {
        if (startDate) {
          var startMonth = startDate.getMonth() + 1;  //getMonth返回的是0-11
          var startDateFormated = startDate.getFullYear() + '-' + startMonth + '-' + startDate.getDate();
          filterTerm = "startDate=" + startDateFormated;
        }
        if (endDate) {
          var endMonth = endDate.getMonth() + 1;  //getMonth返回的是0-11
          var endDateFormated = endDate.getFullYear() + '-' + endMonth + '-' + endDate.getDate();
          filterTerm += "&endDate=" + endDateFormated;
        }
      }
      //开工热度查询默认查询范围2小时
      if(heatType1==1){
        filterTerm += "&hourScope=2";
      }
      if(heatType1==1){
      //查询装载机
      var filterTerm1 = filterTerm;
      filterTerm1 += "&machineType=" + 1;
      //查询中挖
      var filterTerm2 = filterTerm;
      filterTerm2 += "&machineType=" + 2;
      //查询小挖
      var filterTerm3 = filterTerm;
      filterTerm3 += "&machineType=" + 3;
      } else if(heatType1==0){
        //查询装载机
        var filterTerm1 = filterTerm;
        filterTerm1 += "&machineType=" + 1;
        //查询中挖
        var filterTerm2 = filterTerm;
        filterTerm2 += "&machineType=" + 2;
        //查询小挖
        var filterTerm3 = filterTerm;
        filterTerm3 += "&machineType=" + 2;
      }
      //拼接查询路径
      if (filterTerm){
        //装载机
        var restCallURL1 = restCallURL;
        restCallURL1 += filterTerm1;
        //中挖
        var restCallURL2 =restCallURL;
        restCallURL2 += filterTerm2;
        //小挖
        var restCallURL3 =restCallURL;
        restCallURL3 += filterTerm3;
      }
      var rspData1 = serviceResource.restCallService(restCallURL1, 'QUERY');
      rspData1.then(function (data1) {
        var max = 100;
        if(!data1.length>0){
          subMapOption1.series[0].data=null;
          subMapOption4.series[0].data=null;
          // Notification.warning("装载机所选时间段暂无数据！");
        } else {
          max = data1[0].value;
          for(var i=1;i<data1.length;i++){
            if(max<data1[i].value){
              max=data1[i].value
            }
          }
        }

        if(heatType1==1){
          subMapOption1.series[0].data=data1;
          subMapOption1.visualMap.max=max;
          subMapOption1.title.text = "装载机开工热度分布";
          subMap2.setOption(subMapOption1);
        }else if(heatType1==0){
          subMapOption4.series[0].data = data1;
          subMapOption4.visualMap.max=max;
          subMapOption4.title.text = "装载机销售热度分布";
          subMap2.setOption(subMapOption4);
        }

      }, function (reason) {

        Notification.error("获取数据失败");
      });
      var rspData2 = serviceResource.restCallService(restCallURL2, 'QUERY');
      rspData2.then(function (data2) {
        var max = 100;
        if(!data2.length>0){
          subMapOption2.series[0].data=null;
          subMapOption5.series[0].data=null;
          // Notification.warning("中挖所选时间段暂无数据！");
        } else {
          max = data2[0].value;
          for(var i=1;i<data2.length;i++){
            if(max<data2[i].value){
              max=data2[i].value
            }
          }
        }

        if(heatType1==1) {
          subMapOption2.series[0].data = data2;
          subMapOption2.visualMap.max=max;
          subMapOption2.title.text = "中挖开工热度分布";
          subMap3.setOption(subMapOption2);
        }else if(heatType1==0){
          subMapOption5.series[0].data = data2;
          subMapOption5.visualMap.max=max;
          subMapOption5.title.text = "中挖销售热度分布";
          subMap3.setOption(subMapOption5);
        }
      }, function (reason) {

        Notification.error("获取数据失败");
      });
      var rspData3 = serviceResource.restCallService(restCallURL3, 'QUERY');
      rspData3.then(function (data3) {
        var max =100;
        if(!data3.length>0){
          subMapOption3.series[0].data=null;
          subMapOption6.series[0].data=null;
          // Notification.warning("小挖所选时间段暂无数据！");
        } else {
          max = data3[0].value;
          for(var i=1;i<data3.length;i++){
            if(max<data3[i].value){
              max=data3[i].value
            }
          }
        }
        if(heatType1==1) {
          subMapOption3.series[0].data = data3;
          subMapOption3.visualMap.max=max;
          subMapOption3.title.text = "小挖开工热度分布";
          subMap1.setOption(subMapOption3);
        }else if(heatType1==0){
          subMapOption6.series[0].data = data3;
          subMapOption6.visualMap.max=max;
          subMapOption6.title.text = "小挖销售热度分布";
          subMap1.setOption(subMapOption6);
        }
      }, function (reason) {

        Notification.error("获取数据失败");
      });
    }

    //右侧按车辆类型的热度分布初始化
    vm.showMachineHeatDetails(null,null,1,11,1);

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

