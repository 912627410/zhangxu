(function(){
  'use strict';


  /**
   * nav
   */
  angular.module('GPSCloud')
    .directive('navBtn',function navBtn(){
      return {
        restrict: 'AE',
        replace: true,
        transclude: true,
        template:'<div class="nav-container" ng-transclude></div>'
      }

    });

  /**
   * nav title
   */
  angular.module('GPSCloud')
    .directive('navTitle',function navTitle(){
      return {
        restrict: 'AE',
        replace: true,
        transclude: true,
        template:'<div class="nav-title" ng-click="navOpen()" ng-class="navActive" ng-transclude></div>',
        link: function(scope,element,attr,ontroller){
          scope.navOpen = function(){
            if(scope.navOpenStyle !== 'nav-list-open' ){
              scope.navActive = 'nav-active';
              scope.navOpenStyle = 'nav-list-open';
              scope.navOverlay = 'nav-overlay';
            }else{
              scope.navOpenStyle = '';
              scope.navOverlay = '';
              scope.navActive = '';
            }

          }
        }
      }

    });


  /**
   * navList
   */
  angular.module('GPSCloud')
    .directive('navList',function navList(){
      return {
        restrict: 'AE',
        replace: true,
        transclude: true,
        template:'<ul class="nav-list" ng-click="navClick()" ng-class="navOpenStyle" ng-transclude></ul>',
        link: function(scope,element,attr,ontroller){
          scope.navClick = function(){
            scope.navOpenStyle = '';
            scope.navOverlay = '';
            scope.navActive = '';
          }
        }
      }

    });

  /**
   * navItem
   */
  angular.module('GPSCloud')
    .directive('navItem',function navItem(){
      return {
        restrict: 'AE',
        replace: true,
        transclude: true,
        template:'<li class="nav-btn-link" ng-repeat="item in navs">{{item}}<i class="fa fa-bus" aria-hidden="true"></i></li>'
      }

    });

  /**
   * nav background
   */
  angular.module('GPSCloud')
    .directive('navOverlay',function navOverlay(){
      return {
        restrict: 'AE',
        replace: true,
        transclude: true,
        template:'<div ng-class="navOverlay"></div>'
      }

    });


}());
