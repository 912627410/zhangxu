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
        template:'<div class="nav-title" ng-click="navOpen()" ng-class="navActive"><span class="btn-icon-1" ng-class="iconActive1"></span><span class="btn-icon-2" ng-class="iconActive2"></span><span class="btn-icon-3" ng-class="iconActive3"></span></div>',
        link: function(scope,element,attr,ontroller){
          scope.navOpen = function(){
            if(scope.navOpenStyle !== 'nav-list-open' ){
              scope.navActive = 'nav-active';
              scope.navOpenStyle = 'nav-list-open';
              scope.navOverlay = 'nav-overlay';
              scope.iconActive1 = 'icon-active-1';
              scope.iconActive2 = 'icon-active-2';
              scope.iconActive3 = 'icon-active-3';
              scope.linkActive = 'link-active';
              scope.linkIconActive = 'link-icon-active';
            }else{
              scope.navOpenStyle = '';
              scope.navOverlay = '';
              scope.navActive = '';
              scope.iconActive1 = '';
              scope.iconActive2 = '';
              scope.iconActive3 = '';
              scope.linkActive = '';
              scope.linkIconActive = '';
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
            scope.iconActive1 = '';
            scope.iconActive2 = '';
            scope.iconActive3 = '';
            scope.linkActive = '';
            scope.linkIconActive = '';
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
        template:'<li class="nav-btn-link" ng-repeat="item in navs"><span class="link" ng-class="linkActive">{{item.alias}}</span><i class="link-icon fa {{item.icon}}" ng-class="linkIconActive" aria-hidden="true"></i></li>'
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
