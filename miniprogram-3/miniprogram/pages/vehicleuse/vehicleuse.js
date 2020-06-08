// miniprogram/pages/vehicleuse/vehicleuse.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // Chinese spaces, so that user has more space to tap
    cnSpaces: '',
    driverName: '',
    driverName0: '', // value in DB
    startTime0: '', // value in DB
    stopTime0: '', // value in DB
    pnum: '',
    pnums: [],
    lastUsedPnum: '',
    date: '',
    startTime: '',
    stopTime: '',
    mats: [
      {name: 'Digger Transfer'},
      {name: 'Dry Clay'}, 
      {name: 'Dir/Wet Mixed'}, 
      {name: 'Rubbish/Mixed'}, 
      {name: 'Concrete'}, 
      {name: 'Top Soil'}, 
      {name: 'Gap (7, 20, 40, 65, Scoria)'}, 
      {name: 'Others'}],
    site: '',
    sites: [],
    lastUsedSite: '',
    notes: '',
    quarry: '',
    pageWidth: 0,
    infoLeft: 0,
  },

  onCheckboxChange: function(e) {
    var idx = e.target.dataset.checkid;
    if (e.detail.value.length == 1) {
      this.data.mats[idx].selected = true;
    } else {
      this.data.mats[idx].selected = false;
    }
    this.setData({
      mats: this.data.mats,
    })
  },

  inputNotes(e) {
    this.setData({ notes: e.detail.value});
  },

  inputQuarry(e) {
    this.setData({ quarry: e.detail.value});
  },

  inputName(e) {
    this.setData({ driverName: e.detail.value});
  },
  changeSite(e) {
    this.setData({ site: this.data.sites[e.detail.value]});
  },
  changePnum(e) {
    this.setData({ pnum: this.data.pnums[e.detail.value]});
  },
  changeDate(e) {
    this.setData({ date: e.detail.value});
  },
  changeStartTime(e) {
    this.setData({ startTime: e.detail.value});
  },
  changeStopTime(e){
    this.setData({ stopTime:e.detail.value});
  },
  formSubmit(e) {
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
          stopTime: that.data.stopTime
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
    var i;
    for (i = 0; i < 10; i++) this.data.cnSpaces += '　';
    for (i = 0; i < this.data.mats.length; i++) this.data.mats[i].selected = false;
    this.setData({
      driverName: getApp().globalData.driverName,
      driverName0: getApp().globalData.driverName,
      lastUsedPnum: getApp().globalData.lastUsedPnum,
      pnum: getApp().globalData.lastUsedPnum,
      date: this.getCurrentDate(),
      cnSpaces: this.data.cnSpaces,
      mats: this.data.mats,
    });
    this.loadSites();
    this.loadVehicles();
  },

  getCurrentDate: function() {
    let now = new Date();
    let m = now.getMonth() + 1;
    let d = now.getDate();
    var dtStr = '' + now.getFullYear() + '-' + (m < 10 ? '0' + m : m) +
      '-' + (d < 10 ? '0' + d : d);
    return dtStr;
  },
  loadSites: function() {
    const db = wx.cloud.database()
    db.collection('sites').get().then(res => {
      if (res.data.length > 0) {
        var sites0 = [];
        var i;
        for (i = 0; i < res.data.length; i++) {
          sites0.push(res.data[i].addr);
          if (this.data.lastUsedSite == res.data[i].addr) {
            this.setData({site: res.data[i].addr});
          }
        }
        this.setData({
          sites: sites0,
        });
        if (this.data.site == '') {
          this.setData({
            site: res.data[0].addr,
          })
        }
      } else {
        // no record found
        wx.showToast({
          icon: "none",
          title: '没有工作地址可选，请联系管理员！ No job address to select, contact admin!',
          duration: 3000
        })
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
          if (this.data.lastUsedPnum == res.data[i].pnum) {
            this.setData({pnum: res.data[i].pnum});
          }
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
        wx.showToast({
          icon: "none",
          title: '没有车辆可选，请联系管理员！ No vehicle to select, contact admin!',
          duration: 3000
        })
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
    this.getPageWidth();
    this.getInfoLeft();
  },

  getPageWidth: function() {
    var that = this;
    let id = "#page";
    let query = wx.createSelectorQuery(); //创建查询对象
    query.select(id).boundingClientRect(); //获取view的边界及位置信息
    query.exec(function (res) {
      console.log("width=" + res[0].width);
      that.setData({
        pageWidth: res[0].width,
      });
    });
  },
  getInfoLeft: function() {
    var that = this;
    let id = "#info0";
    let query = wx.createSelectorQuery(); //创建查询对象
    query.select(id).boundingClientRect(); //获取view的边界及位置信息
    query.exec(function (res) {
      console.log("left=" + res[0].left);
      that.setData({
        infoLeft: res[0].left,
      });
    });
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