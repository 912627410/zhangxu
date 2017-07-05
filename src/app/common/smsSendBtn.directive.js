/**
 * Created by xiaopeng on 16-12-21.
 */
(function () {
 'use strict';

 angular
   .module('GPSCloud')
   .directive('smsSendBtn', smsSendBtn)

 /** @ngInject */
 function smsSendBtn($timeout, $interval, $window) {

   return {
     restrict: 'AE',
     replace: true,
     scope: {
       sendBtnShow: '=',
       sendBtnStatus: '=',
       sendBtnTime: '=',
       sendDeviceNum: '=',
       btnLabel: '@'
     },

     link: function(scope, element, attrs){

       scope.$watch("sendBtnShow", function (newValue, oldValue) {

         if(scope.sendDeviceNum == $window.sessionStorage.getItem('sendDeviceNum')){

           scope.sendBtnStatus = $window.sessionStorage.getItem('sendBtnStatus') == "true";
           scope.sendBtnTime = $window.sessionStorage.getItem('sendBtnTime');

           if(scope.sendBtnStatus && scope.sendBtnTime>0 ){
             scope.timerCount = scope.sendBtnTime / 1000;

             var counter = $interval(function(){
               scope.timerCount = scope.timerCount - 1;
               $window.sessionStorage["sendBtnTime"] = scope.timerCount*1000;

             }, 1000);

             $timeout(function(){

               $interval.cancel(counter);

               $window.sessionStorage["sendBtnStatus"] = false;
               $window.sessionStorage["sendBtnTime"] = 0;
               scope.sendBtnShow = false;

             }, scope.sendBtnTime);
           }else {

             $window.sessionStorage["sendBtnStatus"] = false;
             $window.sessionStorage["sendBtnTime"] = 0;
             scope.sendBtnShow = false;

           }

         }




       });


     },
     template: '<button ng-disabled="sendBtnStatus"><span ng-if="sendBtnStatus">{{ timerCount }}秒</span><span ng-if="!sendBtnStatus">{{btnLabel}}</span></button>'
   };

 }

})();

