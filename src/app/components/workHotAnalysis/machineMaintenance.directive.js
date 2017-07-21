/**
 * Created by zhenyu on 17-7-10.
 */

(function(){
  'use strict';

  /**
   * @name checkbox
   * @description checkbox container
   */
  angular.module('GPSCloud').directive('checkbox', function(){
    return {
      restrict: 'AE',
      transclude: true,
      replace: true,
      template: '<div class="checkbox check-label" ng-transclude></div>'
    }
  });

  /////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * @name timeline
   * @description main container
   */
  angular.module('GPSCloud').directive('timeline', function(){
    return {
      restrict: 'AE',
      transclude: true,
      template: '<ul id="timeline" class="dragscroll" ng-transclude></ul>'
    }
  });


  /**
   * @name timeline-event
   * @description toggle position
   */
  angular.module('GPSCloud').directive('timelineEvent',function(){
    return {
      restrict: 'AE',
      transclude: true,
      template: '<li class="timeline-event"" ng-class-odd="oddClass" ng-class-even="evenClass" ng-class="hide" ng-transclude></li>',
      link: function(scope,element,attrs){
        scope.oddClass = '';
        scope.evenClass = 'timeline-inverted';
      }
    }
  });


  /**
   * @name timeline-panel
   * @description show event detail
   */
  angular.module('GPSCloud').directive('timelinePanel', function(){
    return {
      require: 'timeline',
      restrict: 'AE',
      transclude: true,
      template: '<div class="timeline-panel" ng-transclude></div>'
    }
  });


  /**
   * @name timeline-icon
   * @description featured icon
   */
  angular.module('GPSCloud').directive('timelineIcon', function(){
    return {
      require: 'timelinePanel',
      restrict: 'AE',
      transclude: true,
      template: '<div class="timeline-icon" ng-transclude></div>'
    }
  });


  /**
   * @name timeline-title
   * @description event title
   */
  angular.module('GPSCloud').directive('timelineTitle', function(){
    return {
      require: 'timelinePanel',
      restrict: 'AE',
      transclude: true,
      template: '<div class="timeline-title" ng-transclude></div>'
    }
  });


  /**
   * @name timeline-time
   * @description event time
   */
  angular.module('GPSCloud').directive('timelineTime', function(){
    return {
      require: 'timelinePanel',
      restrict: 'AE',
      transclude: true,
      template: '<div class="timeline-time" ng-transclude></div>'
    }
  });


  /**
   * @name timeline-content
   * @description event description
   */
  angular.module('GPSCloud').directive('timelineContent', function(){
    return {
      require: 'timelinePanel',
      restrict: 'AE',
      transclude: true,
      template: '<div class="timeline-content" ng-transclude></div>'
    }
  });


})();
