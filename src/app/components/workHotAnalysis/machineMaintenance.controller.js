/**
 * Created by zhenyu on 17-7-4.
 */

(function(){
  'use strict';

  angular.module('GPSCloud')
    .controller('machineMaintenanceController',machineMaintenanceController);

  function machineMaintenanceController($scope){

    var typeArray = typeArray || [];
    console.log(typeArray);

    $scope.checked = true;
    $scope.click = function(){
      console.log('do something...');
    };
    $scope.items = [
      {type: '车辆下线日期', title: '第1次维修保养', time: '20171221', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮'},
      {type: '运抵经销商处', title: '第2次维修保养', time: '10170921', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {type: '销售日期', title: '第3次维修保养', time: '20170221', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮'},
      {type: '运抵经销商处', title: '第4次维修保养', time: '20171121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {type: '车辆下线日期', title: '第5次维修保养', time: '20171121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {type: '销售日期', title: '第6次维修保养', time: '20170921', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮'},
      {type: '保养事件', title: '第7次维修保养', time: '20170821', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {type: '车辆下线日期', title: '第8次维修保养', time: '20170721', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {type: '车辆下线日期', title: '第9次维修保养', time: '20170621', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {type: '维修事件', title: '第10次维修保养', time: '20170521', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {type: '车辆下线日期', title: '第一次维修保养', time: '20160121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎'},
      {type: '运抵经销商处', title: '第一次维修保养', time: '20160121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {type: '车辆下线日期', title: '第一次维修保养', time: '20160121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎'},
      {type: '保养事件', title: '第一次维修保养', time: '20160121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'},
      {type: '维修事件', title: '第一次维修保养', time: '20160121', area: '山东纳百川', status:'良好', description:'轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎轮胎'}];
    $scope.events = [
      {type: 'b',title:'123',time:'2017-03-22',content:'balabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'b',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'b',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'b',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'},
      {type: 'a',title:'123',time:'2017-03-22',content:'balabalabala'}
    ];
    $scope.typeArray = function(){
      var temp = uniqueEvent();
      temp.sort();
      var res = [temp[0]];
      for(var i = 1, length = temp.length; i < length; i++) {
        if (temp[i] !== res[res.length - 1]) {
          res.push(temp[i]);
        }
      }
      return res;
    };
    $scope.filter = function(type){
      console.log(type);
      for(var i=0,length=typeArray.length;i<length;i++){
        if(typeArray[i] == type){
          typeArray[i] = '';
        }
      }
    };

    //list unique event type
    function uniqueEvent(){
      for(var i=0,length=$scope.items.length;i<length;i++){
        typeArray[i] = $scope.items[i].type;
      }
      return typeArray;
    }

    //鼠标拖拽
    window.addEventListener("load", function() {
      var addEventListener = 'addEventListener';
      var elems = document.getElementsByClassName('dragscroll');
      for (var i = 0; i < elems.length;) {
        (function(elem, lastClientX, lastClientY, pushed) {
          elem[addEventListener]('mousedown', function(e) {
            pushed = 1;
            lastClientX = e.clientX;
            lastClientY = e.clientY;

            //点击时,通知浏览器不要执行与事件关联的默认动作,不再派发事件
            e.preventDefault();
            e.stopPropagation();
          }, 0);

          window[addEventListener]('mousemove', function(e) {
            if (pushed) {
              elem.scrollLeft -=
                (- lastClientX + (lastClientX=e.clientX));
              elem.scrollTop -=
                (- lastClientY + (lastClientY=e.clientY));
            }
          }, 0);

          window[addEventListener]('mouseup', function(){
            pushed = 0;
          }, 0);

        })(elems[i++]);
      }
    }, 0);
    (function (root, factory) {
      if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
      } else if (typeof exports !== 'undefined') {
        factory(exports);
      } else {
        factory((root.dragscroll = {}));
      }
    }(this, function (exports) {
      var _window = window;
      var mousemove = 'mousemove';
      var mouseup = 'mouseup';
      var mousedown = 'mousedown';
      var addEventListener = 'addEventListener';
      var removeEventListener = 'removeEventListener';

      var dragged = [];
      var reset = function(i, el) {
        for (i = 0; i < dragged.length;) {
          el = dragged[i++];
          el[removeEventListener](mousedown, el.md, 0);
          _window[removeEventListener](mouseup, el.mu, 0);
          _window[removeEventListener](mousemove, el.mm, 0);
        }

        dragged = document.getElementsByClassName('dragscroll');
        for (i = 0; i < dragged.length;) {
          (function(el, lastClientX, lastClientY, pushed){
            el[addEventListener](
              mousedown,
              el.md = function(e) {
                pushed = 1;
                lastClientX = e.clientX;
                lastClientY = e.clientY;

                e.preventDefault();
                e.stopPropagation();
              }, 0
            );

            _window[addEventListener](
              mouseup, el.mu = function() {pushed = 0;}, 0
            );

            _window[addEventListener](
              mousemove,
              el.mm = function(e, scroller) {
                scroller = el.scroller||el;
                if (pushed) {
                  scroller.scrollLeft -=
                    (- lastClientX + (lastClientX=e.clientX));
                  scroller.scrollTop -=
                    (- lastClientY + (lastClientY=e.clientY));
                }
              }, 0
            );
          })(dragged[i++]);
        }
      };


      if (document.readyState == "complete") {
        reset();
      } else {
        _window[addEventListener]("load", reset, 0);
      }

      exports.reset = reset;
    }));


  }

})();
