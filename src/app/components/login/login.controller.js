/**
 * Created by shuangshan on 16/1/2.
 */
(function() {
  'use strict';

  angular
    .module('GPSCloud')
    .controller('LoginController', LoginController);



  /** @ngInject */
  function LoginController($rootScope,$http, $window,ORG_TREE_JSON_DATA_URL,SYS_CONFIG_URL,Notification,serviceResource,Idle,languages) {
    var vm = this;
    var userInfo;
    var rootParent={id:0}; //默认根节点为0

    //通过后台返回的结构生成json tree
    vm.unflatten=function( array, parent, tree ){
      tree = typeof tree !== 'undefined' ? tree : [];
      parent = typeof parent !== 'undefined' ? parent : { id: 0 };
     // parent = typeof parent !== 'undefined' ? parent : rootParent;
      //alert("parent.id==="+parent.id);
      //    alert(root.id);

      //alert("0.222=="+parent.id);

      //if(parent.id==rootParent.id){
      //  parent.id=0;
      //}


      var children = _.filter( array, function(child) {
        return child.parentId == parent.id;
      });

      // alert("parent.id=="+parent.id);

      if( !_.isEmpty( children )  ){
        //alert("1.children.tree=="+JSON.stringify(children));
        //alert("2.parent.id =="+parent.id );
        //判断是否是根节点
       // if( parent.id == rootParent.id ){
        if( parent.id == 0){
          //alert("3.rootParent.id =="+rootParent.id );
          //alert("4.rootParent.tree=="+JSON.stringify(children));
          tree = children;

        }else{
          parent['children'] = children
         // alert("5. tree=="+JSON.stringify(children));
        }
        _.each( children, function( child ){ vm.unflatten( array, child,null ) } );
      }


      //alert("tree="+tree);
      return tree;
    };



    vm.loginMe = function(){
      var rspPromise = serviceResource.authenticate(vm.credentials);
      rspPromise.then(function(data){
        var userInfo = {
          authtoken: data.authtoken,
          userdto: data.userinfo
        };

        $rootScope.userInfo = userInfo;
        $window.sessionStorage["userInfo"] = JSON.stringify(userInfo);
        Notification.success(languages.findKey('loginSuccess'));
        //监控用户登录超时
        Idle.watch();
        //读取组织结构信息
        var rspData = serviceResource.restCallService(ORG_TREE_JSON_DATA_URL,"QUERY");
        rspData.then(function(data){
          //判断树形菜单的根节点,默认为0,然后根据用户的组织来进行更新
          var orgParent=rootParent;
          if(null!=userInfo.userdto.organizationDto){
            orgParent.id=userInfo.userdto.organizationDto.id;
            rootParent.id=orgParent.id;

            //userInfo.userdto.organizationDto.parentId=0;
          }

          //TODO生成树的方法,要求根的父节点必须为0才可以,临时这么写,后续需要优化
          var list=data;
          for(var i=0;i<list.length;i++){
            if(list[i].id==rootParent.id){
            //  alert("1=="+list[i].parentId);
              list[i].parentId=0;
             // alert("2=="+list[i].parentId);
              break;
            }
          }

         // alert("orgParent.id==="+orgParent.id);
          $rootScope.orgChart = vm.unflatten(list);

          $window.sessionStorage["orgChart"] = JSON.stringify($rootScope.orgChart);
        },function(reason){
          Notification.error(languages.findKey('failedToGetOrganizationInformation'));
        });
        //读取未处理的提醒消息
        var notificationPromis = serviceResource.queryNotification(0, null,null,"processStatus=0");
        notificationPromis.then(function (data) {
            $rootScope.notificationNumber = data.page.totalElements;
            $window.sessionStorage["notificationNumber"] = $rootScope.notificationNumber;
          }, function (reason) {
            Notification.error(languages.findKey('failedToGetRemindInformation'));
          }
        );

        //读取未处理的地理位置报警消息
        var locationNotificationPromis = serviceResource.queryNotification(0, null,null,"processStatus=0&type=03");
        locationNotificationPromis.then(function (data) {
            vm.locationNotificationNumber = data.page.totalElements;
            if (vm.locationNotificationNumber > 1){
              Notification.error({message : languages.findKey('moreInvalidLocationRemindInformation'),delay: true});
            }
            if (vm.locationNotificationNumber == 1){
              Notification.error({message : data.content[0].content,delay: true});
            }
            $window.sessionStorage["locationNotificationNumber"] = vm.locationNotificationNumber;
          }, function (reason) {
            Notification.error(languages.findKey('failedToGetRemindInformation'));
          }
        );

        //读取小挖型号参数
        var smallExcavatorURL = SYS_CONFIG_URL + "?name=SMALL_EXCAVATOR_MODEL";
        var smallExcavatorPromis = serviceResource.restCallService(smallExcavatorURL,"GET");
        smallExcavatorPromis.then(function (data) {
            $window.sessionStorage["SMALL_EXCAVATOR_MODEL"] = data.value;
            $rootScope.SMALL_EXCAVATOR_MODEL = data.value;
          }, function (reason) {
            Notification.error(languages.findKey('failedToGetSmallExcavatorModel'));
          }
        );

        //加载故障代码描述对照表(小挖)
        $http.get('warningDtc.json').success(function(data){
          $rootScope.warningDataDtc=data;
          $window.sessionStorage["warningDataDtc"]=JSON.stringify(data);

        });


        $rootScope.$state.go('home');
      },function(reason){
        $rootScope.userInfo = null;
        $window.sessionStorage["userInfo"] = null;
        Notification.error(languages.findKey('loginFailure'));
      });
    };

  }
})();
