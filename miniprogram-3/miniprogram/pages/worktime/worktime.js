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
    console.log('start=' + this.data.startTime);
    console.log('start0=' + this.data.startTime0);
    console.log('stop=' + this.data.stopTime);
    console.log('stop0=' + this.data.stopTime0);
    if (this.data.driverName == '') {
      wx.showToast({
        icon: "none",
        title: '没有输入名字！Name is not entered!',
        duration: 3000
      })
      return;
    }
    if (this.data.pnums.length == 0) {
      wx.showToast({
        icon: "none",
        title: '没有车辆可选，请联系管理员！ No vehicle to select, contact admin!',
        duration: 3000
      })
      return;
    }
    if (this.data.startTime == '' && this.data.stopTime == '') {
      wx.showToast({
        icon: "none",
        title: '必须填写开始时间或结束时间！Must input start time or stop time!',
        duration: 3000
      })
      return;
    } 
    if (this.data.startTime != '' && this.data.stopTime != '' && 
      this.data.startTime.localeCompare(this.data.stopTime) >= 0) {
      wx.showToast({
        icon: "none",
        title: '开始时间必须早于结束时间！Start time must be earlier than stop time!',
        duration: 3000
      })
      return;
    }
    let that = this;
    if (that.data.driverName0 == '') {
      wx.showModal({
        title: '您是首次使用，名字确认后不能修改，是否继续？ It\'s your first time using; your name cann\'t be changed once confirmed. Continue?',
        confirmText: '确认Yes',
        cancelText: '取消No',
        success(res) {
          if (res.confirm) {
            if (that.data.startTime0 != '' && that.data.startTime != '' && that.data.startTime0 != that.data.startTime) {
              wx.showModal({
                title: '您之前已填写过开工时间，是否修改？ Your recorded your start time before, overwrite it?',
                confirmText: '确认Yes',
                cancelText: '取消No',
                success(res) {
                  if (res.confirm) {
                    if (that.data.stopTime0 != '' && that.data.stopTime != '' && that.data.stopTime0 != that.data.stopTime) {
                      wx.showModal({
                        title: '您之前已填写过收工时间，是否修改？ Your recorded stop time before, overwrite it?',
                        confirmText: '确认Yes',
                        cancelText: '取消No',
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
                title: '您之前已填写过收工时间，是否修改？ Your recorded stop time before, overwrite it?',
                confirmText: '确认Yes',
                cancelText: '取消No',
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
    } else if (that.data.startTime0 != '' && that.data.startTime != '' && that.data.startTime0 != that.data.startTime) {
      wx.showModal({
        title: '您之前已填写过开工时间，是否修改？ Your recorded start time before, overwrite it?',
        confirmText: '确认Yes',
        cancelText: '取消No',
        success(res) {
          if (res.confirm) {
            if (that.data.stopTime0 != '' && that.data.stopTime != '' && that.data.stopTime0 != that.data.stopTime) {
              wx.showModal({
                title: '您之前已填写过收工时间，是否修改？ Your recorded stop time before, overwrite it?',
                confirmText: '确认Yes',
                cancelText: '取消No',
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
        title: '您之前已填写过收工时间，是否修改？ Your recorded stop time before, overwrite it?',
        confirmText: '确认Yes',
        cancelText: '取消No',
        success(res) {
          if (res.confirm) {
            that.recordWorkTime();
          }
        }
      })
    } else if (that.data.startTime0 == that.data.startTime && that.data.stopTime0 == that.data.stopTime) {
      wx.showToast({
        title: '您以前记录过相同的工作时间！You recorded the same work time before!',
        duration: 3000,
        icon: "none"
      })
    } else {
      that.recordWorkTime();
    }
    // submit now
  },

  recordWorkTime : function() {
    this.handleDriver();
  },

  handleDriver : function() {
    let that = this;
    if (that.data.driverName0 == '') {
      const db = wx.cloud.database()
      db.collection('drivers').add({
        data: {
          name: that.data.driverName,
          lastUsedPnum: that.data.pnum,
        },
        success: function(res) {
          that.setData({
            driverName0: that.data.driverName,
            lastUsedPnum: that.data.lastUsedPnum,
          })
          that.handleWTRecord();
        },
        fail: function(res) {
          wx.showToast({
            title: '无法添加您的信息！Unable to insert your data!',
            duration: 3000,
            icon: "none"
          })
        }
      })
    } else if (that.data.lastUsedPnum != that.data.pnum) {
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
            that.showSuccess();
          } else {
            wx.showToast({
              title: '数据错误1，请联系管理员！Data error 1, please contact admin!',
              duration: 3000,
              icon: "none"
            })
          }
        },
        fail: err => {
          wx.showToast({
            title: '无法更新您的信息！Unable to update your data!',
            duration: 3000,
            icon: "none"
          })
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
          that.showSuccess();
        },
        fail: function(res) {
          wx.showToast({
            title: '无法添加您的工时信息！Unable to insert your work time data!',
            duration: 3000,
            icon: "none"
          })
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
            that.showSuccess();
          } else {
            wx.showToast({
              title: '数据错误2，请联系管理员！Data error 2, please contact admin!',
              duration: 3000,
              icon: "none"
            })
          }
        },
        fail: err => {
          wx.showToast({
            title: '无法更新您的工时信息！Unable to update your work time data!',
            duration: 3000,
            icon: "none"
          })
        }
      })
    }
  },

  showSuccess: function() {
    wx.showToast({
      title: '成功！Done!',
      icon: 'success',
      duration: 3000
    })
  },

  formReset(e) {
    this.setData({
      startTime: '',
      stopTime: '',
      driverName: this.data.driverName0
    })
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
        for (i = 0; i < res.data.length; i++) {
          console.log('pnum=' + res.data[i].pnum)
          pnums0.push(res.data[i].pnum);
          if (this.data.lastUsedPnum == res.data[i].pnum) {
            this.setData({pnum: res.data[i].pnum});
          }
        }
        console.log('i=' + i)
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
        wx.showToast({
          icon: "none",
          title: '没有车辆可选，请联系管理员！ No vehicle to select, please contact admin!',
          duration: 3000
        })
      }
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
        if (res.data.length > 1) console.warn('More than 1 records found!');
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