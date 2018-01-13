# GPSCloud前端页面
## 环境搭建
* 安装必要软件git, NodeJs6.0+, chrome
* 把开发环境的ssh公钥设置在代码托管网站的账户下, Linux/Macos的公钥位置~/.ssh/id_rsa.pub
* git clone git@git.coding.net:css1111/GPSCloudWeb.git
* 进入项目目录
  - npm install (使用cnpm 替换npm 使用cnpm install)
  - bower install
* 启动gulp serve
* 推荐开发环境webstorm/sublime

## 其他注意事项
* 测试服务器端口配置在protractor.conf.js

## 发布
* gulp build, 在当前目录生成dist
