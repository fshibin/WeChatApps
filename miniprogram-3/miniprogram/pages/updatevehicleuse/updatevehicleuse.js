// miniprogram/pages/updatevehicleuse/updatevehicleuse.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    driverName: '',
    driver: '',
    drivers: [],
    date: '',
    pnum: '',
    pnums: [],
    site: '',
    sites: [],
    jobAddr: '',
    startTime: '',
    stopTime: '',
    mats: [
      {name: 'Drilling Holes'},
      {name: 'Digger Excavation'},
      {name: 'Digger Transfer'},
      {name: 'Travel Time'},
      {name: 'Dry Clay'}, 
      {name: 'Dir/Wet Mixed'}, 
      {name: 'Rubbish/Mixed'}, 
      {name: 'Concrete'}, 
      {name: 'Top Soil'}, 
      {name: 'Gap(7)'},
      {name: 'Gap(20)'},
      {name: 'Gap(40)'},
      {name: 'Gap(65)'},
      {name: 'Gap(Scoria)'}, 
      {name: 'Others'}
    ],
    otherMat: '',
    matSelected: '',
    matSelectedIdx: -1,
    quarry: '',
    quarries: [],
    needQuarry: false,
    notes: '',

    _id: '',
    record: null,
      
    pageWidth: 0,
    infoLeft: 0,

    ldDataDone: false,
  },

  loadRecord: function(_id) {
    const db = wx.cloud.database()
    db.collection('siteuse').where({
      _id: _id,
    }).get().then(res => {
      if (res.data.length == 1) {
        let rec = res.data[0];
        // show what work content has been chosen
        let qi = 0;
        let matSelected = '';
        let matSelectedIdx = -1;
        let otherMat = '';
        for (qi = 0; qi < this.data.mats.length; qi++) {
          if (rec.goods == this.data.mats[qi].name) {
            matSelected = rec.goods;
            matSelectedIdx = qi;
            break;
          }
        }
        if (qi == this.data.mats.length) {
          matSelected = 'Others';
          otherMat = rec.goods;
          matSelectedIdx = this.data.mats.length - 1;
        }
        let nq = false;
        if (qi >= 4) nq = true;
        // populate data in record to data of UI elements
        this.setData({
          record: rec,
          date: rec.date,
          jobAddr: rec.jobAddr,
          startTime: rec.startTime,
          stopTime: rec.stopTime,
          notes: rec.notes,
          matSelected: matSelected,
          matSelectedIdx: matSelectedIdx,
          otherMat: otherMat,
          needQuarry: nq,
        });
        this.loadDrivers();
      } else {
        // 0 or >1 records found
        getApp().showError(
          '数据错误3，请联系管理员！\nData error 3, please contact admin!',
          function() {
            wx.navigateBack({delta: 0,})
          }
        );
      }
    });
  },

  onRadioChange: function(e) {
    var idx = e.target.dataset.checkid;
    this.setData({matSelected:this.data.mats[idx].name});
    this.data.matSelectedIdx = idx;
    if (idx == 0 || idx == 1 || idx == 2 || idx == 3) {
      this.setData({needQuarry:false});
    } else {
      this.setData({needQuarry:true});
    }
  },

  inputNotes(e) {
    this.data.notes = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s+/g, ' '); // compress spaces
  },

  inputJobAddr(e) {
    this.data.jobAddr = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s+/g, ' ') // compress spaces
      .replace(/\s*,/g, ',') // no space before comma
      .replace(/\s*\/\s*/g, '\/'); // no space before and after slash
  },

  inputOtherMat(e) {
    this.data.otherMat = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s+/g, ' ') // compress spaces
      .toLowerCase(); 
  },

  changeDriver(e) {
    this.setData({ driver: this.data.drivers[e.detail.value] });
  },

  changeSite(e) {
    this.setData({ site: this.data.sites[e.detail.value]});
  },

  changeQuarry(e) {
    this.setData({ quarry: this.data.quarries[e.detail.value]});
  },

  changePnum(e) {
    this.setData({ pnum: this.data.pnums[e.detail.value]});
    this.switchType(this.data.pnums[e.detail.value]);
  },

  switchType(pnum) {
    let i = 0;
    let idx = this.data.matSelectedIdx;
    if (pnum.indexOf('-') == -1) { // truck
      for (i = 0; i < 2; i++) this.data.mats[i].disabled = true;
      for (i = 2; i < this.data.mats.length; i++) this.data.mats[i].disabled = false;
      if (this.data.matSelectedIdx < 2) idx = 2;
    } else {
      for (i = 0; i < 2; i++) this.data.mats[i].disabled = false;
      for (i = 2; i < this.data.mats.length; i++) this.data.mats[i].disabled = true;
      if (this.data.matSelectedIdx >= 2) idx = 0;
    }
    this.setData({
      mats: this.data.mats,
      matSelected: this.data.mats[idx].name,
      matSelectedIdx: idx,
      needQuarry: idx >= 4,
    });
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
    if (this.data.pnums.length == 0) {
      getApp().showError('没有车辆可选，请联系管理员！\nNo vehicle to select, contact admin!');
      return;
    }
    if (this.data.sites.length == 0) {
      getApp().showError('没有客户可选，请联系管理员！\nNo client to select, contact admin!');
      return;
    }
    if (this.data.startTime == '' || this.data.stopTime == '') {
      getApp().showError('必须填写开始时间和结束时间！Must input start time and stop time!');
      return;
    } 
    if (this.data.startTime.localeCompare(this.data.stopTime) >= 0) {
      getApp().showError('开始时间必须早于结束时间！Start time must be earlier than stop time!');
      return;
    }
    if (this.data.mats.length > 0) {
      if (this.data.matSelected=='Others' && this.data.otherMat == '') {
        getApp().showError('没有说明其他是什么！Didn\'t specify what others are!');
        return;
      }
    }
    if (this.data.needQuarry && this.data.quarry == '') {
      getApp().showError('没有采石场/倒土场可选，请联系管理员！\nNo quarry to select, contact admin!');
      return;
    }
    if (this.data.notes != '') {
      let tmpi = 0;
      for (tmpi = 0; tmpi < this.data.notes.length; tmpi++) {
        let cc = this.data.notes.charCodeAt(tmpi);
        if (cc > 128) {
          getApp().showError('备注请用英文填写！Notes must be English!');
          return;
        }
      }
    }
    let that = this;
    // submit now
    getApp().showLoading('处理中')
    this.checkOverlap();
  },

  checkOverlap: function() {
    const db = wx.cloud.database();
    const _ = db.command;
    db.collection('siteuse').where(_.or([
      {
        _id: _.neq(this.data._id),
        pnum: this.data.pnum,
        date: this.data.date,
        startTime: _.lte(this.data.startTime),
        stopTime: _.gte(this.data.stopTime),
      },
      {
        _id: _.neq(this.data._id),
        pnum: this.data.pnum,
        date: this.data.date,
        startTime: _.lt(this.data.stopTime).and(_.gte(this.data.startTime)),
      },
      {
        _id: _.neq(this.data._id),
        pnum: this.data.pnum,
        date: this.data.date,
        stopTime: _.gt(this.data.startTime).and(_.lte(this.data.stopTime)),
      }
    ])).get().then( res => {
      if (res.data.length > 0) {
        getApp().showError('时间段和已有记录重叠！\nTime period is overlapped with existing records!');
      } else {
        this.updateSURecord();
      }
    });
  },

  updateSURecord : function() {
    let that = this;
    let mat = that.data.matSelected;
    if (mat == 'Others') mat = that.data.otherMat;
    wx.cloud.callFunction({
      name: 'updatesiteuse',
      data: {
        _id: that.data._id,
        driver: that.data.driver,
        date: that.data.date,
        pnum: that.data.pnum,
        site: that.data.site,
        jobAddr: that.data.jobAddr,
        startTime: that.data.startTime,
        stopTime: that.data.stopTime,
        goods: mat,
        quarry: that.data.needQuarry ? that.data.quarry : '',
        notes: that.data.notes,
      },
      success: res => {
        getApp().showSuccess('更新成功，请返回上一页并点击查询按钮来刷新！\nUpdate done, go back and click the Query button to refresh!');
      },
      fail: function(res) {
        getApp().showError('无法更新车辆使用记录！\nUnable to update vehicle use record!');
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var i;
    for (i = 0; i < this.data.mats.length; i++) {
      this.data.mats[i].disabled = true;
    }
    this.setData({
      driverName: getApp().globalData.driverName,
      //lastUsedPnum: getApp().globalData.lastUsedPnum,
      //pnum: getApp().globalData.lastUsedPnum,
      //lastUsedSite: getApp().globalData.lastUsedSite,
      //site: getApp().globalData.lastUsedSite,
      //lastUsedQuarry: getApp().globalData.lastUsedQuarry,
      //quarry: getApp().globalData.lastUsedQuarry,
      //lastUsedJobAddr: getApp().globalData.lastUsedJobAddr,
      //jobAddr: getApp().globalData.lastUsedJobAddr,
      //date: this.getCurrentDate(),
      mats: this.data.mats,
      matSelected: this.data.mats[0].name,
      matSelectedIdx: 0,
      _id: getApp().globalData.idToUpdate,
    });
    this.loadRecord(this.data._id);
    //this.loadSites();
    //this.loadVehicles();
    //this.loadQuarries();
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
    wx.cloud.callFunction({
      name: 'loadsites',
      data: {
      },
      success: res => {
        if (res.result != null && res.result.data.length > 0) {
          var sites0 = [];
          var i;
          var lastUsedExists = false;
          for (i = 0; i < res.result.data.length; i++) {
            sites0.push(res.result.data[i].addr);
            if (this.data.record.site == res.result.data[i].addr) {
              this.setData({site: res.result.data[i].addr});
              lastUsedExists = true;
            }
          }
          this.setData({
            sites: sites0,
          });
          if (!lastUsedExists || this.data.site == '') {
            this.setData({
              site: res.result.data[0].addr,
            })
          }
          this.loadQuarries();
        } else {
          // no record found
          getApp().showError(
            '没有客户可选，请联系管理员！\nNo client to select, contact admin!',
            function() {
              wx.navigateBack({delta: 0,})
            }
          );
        }
      },
      fail: err => {
        getApp().showError(
          '无法获得客户列表！\nUnable to get the client list!',
          function() {
            wx.navigateBack({delta: 0,})
          }
        );
      },
    });
  },

  loadVehicles: function() {
    const db = wx.cloud.database()
    db.collection('vehicles').where({
    }).get().then(res => {
      if (res.data.length > 0) {
      var pnums0 = [];
        var i;
        var lastUsedExists = false;
        for (i = 0; i < res.data.length; i++) {
          pnums0.push(res.data[i].pnum);
          if (this.data.record.pnum == res.data[i].pnum) {
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
        this.switchType(this.data.pnum);
        this.loadSites();
      } else {
        // no record found
        getApp().showError(
          '没有车辆可选，请联系管理员！\nNo vehicle to select, contact admin!',
          function() {
            wx.navigateBack({delta: 0,})
          }
        );
      }
    });
  },

  loadQuarries: function() {
    const db = wx.cloud.database()
    db.collection('quarries').where({
    }).get().then(res => {
      if (res.data.length > 0) {
      var quarries0 = [];
        var i;
        var lastUsedExists = false;
        for (i = 0; i < res.data.length; i++) {
          quarries0.push(res.data[i].name);
          if (this.data.record.quarry == res.data[i].name) {
            this.setData({quarry: res.data[i].name});
            lastUsedExists = true;
          }
        }
        this.setData({
          quarries: quarries0,
        });
        if (!lastUsedExists || this.data.quarry == '') {
          this.setData({
            quarry: res.data[0].name,
          })
        }
        this.setData({ldDataDone: true});
      } else {
        // no record found
        getApp().showError(
          '没有采石场/倒土场可选，请联系管理员！\nNo quarry to select, contact admin!',
          function() {
            wx.navigateBack({delta: 0,})
          }
        );
      }
    });
  },

  loadDrivers: function() {
    const db = wx.cloud.database()
    db.collection('drivers').get().then(res => {
      if (res.data.length > 0) {
      var drivers0 = [];
        var i;
        var lastUsedExists = false;
        for (i = 0; i < res.data.length; i++) {
          drivers0.push(res.data[i].name);
          if (this.data.record.driver == res.data[i].name) {
            this.setData({driver: res.data[i].name});
            lastUsedExists = true;
          }
        }
        this.setData({
          drivers: drivers0,
        });
        if (!lastUsedExists || this.data.driver == '') {
          this.setData({
            driver: driverName ? driverName : res.data[0].name,
          })
        }
        this.loadVehicles();
      } else {
        // no record found
        getApp().showError(
          '没有司机可选，请联系管理员！\nNo driver to select, contact admin!',
          function() {
            wx.navigateBack({delta: 0,})
          }
        );
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