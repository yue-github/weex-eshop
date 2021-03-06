var stream;
__weex_define__('@weex-temp/x', function(__weex_require__) {
    stream = __weex_require__('@weex-module/stream');
});

var storage;
__weex_define__('@weex-temp/x', function(__weex_require__) {
    storage = __weex_require__('@weex-module/storage');
});

var modal;
__weex_define__('@weex-temp/x', function(__weex_require__) {
    modal = __weex_require__('@weex-module/modal');
});
var data = {
//  host:'192.168.1.140/loyee-webapp',
  // host:'mobile.eebin.com',
//   server: '192.168.1.140:8080/by-eshop'
  // server: 'eshop.bayou-tech.cn/loyee-eshop'
}
 
// var data = {
//     host:'eshop.bayou-tech.cn/loyee-eshop-wx',
//     server: 'eshop.bayou-tech.cn/loyee-eshop'
// }

var data = {
    // host:'mobile.eebin.com',
    // host: 'eshop-webapp.bayou-tech.cn',
    // host: 'localhost:7777/loyee-webapp',
    host: 'loyee.coral3.com/loyee-webapp',
    // host: '192.168.31.70/loyee-webapp',
    // host: 'service.eebin.com/eshop-webapp',
    // host: '120.25.237.243:8080/bay-eshop-webapp',
    // host: '39.106.26.67:8080/eshop-webapp',
    server: 'loyee.coral3.com'
    // server: 'localhost:8765'
    // server: '192.168.1.115:8080/eshop'
    // server: '120.25.237.243:8080/bay-eshop'
    // server: 'service.eebin.com'
    // server: '192.168.31.96:8080'
    // server: 'eshop.bayou-tech.cn/eshop'
 	  // server: '39.106.26.67:8080/eshop'
}

function pop(self) {
    var params = {
      'animated' : 'true',
    }
    self.$call('navigator','pop',params, function () {});
}

//客户端 baseUrl
function getBaseUrl() {
  return 'https://' + data.host + '/';
}

//服务端 baseUrl
function getServerBaseUrl() {
  return 'https://' + data.server + '/';
}

//图片 baseUrl
function getImageBaseUrl() {
  return getServerBaseUrl();
}

//先提示再跳转
function toast(options, callback) {
  modal.toast(options);
  if(callback) {
    setTimeout(callback, options.duration * 1000);
  }
}

function getAbsolutePath(path) {
  if (!path) {
    return path;
  }
  if (path.indexOf('http://') >= 0 || path.indexOf('https://') >= 0) {
    return path;
  } else {
    return "http://" + data.server + "/" + path;
  }
}


//tabbar baseUrl
function getTabbarBaseUrl(self) {
  var bundleUrl = self.$getConfig().bundleUrl;

  var nativeBase = 'file://assets/';
  var isAndroidAssets = bundleUrl.indexOf('your_current_IP')>=0 || bundleUrl.indexOf('file://assets/')>=0;
  var isiOSAssets = bundleUrl.indexOf('file:///') >= 0 && bundleUrl.indexOf('WeexDemo.app') > 0;
  if (isAndroidAssets) {
    nativeBase = 'file://assets/';
  } else if (isiOSAssets) {
    nativeBase = bundleUrl.substring(0, bundleUrl.lastIndexOf('/') + 1);
  } else {
    var host = data.host;
    nativeBase = 'https://' + host + '/dist/';
  }

  return nativeBase; 
}


function getAppBaseUrl(self) {
  var bundleUrl = self.$getConfig().bundleUrl;
         
  var nativeBase = 'file://assets/';
  var isAndroidAssets = bundleUrl.indexOf('your_current_IP')>=0 || bundleUrl.indexOf('file://assets/')>=0;
  var isiOSAssets = bundleUrl.indexOf('file:///') >= 0 && bundleUrl.indexOf('WeexDemo.app') > 0;
  if (isAndroidAssets) {
    nativeBase = 'file://assets/';
  } else if (isiOSAssets) {
    nativeBase = bundleUrl.substring(0, bundleUrl.lastIndexOf('/') + 1);
  } else {
    var host = data.host;
    nativeBase = 'http://' + host + '/dist/';
  }

  var base = nativeBase;
  //H5端
  if (typeof window === 'object') {
    base = './index.html?page=./dist/';
  }
  console.log('-----');
  console.log(base);
  return base;
}

