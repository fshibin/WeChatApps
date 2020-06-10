// miniprogram/pages/querysiteuse/querysiteuse.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageWidth: 0,
    infoLeft: 0,
    drivers: [],
    driversSelected: [],
    driver: '',
    startDate: '',
    stopDate: '',
    pnums: [],
    pnumsSelected: [],
    pnum: '',
    sites: [],
    sitesSelected: [],
    site: '',
    startTime: '',
    stopTime: '',
    records: [],
    totalTime: '00:00',
    totalMinutes: 0,
    ldDvDone: false,
    ldStDone: false,
    ldVcDone: false,
  },

  changeStartDate : function(e) {
    this.setData({ startDate: e.detail.value});
  },

  changeStopDate : function(e) {
    this.setData({ stopDate: e.detail.value});
  },

  changeStartTime : function(e) {
    this.setData({ startTime: e.detail.value});
  },

  changeStopTime : function(e) {
    this.setData({ stopTime: e.detail.value});
  },

  onCheckboxChangeDriver: function(e) {
    var idx = e.target.dataset.checkid;
    if (e.detail.value.length == 1) {
      this.data.driversSelected[idx] = true;
    } else {
      this.data.driversSelected[idx] = false;
    }
  },

  onCheckboxChangePnum: function(e) {
    var idx = e.target.dataset.checkid;
    if (e.detail.value.length == 1) {
      this.data.pnumsSelected[idx] = true;
    } else {
      this.data.pnumsSelected[idx] = false;
    }
  },

  changeSite(e) {
    this.setData({ site: this.data.sites[e.detail.value]});
  },

  onCheckboxChangeSite: function(e) {
    var idx = e.target.dataset.checkid;
    if (e.detail.value.length == 1) {
      this.data.sitesSelected[idx] = true;
    } else {
      this.data.sitesSelected[idx] = false;
    }
  },

  loadDrivers: function() {
    const db = wx.cloud.database()
    db.collection('drivers').get().then(res => {
      if (res.data.length > 0) {
      var drivers0 = [];
        var i;
        for (i = 0; i < res.data.length; i++) {
          drivers0.push(res.data[i].name);
        }
        this.setData({
          drivers: drivers0,
          driver: res.data[0].name,
        });
      } else {
        // no record found
        getApp().showError('没有司机可选！\nNo driver to select!');
      }
      this.setData({ldDvDone: true});
    });
  },

  loadSites: function() {
    wx.cloud.callFunction({
      name: 'loadsites',
      data: {
      },
      success: res => {
        if (res.result != null && res.result.data.length > 0) {
          var sites0 = [];
          var i;
          for (i = 0; i < res.result.data.length; i++) {
            sites0.push(res.result.data[i].addr);
            if (this.data.lastUsedSite == res.result.data[i].addr) {
              this.setData({site: res.result.data[i].addr});
            }
          }
          if (this.data.site == '') {
            this.setData({
              site: res.result.data[0].addr,
            })
          }
          this.setData({
            sites: sites0,
          });
        } else {
          // no record found
          getApp().showError('没有工作地址可选！\nNo job address to select!');
        }
        this.setData({ldStDone: true});
      },
      fail: err => {
        getApp().showError('获取工地列表时发生错误！\nError occured when getting site list!');
        this.setData({ldStDone: true});
      }
    });
  },

  loadVehicles: function() {
    const db = wx.cloud.database()
    db.collection('vehicles').where({
    }).get().then(res => {
      if (res.data.length > 0) {
        var pnums0 = [];
        var i;
        for (i = 0; i < res.data.length; i++) {
          pnums0.push(res.data[i].pnum);
          this.data.driversSelected.push(false);
        }
        this.setData({
          pnums: pnums0,
        });
        if (this.data.pnum == '') {
          this.setData({
            pnum: res.data[0].pnum,
          })
        }
      } else {
        // no record found
        getApp().showError('没有车辆可选，请联系管理员！\nNo vehicle to select, contact admin!');
      }
      this.setData({ldVcDone: true});
    });
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
      pageWidth: getApp().globalData.pageWidth,
      infoLeft: getApp().globalData.infoLeft,
      startDate: dtStr2,
      stopDate: dtStr,
      startTime: '00:00',
      stopTime: '23:59',
    });
    this.loadDrivers();
    this.loadVehicles();
    this.loadSites();
  },

  onQuery: function() {
    getApp().showLoading('处理中')
    let that = this;
    that.setData({records:[]});
    var i;
    var drivers = [];
    for (i = 0; i < that.data.drivers.length; i++) {
      if (that.data.driversSelected[i]) drivers.push(that.data.drivers[i]);
    }
    var pnums = [];
    for (i = 0; i < that.data.pnums.length; i++) {
      if (that.data.pnumsSelected[i]) pnums.push(that.data.pnums[i]);
    }
    var sites = [];
    //for (i = 0; i < that.data.sites.length; i++) {
    //  if (that.data.sitesSelected[i]) sites.push(that.data.sites[i]);
    //}
    sites.push(that.data.site);
    wx.cloud.callFunction({
      name: 'querysiteuse',
      data: {
        drivers: drivers,
        startDate: that.data.startDate,
        stopDate: that.data.stopDate,
        pnums: pnums,
        sites: sites,
        startTime: that.data.startTime,
        stopTime: that.data.stopTime,
      },
      success: res => {
        if (res.result != null && res.result.data.length > 0) {
          var i;
          var line;
          var lines = [];
          this.data.totalMinutes = 0;
          for (i = 0; i < res.result.data.length; i++) {
            let item = res.result.data[i];
            let duration = '00:00';
            if (item.startTime && item.stopTime) duration = this.getDuration(item.startTime, item.stopTime);
            line = item.date + '|' + item.startTime + '-' + item.stopTime + '=>' + duration;
            lines.push(line);
            line = '　' + item.pnum + '|' + item.driver;
            lines.push(line);
            line = '　' + item.goods + '|' + item.quarry + '|' + item.notes;
            lines.push(line);
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
        } else {
          getApp().showError('没有找到任何符合条件的记录！\nNo records found satisfying query criteria!');
        }
      },
      fail: err => {
        getApp().showError('查询失败！query failed!');
      }
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