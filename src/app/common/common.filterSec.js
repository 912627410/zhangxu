/**
 * Created by yalong on 17-9-9.
 */
(function () {
  'use strict'

  angular.module('GPSCloud')

    .filter('convertToSec',function (languages) {
      return function (second) {
        var hour;
        var mins;
        var sec;
        var hourMinsSec = "";
        if(second!=null){
          second = parseInt(second);
          hour = parseInt(second/3600);
          mins = parseInt(parseInt(second%3600)/60);
          sec = parseInt(parseInt(second%3600)%60);
          if(hour > 0) {
            hourMinsSec += (hour + languages.findKey('hour'));
          }
          if(mins > 0) {
            hourMinsSec += (mins + languages.findKey('mins'));
          }
          hourMinsSec += (sec + languages.findKey('sec'));
          if(hourMinsSec != "") {
            return hourMinsSec;
          }
        }
      };
    });

})();
