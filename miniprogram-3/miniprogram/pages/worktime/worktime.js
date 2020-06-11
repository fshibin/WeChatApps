// miniprogram/pages/worktime/worktime.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    driverName: '',
    driverName0: '', // value in DB
    pnum: '',
    pnums: [],
    lastUsedPnum: '',
    date: '',
    startTime: '',
    stopTime: '',
    startTime0: '', // value in DB
    stopTime0: '', // value in DB
    notes: '',
    pageWidth: 0,
    infoLeft: 0,
    ldVcDone: false,
  },

  inputNotes(e) {
    this.setData({ notes: e.detail.value });
  },

  inputName(e) {
    this.setData({ driverName: e.detail.value });
  },

  changePnum(e) {
    this.setData({ pnum: this.data.pnums[e.detail.value] });
  },

  changeDate(e) {
    this.setData({ date: e.detail.value });
    this.getWorkTime();
  },

  changeStartTime(e) {
    this.setData({ startTime: e.detail.value });
  },

  changeStopTime(e){
    this.setData({ stopTime:e.detail.value});
  },

  formSubmit(e) {
    if (this.data.pnums.length == 0) {
      getApp().showError('没有车辆可选，请联系管理员！\nNo vehicle to select, contact admin!');
      return;
    }
    if (this.data.startTime == '' && this.data.stopTime == '') {
      getApp().showError('必须填写开始时间或结束时间！\nMust input start time or stop time!')
      return;
    } 
    if (this.data.startTime != '' && this.data.stopTime != '' && 
      this.data.startTime.localeCompare(this.data.stopTime) >= 0) {
      getApp().showError('开始时间必须早于结束时间！\nStart time must be earlier than stop time!')
      return;
    }
    let that = this;
    if (that.data.startTime0 != '' && that.data.startTime != '' && that.data.startTime0 != that.data.startTime) {
      wx.showModal({
        title: '您之前已填写过开工时间，是否修改？\nYour recorded start time before, overwrite it?',
        confirmText: '确认Yes',
        cancelText: '取消No',
        mask: true,
        success(res) {
          if (res.confirm) {
            if (that.data.stopTime0 != '' && that.data.stopTime != '' && that.data.stopTime0 != that.data.stopTime) {
              wx.showModal({
                title: '您之前已填写过收工时间，是否修改？\nYour recorded stop time before, overwrite it?',
                confirmText: '确认Yes',
                cancelText: '取消No',
                mask: true,
                success(res) {
                  if (res.confirm) {
                    that.recordWorkTime();
                  }
                }
              })
            } else {
              that.recordWorkTime();
            }
          }
        }
      })
    } else if (that.data.stopTime0 != '' && that.data.stopTime != '' && that.data.stopTime0 != that.data.stopTime) {
      wx.showModal({
        title: '您之前已填写过收工时间，是否修改？\nYour recorded stop time before, overwrite it?',
        confirmText: '确认Yes',
        cancelText: '取消No',
        mask: true,
        success(res) {
          if (res.confirm) {
            that.recordWorkTime();
          }
        }
      })
    } else if (that.data.startTime0 == that.data.startTime && that.data.stopTime0 == that.data.stopTime) {
      getApp().showError('您以前记录过相同的工作时间！\nYou recorded the same work time before!')
    } else {
      that.recordWorkTime();
    }
    // submit now
  },

  recordWorkTime : function() {
    getApp().showLoading('处理中')
    this.updateDriver();
  },

  updateDriver : function() {
    let that = this;
    if (that.data.lastUsedPnum != that.data.pnum) {
      wx.cloud.callFunction({
        name: 'updatedriver',
        data: {
          openId: getApp().globalData.openId,
          pnum: that.data.pnum,
        },
        success: res => {
          if (res.result.stats.updated == 1) {
            that.setData({
              lastUsedPnum: that.data.pnum,
            })
            that.handleWTRecord();
          } else {
            getApp().showError('数据错误1，请联系管理员！\nData error 1, please contact admin!')
          }
        },
        fail: err => {
          getApp().showError('无法更新您的信息！\nUnable to update your data!');
        }
      })
    } else {
      that.handleWTRecord();
    }
  },

  handleWTRecord : function() {
    let that = this;
    if (that.data.startTime0 == '' && that.data.stopTime0 == '') {
      const db = wx.cloud.database()
      db.collection('worktime').add({
        data: {
          driver: that.data.driverName,
          pnum: that.data.pnum,
          date: that.data.date,
          startTime: that.data.startTime,
          stopTime: that.data.stopTime,
          notes: that.data.notes,
        },
        success: function(res) {
          that.setData({
            startTime0: that.data.startTime,
            stopTime0: that.data.stopTime,
          })
          getApp().showSuccess('工时记录添加成功！\nWork time record is added successfully!');
        },
        fail: function(res) {
          getApp().showError('无法添加您的工时信息！\nUnable to insert your work time data!');
        }
      })
    } else {
      wx.cloud.callFunction({
        name: 'updateworktime',
        data: {
          driver: that.data.driverName,
          date: that.data.date,
          pnum: that.data.pnum,
          startTime: that.data.startTime,
          stopTime: that.data.stopTime,
          notes: that.data.notes,
        },
        success: res => {
          if (res.result.stats.updated == 1) {
            that.setData({
              startTime0: that.data.startTime,
              stopTime0: that.data.stopTime,
            })
            getApp().showSuccess('工时记录更新成功！\nWork time record is updated successfully!');
          } else {
            getApp().showError('数据错误2，请联系管理员！\nData error 2, please contact admin!');
          }
        },
        fail: err => {
          getApp().showError('无法更新您的工时信息！\nUnable to update your work time data!');
        }
      })
    }
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
    this.setData({
      driverName: getApp().globalData.driverName,
      driverName0: getApp().globalData.driverName,
      lastUsedPnum: getApp().globalData.lastUsedPnum,
      pnum: getApp().globalData.lastUsedPnum,
      date: dtStr,
      pageWidth: getApp().globalData.pageWidth,
      infoLeft: getApp().globalData.infoLeft,
    });
    this.loadVehicles();
    this.getWorkTime();
  },

  loadVehicles: function() {
    const db = wx.cloud.database()
    db.collection('vehicles').get().then(res => {
      if (res.data.length > 0) {
      var pnums0 = [];
        var i;
        var lastUsedExists = false;
        for (i = 0; i < res.data.length; i++) {
          pnums0.push(res.data[i].pnum);
          if (this.data.lastUsedPnum == res.data[i].pnum) {
            this.setData({pnum: res.data[i].pnum});
            lastUsedExists = true;
          }
        }
        this.setData({
          pnums: pnums0,
        });
        if (!lastUsedExists || this.data.pnum == '') {
          this.setData({
            pnum: res.data[0].pnum,
          })
        }
      } else {
        // no record found
        getApp().showError('没有车辆可选，请联系管理员！ No vehicle to select, please contact admin!');
      }
      this.setData({ldVcDone:true})
    });
  },

  getWorkTime: function() {
    const db = wx.cloud.database()
    db.collection('worktime').where({
      driver: getApp().globalData.driverName,
      date: this.data.date
    }).get().then(res => {
      if (res.data.length > 0) {
        this.setData({
          pnum: res.data[0].pnum,
          startTime: res.data[0].startTime,
          stopTime: res.data[0].stopTime,
          startTime0: res.data[0].startTime,
          stopTime0: res.data[0].stopTime
        });
      } else {
        // no record found
        this.setData({
          startTime0: '',
          stopTime0: '',
          startTime: '',
          stopTime: ''
        });
      }
    });
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