//get url's parameter by name ,better getUrlParam
function getParameterByName(name, url) {
    name = name.replace(/[\[\]]/g, "\\$&")
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url)
    if (!results) return null
    if (!results[2]) return ''
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function isLogined(callback) {
  storage.getItem('token', function(e) {
    if(callback) {
      callback(e.data);
    }
  });
}

//获取URL参数
var getQueryString = function (name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r !== null) {
        return decodeURI(r[2]);
    }
    return null;
};

var formatParam = function(obj) {
    var vJson = "";     
    for(var name in obj){
      if(obj[name] != undefined && obj[name] != null && obj[name] != "")
       vJson += name+"="+obj[name]+"&";  
    }
    return vJson.substring(0,vJson.length-1);
  };

function fetch(self, options, process, progress){
  if(!options.body) {
    options.body = {};
  }
  storage.getItem('token', function(e) {
    if(e.data && e.data != 'undefined') {
      options.body.token = e.data;
    }
    if(!isIosPlatform(self) && !isAndroidPlatform(self)) {
      var code = getQueryString('code');
      if(code) {
        options.body.code = code;
      } else {
        options.body.redirectURI = window.location.href;
      }
    }


    
    options.body = formatParam(options.body);

    if(options.method == "post") {
      options.method = "POST";
    }
    
    if(isAndroidPlatform(self)) {
      //安卓手机进入
      stream.sendHttp(options, function(ret) {
        var response = JSON.parse(ret);
        if(response.error == 3) {
          self.$openURL(getAppBaseUrl(self) + 'login.js');
          return;
        }

         if(process) {
            
            process({data: response});
          }
      });
    } else if(isIosPlatform(self)){
      //苹果手机进入
      stream.sendHttp(options, function(ret) {
        var response = JSON.parse(ret);
        if(response.error == 3) {
          self.$openURL(getAppBaseUrl(self) + 'login.js');
          return;
        }

          if(process) {
            process({data: response});
          }
      });
    }else {
      //非手机进入
      options.headers = {'Content-Type':'application/x-www-form-urlencoded'};

      
      stream.fetch(options, function(response) {
        // if(response.data && response.data.error == 3) {
        //    storage.removeItem("token", function(e) {
        //       if(response.data.authUrl) {
        //         redirectURI = window.location.href;
        //         window.location.href = response.data.authUrl;
        //       }else{
        //        self.$openURL(getAppBaseUrl(self) + 'login.js');
        //         return;
        //       }
        //     });
        // }

        if(response.data && response.data.error == 0 && response.data.token) {
          storage.setItem("token", response.data.token, function(e) {});
        }

        if(process){
          process(response);
        }
      },function(response){
        if(progress) {
          process(response);
        }
      });

    }
    
  });
}

function getRealHeight(self, h) {
  var serverWidth = self.$getConfig().env.deviceWidth;
  return (h*serverWidth)/750;
}


//制保留2位小数，如：2，会在2后面补上00.即2.00    
function toDecimal2(x) {  
    var x=x*1;  
    return parseFloat(x).toFixed(2);    
}  

function isIosPlatform(self) {
    var platform = self.$getConfig().env.platform
    return platform === "iOS";
}


function isAndroidPlatform(self) {
    var platform = self.$getConfig().env.platform
    return platform === "android";
}

function isWebPlatform(self) {
  var platform = self.$getConfig().env.platform;
  return platform === "Web";
}



exports.data = data
exports.getBaseUrl = getBaseUrl
exports.getImageBaseUrl = getImageBaseUrl
exports.getTabbarBaseUrl = getTabbarBaseUrl
exports.getAppBaseUrl = getAppBaseUrl
exports.getParameterByName = getParameterByName
exports.getServerBaseUrl = getServerBaseUrl
exports.isLogined = isLogined
exports.fetch = fetch
exports.pop = pop
exports.getRealHeight = getRealHeight
exports.toDecimal2 = toDecimal2
exports.isWebPlatform = isWebPlatform
exports.isIosPlatform = isIosPlatform
exports.isAndroidPlatform = isAndroidPlatform
exports.toast = toast
exports.getAbsolutePath = getAbsolutePath
