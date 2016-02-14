/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .directive('presentationHref',presentationHref)

  /** @ngInject */
    function presentationHref(permissions) {
      return {
         restrict:'A',
         link:function($scope,iElm,iAttrs,controller){
           var hrefs=iAttrs.presentationHref.split(".");
           if (hrefs[0]=="home"){
             hrefs.splice(0,1);
           }
           hrefs=hrefs.join(":");

          // alert(hrefs);

         //  alert("22"+permissions.getPermissions(hrefs));
        //   alert(permissions.getAll());
           !permissions.getPermissions(hrefs)&&iElm.remove();

         }
      }
    }

})();
