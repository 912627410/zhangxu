(function(){
  'use strict';

  angular
    .module('GPSCloud')
    .controller('rentalOrderFileUploadController',rentalOrderFileUploadController);

  function rentalOrderFileUploadController ($rootScope,$http,$uibModalInstance,$stateParams,$confirm,languages,serviceResource,rentalOrder,rentalAttachInfo,$timeout,$uibModal,DEFAULT_SIZE_PER_PAGE,Upload,RENTANL_ATTACH_UPLOAD_URL,Notification,RENTAL_ATTCHMENT_INFO_URL,RENTANL_ATTACH_DELETE_URL){

    var vm = this;
    vm.userInfo = $rootScope.userInfo;
    vm.selectAll = false;
    vm.rentalOrder = rentalOrder;
    vm.rentalAttachInfo = rentalAttachInfo;
    vm.selected = [];
    vm.pageSize = 8;
    vm.attachList = new Array();

    //获取已上传附件信息
    for(var i = 0; i<rentalAttachInfo.length; i++){
      var restCallURL = RENTAL_ATTCHMENT_INFO_URL;
      restCallURL += '?path='+vm.rentalAttachInfo[i].attachPath;
      var j = 0;
      $http({
        url:restCallURL,
        method:"GET",
        responseType:'arraybuffer'
      }).success(function(data){
        var obj = {path:null,id:null,display:"inline"};
        var blob = new Blob([data],{type:"image/png"});
        obj.path = window.URL.createObjectURL(blob);
        obj.id = vm.rentalAttachInfo[j].id;
        vm.attachList.push(obj)
        j++;
      })
    }
    //附件上传
    vm.fileUpload = function(files){
      var uploadUrl = RENTANL_ATTACH_UPLOAD_URL;
      var id = vm.rentalOrder.id;
      uploadUrl += "?orderId="+id
      if(files!=null){
        angular.forEach(files,function(file){
          file.upload = Upload.upload({
            url:uploadUrl,
            file:file
          });
          file.upload.then(function(response){
              $timeout(function(){
                file.result = response.data;
                if(file.result.code==0){
                  Notification.success("新增附件成功!");
                  $uibModalInstance.close();
                }else{
                  Notification.error(data.message);
                }
              })
            },
            function(reason){
              vm.errorMsg = reason.data.message;
              Notification.error("新增附件失败!");
              Notification.error(vm.errorMsg);
            },function(evt){
            });
        })
      }
    }

    //点击图片时放大显示图片
    vm.changePic = function($event){
      var img = $event.srcElement||$event.target;
      angular.element(document.querySelector('#bigimage'))[0].src = img.src;
      angular.element(document.querySelector('#js-imgview'))[0].style.display = "block";
      angular.element(document.querySelector('#js-imgview-mask'))[0].style.display = "block";
    }
    //点击图片时放小显示图片
    vm.closePic = function(){
      angular.element(document.querySelector('#js-imgview'))[0].style.display = "none";
      angular.element(document.querySelector('#js-imgview-mask'))[0].style.display = "none";
    }

    //关闭弹窗
    vm.cancel = function(){
      $uibModalInstance.dismiss('cancel');
    };

    /**
     * 删除操作
     * @param id
     */
    vm.delete = function(seletedObj){
      $confirm({
        text:languages.findKey('areYouWanttoDeleteIt'),
        title:languages.findKey('deleteConfirmation'),
        ok:languages.findKey('confirm'),
        cancel:languages.findKey('cancel')
      })
        .then(function(){
          var id=seletedObj[0].id
          var rentalAttachVo = {"id":id};
          var restPromise = serviceResource.restUpdateRequest(RENTANL_ATTACH_DELETE_URL,rentalAttachVo)
          restPromise.then(function(data){
            seletedObj[0].display="none"
            Notification.success(languages.findKey('delSuccess'));
          },function(reason){
            Notification.error(languages.findKey('delFail'));
          });
        });
    };


    var updateSelected = function(action,attach){
      if(action=='add'&&vm.selected.indexOf(attach)== -1){
        vm.selected.push(attach);
      }
      if(action=='remove'&&vm.selected.indexOf(attach)!= -1){
        var idx = vm.selected.indexOf(attach);
        vm.selected.splice(idx,1);
      }
      console.log(vm.selected)
    }

    vm.updateSelection = function($event,attach){
      var checkbox = $event.target;
      var action = (checkbox.checked?'add' :'remove');
      updateSelected(action,attach);
    }

    vm.updateAllSelection = function($event){
      var checkbox = $event.target;
      var action = (checkbox.checked?'add' :'remove');

      vm.attachList.forEach(function(attach){
        updateSelected(action,attach);
      })

    }

    vm.isSelected = function(attach){
      return vm.selected.indexOf(attach)>=0;
    }

  }
})();
