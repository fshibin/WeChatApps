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
    //driver: '',
    startDate: '',
    stopDate: '',
    pnums: [],
    pnumsSelected: [],
    //pnum: '',
    sites: [],
    sitesSelected: [],
    site: '',
    quarries: [],
    quarriesSelected: [],
    //quarry: '',
    startTime: '',
    stopTime: '',
    records: [],
    dataReturned: [],
    totalTime: '00:00',
    totalMinutes: 0,
    ldDvDone: false,
    ldStDone: false,
    ldVcDone: false,
    ldQrDone: false,
    checkedSU: false,
    driverName: '',
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

  onCheckboxChangeQuarry: function(e) {
    var idx = e.target.dataset.checkid;
    if (e.detail.value.length == 1) {
      this.data.quarriesSelected[idx] = true;
    } else {
      this.data.quarriesSelected[idx] = false;
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

  onCheckboxChangeSU: function(e) {
    var idx = e.target.dataset.checkid;
    if (e.detail.value.length == 1) {
      this.data.dataReturned[idx].selected = true;
    } else {
      this.data.dataReturned[idx].selected = false;
    }
  },

  onUpdateSU: function () {
    const db = wx.cloud.database()
    var i;
    var numToUpdate = 0;
    var selectedIdx = 0;
    for (i = 0; i < this.data.dataReturned.length; i++) {
      if (this.data.dataReturned[i].selected) {
        numToUpdate++;
        selectedIdx = i;
      }
    }
    if (numToUpdate == 0) {
      getApp().showError('请选择一条记录来更新！\nPlease select one record to update!');
      return;
    } else if (numToUpdate > 1) {
      getApp().showError('一次只能更新一条记录！\nOnly one record can be updated once!');
      return;
    }
    getApp().globalData.idToUpdate = this.data.dataReturned[selectedIdx]._id;
    this.setData({records:[]});
    this.setData({dataReturned:[]});
    this.setData({totalTime: '00:00'})
    wx.navigateTo({
      url: '../updatevehicleuse/updatevehicleuse',
    })
  },

  onDeleteSU: function () {
    const db = wx.cloud.database()
    var i;
    var numToDelete = 0;
    for (i = 0; i < this.data.dataReturned.length; i++) {
      if (this.data.dataReturned[i].selected) {
        numToDelete++;
      }
    }
    if (numToDelete == 0) {
      getApp().showError('请至少选择一条记录！\nPlease select at least one record!');
      return;
    }
    let that = this;
    wx.showModal({
      title: "删除后无法恢复，是否继续？\nDeleted records can't be recovered, continue?",
      confirmText: '确认Yes',
      cancelText: '取消No',
      mask: true,
      success(res) {
        if (res.confirm) {
          that.deleteSU();
        }
      },
    });
},

  deleteSU: function() {
    const db = wx.cloud.database()
    var i;
    var numToDelete = 0;
    var numResponseGot = 0;
    var someFailed = false;
    var someSucceeded = false;
    var itemsDeleted = [];
    for (i = 0; i < this.data.dataReturned.length; i++) {
      if (this.data.dataReturned[i].selected) {
        numToDelete++;
      }
    }
    getApp().showLoading('处理中');
    for (i = 0; i < this.data.dataReturned.length; i++) {
      if (this.data.dataReturned[i].selected) {
        wx.cloud.callFunction({
          name: 'rmsiteuse',
          data: {
            _id: this.data.dataReturned[i]._id,
            index: i,
          },
          success: res => {
            if (res == -1)
              someFailed = true;
            else {
              someSucceeded = true;
              itemsDeleted.push(res);
            }
            numResponseGot++;
            if (numResponseGot == numToDelete) { // last one
              //if (someSucceeded) this.onLoad();
              this.refreshReturnedData(itemsDeleted)
              if (!someSucceeded) {
                getApp().showError('删除失败Failed!');
              } else if (someFailed) {
                this.setData({checkedSU:false});
                getApp().showSuccess('部分成功SomeOK!');
              } else {
                this.setData({checkedSU:false});
                getApp().showSuccess('删除成功AllOK!')
              }
          
            }
          },
          fail: err => {
            someFailed = true;
            numResponseGot++;
            if (numResponseGot == numToDelete) { // last one
              //if (someSucceeded) this.onLoad();
              this.refreshReturnedData(itemsDeleted)
              if (!someSucceeded) {
                getApp().showError('删除失败Failed!');
              } else if (someFailed) {
                this.setData({checkedSU:false});
                getApp().showSuccess('部分成功SomeOK!');
              } else {
                this.setData({checkedSU:false});
                getApp().showSuccess('删除成功AllOK!')     
              }
            }
          }
        })
      }
    };
  },

  refreshReturnedData: function(itemsDeleted) {
    if (itemsDeleted.length == 0) return;
    itemsDeleted.sort(function(a, b) {
      return a - b;
    });
    let i;
    for (i = itemsDeleted.length - 1; i >= 0; i--) {
      this.data.dataReturned.splice(itemsDeleted[i], 1)
    }
    this.getLines(this.data.dataReturned);
  },

  loadDrivers: function() {
    const db = wx.cloud.database()
    db.collection('drivers').get().then(res => {
      if (res.data.length > 0) {
      var drivers0 = [];
        var i;
        for (i = 0; i < res.data.length; i++) {
          drivers0.push(res.data[i].name);
          if (res.data[i].name == this.data.driverName)
            this.data.driversSelected.push(true);
          else
            this.data.driversSelected.push(false);
        }
        this.setData({
          drivers: drivers0,
          //driver: res.data[0].name,
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
          getApp().showError('没有客户可选！\nNo client to select!');
        }
        this.setData({ldStDone: true});
      },
      fail: err => {
        getApp().showError('获取客户列表时发生错误！\nError occured when getting client list!');
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
          this.data.pnumsSelected.push(false);
        }
        this.setData({
          pnums: pnums0,
        });
        //if (this.data.pnum == '') {
        //  this.setData({
        //    pnum: res.data[0].pnum,
        //  })
        //}
      } else {
        // no record found
        getApp().showError('没有车辆可选，请联系管理员！\nNo vehicle to select, contact admin!');
      }
      this.setData({ldVcDone: true});
    });
  },

  loadQuarries: function() {
    const db = wx.cloud.database()
    db.collection('quarries').where({
    }).get().then(res => {
      if (res.data.length > 0) {
        var quarries0 = [];
        var i;
        for (i = 0; i < res.data.length; i++) {
          quarries0.push(res.data[i].name);
          this.data.quarriesSelected.push(false);
        }
        this.setData({
          quarries: quarries0,
        });
        //if (this.data.quarry == '') {
        //  this.setData({
        //    quarry: res.data[0].name,
        //  })
        //}
      } else {
        // no record found
        getApp().showError('没有倒土场可选，请联系管理员！\nNo quarry to select, contact admin!');
      }
      this.setData({ldQrDone: true});
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
      driverName: getApp().globalData.driverName,
      pageWidth: getApp().globalData.pageWidth,
      infoLeft: getApp().globalData.infoLeft,
      startDate: getApp().globalData.driverName == '' ? dtStr2 : dtStr,
      stopDate: dtStr,
      startTime: '00:00',
      stopTime: '23:59',
    });
    this.loadSites();
    this.loadDrivers();
    this.loadVehicles();
    this.loadQuarries();
  },

  getLines: function(data) {
    var i;
    var line;
    var lines = [];
    this.data.totalMinutes = 0;
    for (i = 0; i < data.length; i++) {
      let item = data[i];
      let duration = '00:00';
      if (item.startTime && item.stopTime) duration = this.getDuration(item.startTime, item.stopTime);
      line = item.date + '|' + item.startTime + '-' + item.stopTime + '=>' + duration;
      lines.push(line);
      item.firstLine = line; // new
      item.nextLines = []; // new
      item.selected = false;// new
      line = '　 　' + item.pnum + '|' + item.driver;
      lines.push(line);
      item.nextLines.push(line); // new
      if (item.jobAddr != '') lines.push('　 　' + item.jobAddr);
      if (item.jobAddr != '') item.nextLines.push('　 　' + item.jobAddr); // new
      line = '　 　' + item.goods + (item.quarry != '' ? '|' + item.quarry : '');
      lines.push(line);
      item.nextLines.push(line); // new
      if (item.notes != '') lines.push('　 　' + item.notes);
      if (item.notes != '') item.nextLines.push('　 　' + item.notes); // new
    }
    let h = parseInt(this.data.totalMinutes / 60); // hours
    let m = this.data.totalMinutes % 60; // minutes
    let tt = '' + (h > 9 ? h : '0' + h) + ':' + (m > 9 ? m : '0' + m);
    this.setData({
      records: lines,
      totalTime: tt,
      dataReturned: data,
    });
},

  onQuery: function() {
    getApp().showLoading('处理中')
    let that = this;
    that.setData({records:[]});
    that.setData({dataReturned:[]});
    that.setData({totalTime: '00:00'})
    var i;
    var sites = [];
    //for (i = 0; i < that.data.sites.length; i++) {
    //  if (that.data.sitesSelected[i]) sites.push(that.data.sites[i]);
    //}
    sites.push(that.data.site);
    var drivers = [];
    for (i = 0; i < that.data.drivers.length; i++) {
      if (that.data.driversSelected[i]) drivers.push(that.data.drivers[i]);
    }
    var pnums = [];
    for (i = 0; i < that.data.pnums.length; i++) {
      if (that.data.pnumsSelected[i]) pnums.push(that.data.pnums[i]);
    }
    var quarries = [];
    for (i = 0; i < that.data.quarries.length; i++) {
      if (that.data.quarriesSelected[i]) quarries.push(that.data.quarries[i]);
    }
    wx.cloud.callFunction({
      name: 'querysiteuse',
      data: {
        sites: sites,
        startDate: that.data.startDate,
        stopDate: that.data.stopDate,
        startTime: that.data.startTime,
        stopTime: that.data.stopTime,
        drivers: drivers,
        pnums: pnums,
        quarries: quarries,
      },
      success: res => {
        if (res.result != null && res.result.data.length > 0) {
          /*
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
            item.firstLine = line; // new
            item.nextLines = []; // new
            item.selected = false;// new
            line = '　' + item.pnum + '|' + item.driver;
            lines.push(line);
            item.nextLines.push(line); // new
            if (item.jobAddr != '') lines.push('　' + item.jobAddr);
            if (item.jobAddr != '') item.nextLines.push('　' + item.jobAddr); // new
            line = '　' + item.goods + (item.quarry != '' ? '|' + item.quarry : '');
            lines.push(line);
            item.nextLines.push(line); // new
            if (item.notes != '') lines.push('　' + item.notes);
            if (item.notes != '') item.nextLines.push('　' + item.notes); // new
          }
          let h = parseInt(this.data.totalMinutes / 60); // hours
          let m = this.data.totalMinutes % 60; // minutes
          let tt = '' + (h > 9 ? h : '0' + h) + ':' + (m > 9 ? m : '0' + m);
          this.setData({
            records: lines,
            totalTime: tt,
            dataReturned: res.result.data,
          });
          */
          this.getLines(res.result.data);
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

  onSavePdf: function() {
    getApp().showLoading('处理中')
    wx.cloud.callFunction({
      name: 'generatepdf',
      data: {
        site: this.data.site,
        startDate: this.data.startDate,
        stopDate: this.data.stopDate,
        data: this.data.dataReturned,
      },
      success: res => {
        let fileID = res.result.fileID;
        wx.cloud.downloadFile({
          fileID: fileID,
          success: res => {
            var filePath = res.tempFilePath;
            /*wx.saveFile({
              tempFilePath: filePath,
              success: res => {
                getApp().showSuccess('Saved as: ' + res.savedFilePath)
              }
            });*/
            wx.openDocument({
              filePath: filePath,
              success: res => {
                wx.hideLoading({
                  complete: (res) => {},
                })
              }
            })
          },
          fail: err => {
            console.log(err);
            getApp().showError('无法保存为PDF！\nUnable to save as PDF!')
          },
        });
      },
      fail: err => {
        console.log(err);
        getApp().showError('无法保存为PDF！\nUnable to save as PDF!')
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