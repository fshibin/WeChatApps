// miniprogram/pages/queryworktime/queryworktime.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    driverName: '',
    startDate: '',
    stopDate: '',
    records: [],
    totalTime: '00:00',
    totalMinutes: 0,
    pageWidth: 0,
    infoLeft: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let now = new Date();
    let m = now.getMonth() + 1;
    let d = now.getDate();
    var dtStr = '' + now.getFullYear() + '-' + (m < 10 ? '0' + m : m) +
      '-' + (d < 10 ? '0' + d : d);

    let dt2 = new Date();
    dt2.setDate(now.getDate() - 30);
    let m2 = dt2.getMonth() + 1;
    let d2 = dt2.getDate();
    var dtStr2 = '' + dt2.getFullYear() + '-' + (m2 < 10 ? '0' + m2 : m2) +
      '-' + (d2 < 10 ? '0' + d2 : d2);
 
    this.setData({
      driverName: getApp().globalData.driverName,
      startDate: dtStr2,
      stopDate: dtStr,
      pageWidth: getApp().globalData.pageWidth,
      infoLeft: getApp().globalData.infoLeft,
    })
  },

  changeStartDate : function(e) {
    this.setData({ startDate: e.detail.value});
  },

  changeStopDate : function(e) {
    this.setData({ stopDate: e.detail.value});
  },

  onQuery: function() {
    getApp().showLoading('处理中')
    wx.cloud.callFunction({
      name: 'queryworktime',
      data: {
        driver: this.data.driverName,
        startDate: this.data.startDate,
        stopDate: this.data.stopDate,
      },
      success: res => {
        var i
        var lines = []
        this.data.totalMinutes = 0;
        for (i = 0; res.result != null && i < res.result.data.length; i++) {
          let item = res.result.data[i];
          let duration = '00:00';
          if (item.startTime && item.stopTime) duration = this.getDuration(item.startTime, item.stopTime);
          let ln = item.date + '|' + (item.startTime ? item.startTime : '??:??') +
            '-' + (item.stopTime ? item.stopTime : '??:??') + '=>' + duration + '|' + item.pnum;
          lines.push(ln);
        }
        let h = parseInt(this.data.totalMinutes / 60); // hours
        let m = this.data.totalMinutes % 60; // minutes
        let tt = '' + (h > 9 ? h : '0' + h) + ':' + (m > 9 ? m : '0' + m);
        this.setData({
          records: lines,
          totalTime: tt,
        });
        wx.hideLoading({
          complete: (res) => {},
        })
      },
    })
  },

  getDuration : function(s1, s2) {
    let d1 = new Date('2000/01/01 ' + s1 + ':00');
    let d2 = new Date('2000/01/01 ' + s2 + ':00');
    let minutes = parseInt((d2.getTime() - d1.getTime()) / 1000 / 60);
    this.data.totalMinutes += minutes;
    let h = parseInt(minutes / 60); // hours
    let m = minutes % 60; // minutes
    let res = '' + (h > 9 ? h : '0' + h) + ':' + (m > 9 ? m : '0' + m);
    return res;
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  }

})