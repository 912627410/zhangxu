/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  var GPSCloudFactory =angular.module('GPSCloud');

  //国际化的factory
  GPSCloudFactory.factory('languages',languages);

  function languages($translate){
    var languages = {
      findKey:function(key) {
        if(key){
          return $translate.instant(key);
        }
        return key;
      }
    }
    return languages;
  }


  //组织树的factory
  GPSCloudFactory.factory('treeFactory',treeFactory);

  function treeFactory($rootScope,$uibModal){

    var treeFactory={}

    treeFactory.treeShow=function (selectedCallback) {
      var modalInstance =  $uibModal.open({
        animation: true,
        backdrop: false,
        templateUrl: 'app/components/common/tree.html',
        controller: 'treeController as treeController'
      })
      modalInstance.result.then(function(selectedItem){
        selectedCallback(selectedItem);
      },function(){
        // 没有选中任何item
        // console.log('Modal dismissed at: ' + new Date())
      })
    }
    return treeFactory;
  }


  /**
   * 获取各种时间列表
   * @param startYear 起始时间 年
   * @param startMonth 起始时间 月
   */
  GPSCloudFactory.factory('timeList',function(){
    var i = 0;
    var list = {
      //上个月份 201705
      getMonth: function(){
        var time = new Date();
        var y = time.getFullYear();
        var m = time.getMonth() ;
        if (m == 0) {
          m = 12;
          y=y-1;
        }
        var temp;
        m = m < 10 ? '0' + m : m;
        temp = y + '' + m;
        return temp;
      },
      //按月份 [..,201612,201701, 201702,..]
      monthList: function(startYear, startMonth){
        var time = new Date();
        var length = (time.getFullYear() - startYear) * 12 + time.getMonth() - startMonth + 1;
        var temp = [];
        for(i = 0; i < length; i++) {
          time.setMonth(time.getMonth() - 1);
          var m = time.getMonth() + 1;
          m = m < 10 ? "0" + m : m;
          temp.push(time.getFullYear() + '' + m);
        }
        return temp;
      },
      //按季度 [..201604,201701,201702,..]
      quarterList: function(startYear, startMonth){
        var time = new Date();
        var length = (time.getFullYear() - startYear) * 12 + time.getMonth() - startMonth - 2;
        var result = [];
        for(i=0;i<length;i+=3){
          time.setMonth(time.getMonth() - 3);
          var q = Math.floor(time.getMonth() / 3) + 1;
          result.push(time.getFullYear() + '0' + q);
        }
        return result;
      },
      //按年份
      yearList: function(startYear){

      },
      //输出最近四个季度
      latestFourQuarter: function(){
        var time = new Date();
        var length = 12;
        var result = [];
        for(i=0;i<length;i+=3){
          time.setMonth(time.getMonth() - 3);
          var q = Math.floor(time.getMonth() / 3) + 1;
          result.push(time.getFullYear() + '年第' + q + '季度');
        }
        return result;
      }
    };
    return list;

  });



})();
