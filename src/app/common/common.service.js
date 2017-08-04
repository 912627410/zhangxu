/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  var GPSCloudFactory =angular.module('GPSCloud')
  GPSCloudFactory.factory('DataDemo', DataDemo);

  /** @ngInject */
    function DataDemo() {
      return {
        getDatas: function () {
        return [
          {
            'DemographicId': 1,
            'ParentId':      null,
            'Name':          'United States of America',
            'Description':   'United States of America',
            'Area':          9826675,
            'Population':    318212000,
            'TimeZone':      'UTC -5 to -10'
          }, {
            'DemographicId': 2,
            'ParentId':      1,
            'Name':          'California',
            'Description':   'The Tech State',
            'Area':          423970,
            'Population':    38340000,
            'TimeZone':      'Pacific Time'
          }, {
            'DemographicId': 3,
            'ParentId':      2,
            'Name':          'San Francisco',
            'Description':   'The happening city',
            'Area':          231,
            'Population':    837442,
            'TimeZone':      'PST'
          }, {
            'DemographicId': 4,
            'ParentId':      2,
            'Name':          'Los Angeles',
            'Description':   'Disco city',
            'Area':          503,
            'Population':    3904657,
            'TimeZone':      'PST'
          }, {
            'DemographicId': 5,
            'ParentId':      1,
            'Name':          'Illinois',
            'Description':   'Not so cool',
            'Area':          57914,
            'Population':    12882135,
            'TimeZone':      'Central Time Zone'
          }, {
            'DemographicId': 6,
            'ParentId':      5,
            'Name':          'Chicago',
            'Description':   'Financial City',
            'Area':          234,
            'Population':    2695598,
            'TimeZone':      'CST'
          }, {
            'DemographicId': 7,
            'ParentId':      1,
            'Name':          'Texas',
            'Description':   'Rances, Oil & Gas',
            'Area':          268581,
            'Population':    26448193,
            'TimeZone':      'Mountain'
          }, {
            'DemographicId': 8,
            'ParentId':      1,
            'Name':          'New York',
            'Description':   'The largest diverse city',
            'Area':          141300,
            'Population':    19651127,
            'TimeZone':      'Eastern Time Zone'
          }, {
            'DemographicId': 14,
            'ParentId':      8,
            'Name':          'Manhattan',
            'Description':   'Time Square is the place',
            'Area':          269.403,
            'Population':    0,
            'TimeZone':      'EST'
          }, {
            'DemographicId': 15,
            'ParentId':      14,
            'Name':          'Manhattan City',
            'Description':   'Manhattan island',
            'Area':          33.77,
            'Population':    0,
            'TimeZone':      'EST'
          }, {
            'DemographicId': 16,
            'ParentId':      14,
            'Name':          'Time Square',
            'Description':   'Time Square for new year',
            'Area':          269.40,
            'Population':    0,
            'TimeZone':      'EST'
          }, {
            'DemographicId': 17,
            'ParentId':      8,
            'Name':          'Niagra water fall',
            'Description':   'Close to Canada',
            'Area':          65.7,
            'Population':    0,
            'TimeZone':      'EST'
          }, {
            'DemographicId': 18,
            'ParentId':      8,
            'Name':          'Long Island',
            'Description':   'Harbour to Atlantic',
            'Area':          362.9,
            'Population':    0,
            'TimeZone':      'EST'
          }, {
            'DemographicId': 51,
            'ParentId':      1,
            'Name':          'All_Other',
            'Description':   'All_Other demographics',
            'Area':          0,
            'Population':    0,
            'TimeZone':      0
          }, {
            'DemographicId': 201,
            'ParentId':      null,
            'Name':          'India',
            'Description':   'Hydrabad tech city',
            'Area':          9826675,
            'Population':    318212000,
            'TimeZone':      'IST'
          }, {
            'DemographicId': 301,
            'ParentId':      null,
            'Name':          'Bangladesh',
            'Description':   'Country of love',
            'Area':          9826675,
            'Population':    318212000,
            'TimeZone':      'BST'
          }];
      }}
    }


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
        time.setMonth(time.getMonth() + 1);
        var y = time.getFullYear();
        var m = time.getMonth() - 1;
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

      }
    };
    return list;

  });



})();
