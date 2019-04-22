import Vue from 'vue'
import axios from 'axios'
import base from '../../static/config.json'
import router from '@/router/index.js'
import store from '../vuex/index'

function padLeftZero (str) {
  return ('00' + str).substr(str.length)
}

// 开发使用BASE_PATH_DEV跨域
// axios.defaults.baseURL = base.BASE_PATH_DEV
axios.defaults.withCredentials = true

Vue.prototype.$http = axios
Vue.prototype.$config = base

Vue.prototype.formatDate = function (date, fmt) {
  if (!date) return ''
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
    }
  }
  return fmt
}

Vue.prototype.formatStr = function (str, args) {
  let result = arguments[0]
  let reg = null
  if (arguments.length > 0) {
    if (arguments.length === 2 && typeof (args) === 'object') {
      for (let key in args) {
        if (args[key]) {
          reg = new RegExp('({' + key + '})', 'g')
          result = result.replace(reg, args[key])
        }
      }
    } else {
      for (let i = 1; i < arguments.length; i++) {
        if (arguments[i]) {
          reg = new RegExp('({)' + i + '(})', 'g')
          result = result.replace(reg, arguments[i])
        }
      }
    }
  }
  return result
}

Vue.prototype.formatUrl = function (obj) {
  let urlStr = Object.keys(obj).map(function (key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])
  }).join('&')
  return urlStr
}

Vue.prototype.formatTimeStr = function (str, fmt) {
  if (!str) return '---- --:--:--'
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (str.substring(0, 4)).substr(4 - RegExp.$1.length))
  }
  let o = {
    'M+': str.substring(4, 6),
    'd+': str.substring(6, 8),
    'h+': str.substring(8, 10),
    'm+': str.substring(10, 12),
    's+': str.substring(12, 14)
  }
  for (let k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      let str = o[k] + ''
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
    }
  }
  let pointIndex = str.indexOf('.')
  if (pointIndex > -1) {
    fmt += str.substr(pointIndex)
  }

  return fmt
}

Vue.prototype.formatNumber = function (f, digit) {
  var m = Math.pow(10, digit)
  return Math.round(f * m, 10) / m
}

// Vue.prototype.$http.defaults.headers.common['Authorization'] = 'Bearer' + ' ' + store.state.user.access_token

Vue.prototype.$http.interceptors.request.use(function (response) {
  if (store.state.user.access_token) {
    // 请求头添加token信息
    response.headers.common['Authorization'] = 'Bearer' + ' ' + store.state.user.access_token
  }
  return response
}, function (error) {
  return Promise.reject(error)
})

Vue.prototype.$http.interceptors.response.use(function (response) {
  return response
}, function (error) {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        router.replace({path: 'login'})
        break
      // case 400:
      //   alert(error.response.data.rtnMsg)
      //   break
    }
  }
  // console.log('出错了rrrr！！！', error)
  return Promise.reject(error)
  // return Promise.reject(error.response.status)
})

Vue.prototype.ajaxQueue = []
Vue.prototype.ajaxReq = function (method = 'post', service, action, params, successCallBack, failureCallBack) {
  let me = this
  let m = method.toLowerCase()
  let s = service.toLowerCase()
  let source = axios.CancelToken.source()
  let config = {
    cancelToken: source.token
  }
  /* let config = {
    headers: {
      'X-CSRF-HEADER': 'X-CSRF-TOKEN',
      'X-CSRF-TOKEN': 'ABCDEF',
      'X-CSRF-PARAM': ''
    }
  }  {
  responseType: 'json'
  // withCredentials: true,
  // headers: {'Test': '123'}
} */
  if (s === 'base') {
    me.$http.defaults.baseURL = base.BASE_PATH_DEV
  } else if (s === 'auth') {
    me.$http.defaults.baseURL = base.PAY_PATH_DEV
  } else {
    me.$Message.error({
      content: '请求服务类型有误！',
      duration: 3
    })
  }

  let arg = [action]
  if (m === 'get' || m === 'delete') {
    arg.push(config)
  } else {
    arg.push(params, config)
  }
  me.ajaxQueue.push(source)
  return this.$http[m](...arg)
    .then(function (response) {
      let data = response.data
      if (data['rtnCode'] === '0000') {
        if (successCallBack) {
          successCallBack.call(me, data)
        }
        if (data['rtnCode'] === '-9997') {
          me.$Message.info('没有访问权限')
        }
      } else {
        console.warn('业务报错', arg, data)
        // me.$Message.warning('操作失败')
        // me.$Message.error({
        //   // content: data['rtnMsg'],
        //   content: data['rtnMsg'],
        //   duration: 3
        // })
        // if (data['rtnCode'] === '-7958') {
        //   me.ajaxQueue.forEach(function (a) {
        //     a.cancel()
        //   })
        //   me.ajaxQueue = []
        //
        //   setTimeout(function () {
        //     router.replace('/login')
        //   }, 2000)
        //   return
        // }

        if (failureCallBack) {
          failureCallBack.call(me, data)
        }
      }

      let sIndex = me.ajaxQueue.findIndex(function (a) {
        return a === source
      })

      if (sIndex > -1) {
        me.ajaxQueue.splice(sIndex, 1)
      }
    }, function (response) {
      if (axios.isCancel(response)) {
        console.log('请求被取消')
        return
      }
      console.info('请求未成功', arguments)
      me.ajaxQueue.forEach(function (a) {
        a.cancel()
      })
      me.ajaxQueue = []
      // me.$Message.error({
      //   content: '请求未成功',
      //   duration: 3
      // })
      if (failureCallBack) {
        failureCallBack.apply(me, null, arguments)
      }
    })
    .catch(function () {
      console.info('请求未发送异常', arguments)
      // me.$Message.error({
      //   content: '请求未发送成功',
      //   duration: 3
      // })
      if (failureCallBack) {
        failureCallBack.apply(me, null, arguments)
      }

      let sIndex = me.ajaxQueue.findIndex(function (a) {
        return a === source
      })

      if (sIndex > -1) {
        me.ajaxQueue.splice(sIndex, 1)
      }
    })
}
