import Vue from 'vue'

// 当日和昨日
Vue.prototype.formatSameDay = function (year, month, day) {
  let start = new Date(year, month, day, '00', '00', '00')
  let end = new Date(year, month, day, 23, 59, 59)
  return [start, end]
}
// 本周
Vue.prototype.formatSameWeek = function (timStart = 'yyyy,MM,dd 00:00:00', timEnd = 'yyyy,MM,dd 23:59:59') {
  let day = new Date()
  let num = day.getDay() - 1
  day.setDate(day.getDate() - num)
  let str = this.formatDate(day, timStart)
  day.setDate(day.getDate() + 6)
  let str1 = this.formatDate(day, timEnd)
  let start = new Date(str)
  let end = new Date(str1)
  return [start, end]
}
// 本月
Vue.prototype.formatSameMonth = function (timStart = 'yyyy,MM,dd 00:00:00', timEnd = 'yyyy,MM,dd 23:59:59') {
  let curMonth = new Date()
  curMonth.setDate(1)
  let str = this.formatDate(curMonth, timStart)
  curMonth.setMonth(curMonth.getMonth() + 1)
  curMonth.setDate(curMonth.getDate() - 1)
  let str1 = this.formatDate(curMonth, timEnd)
  let start = new Date(str)
  let end = new Date(str1)
  return [start, end]
}
// 上周
Vue.prototype.formatLastWeek = function (timStart = 'yyyy,MM,dd 00:00:00', timEnd = 'yyyy,MM,dd 23:59:59') {
  let date = new Date()
  let month = date.getMonth()
  let day = date.getDate()
  let nowWeek = date.getDay()
  let nowYear = date.getYear()
  nowYear += (nowYear < 2000) ? 1900 : 0
  let weekStartDate = new Date(nowYear, month, day - nowWeek - 6)
  let str = this.formatDate(weekStartDate, timStart)
  let weekEndDate = new Date(nowYear, month, day - nowWeek)
  let str1 = this.formatDate(weekEndDate, timEnd)
  let start = new Date(str)
  let end = new Date(str1)
  return [start, end]
}
function getMonthDays (myMonth) {
  let now = new Date()
  let nowYear = now.getYear()
  nowYear += (nowYear < 2000) ? 1900 : 0
  var monthStartDate = new Date(nowYear, myMonth, 1)
  var monthEndDate = new Date(nowYear, myMonth + 1, 1)
  var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24)
  return days
}

// 上月
Vue.prototype.formatLastMonth = function (timStart = 'yyyy,MM,dd 00:00:00', timEnd = 'yyyy,MM,dd 23:59:59') {
  let now = new Date()
  let nowYear = now.getYear()
  nowYear += (nowYear < 2000) ? 1900 : 0
  let lastMonthDate = new Date()
  lastMonthDate.setDate(1)
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1)
  let lastMonth = lastMonthDate.getMonth()
  let lastMonthStartDate = new Date(nowYear, lastMonth, 1)
  let str = this.formatDate(lastMonthStartDate, timStart)
  var lastMonthEndDate = new Date(nowYear, lastMonth, getMonthDays(lastMonth))
  let str1 = this.formatDate(lastMonthEndDate, timEnd)
  let start = new Date(str)
  let end = new Date(str1)
  return [start, end]
}
