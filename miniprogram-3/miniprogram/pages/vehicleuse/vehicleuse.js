// miniprogram/pages/vehicleuse/vehicleuse.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    driverName: '',
    date: '',
    pnum: '',
    pnums: [],
    site: '',
    sites: [],
    jobAddr: '',
    startTime: '',
    stopTime: '',
    mats: [
      {name: 'Digger Transfer'},
      {name: 'Drilling Holes'},
      {name: 'Digger Excavation'},
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

    lastUsedPnum: '',
    lastUsedSite: '',
    lastUsedQuarry: '',
    lastUsedJobAddr: '',
      
    pageWidth: 0,
    infoLeft: 0,

    ldVcDone: false,
    ldStDone: false,
    ldQrDone: false,
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
    this.setData({ notes: e.detail.value});
  },

  inputJobAddr(e) {
    this.setData({ jobAddr: e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s+/g, ' ') // compress spaces
      .replace(/\s*,/g, ',') // no space before comma
      .replace(/\s*\/\s*/g, '\/'),
    }); // no space before and after slash
  },

  inputOtherMat(e) {
    this.setData({ otherMat: e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s+/g, ' ') // compress spaces
      .toLowerCase()
    });
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
      for (i = 0; i < 3; i++) this.data.mats[i].disabled = true;
      for (i = 3; i < this.data.mats.length; i++) this.data.mats[i].disabled = false;
      if (this.data.matSelectedIdx < 3) idx = 3;
    } else {
      for (i = 0; i < 3; i++) this.data.mats[i].disabled = false;
      for (i = 3; i < this.data.mats.length; i++) this.data.mats[i].disabled = true;
      if (this.data.matSelectedIdx >= 3) idx = 0;
    }
    this.setData({
      mats: this.data.mats,
      matSelected: this.data.mats[idx].name,
      matSelectedIdx: idx,
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
      getApp().showError('必须填写采石场名称！Quarry name must be entered!');
      return;
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
        driver: this.data.driverName,
        date: this.data.date,
        startTime: _.lte(this.data.startTime),
        stopTime: _.gte(this.data.stopTime),
      },
      {
        driver: this.data.driverName,
        date: this.data.date,
        startTime: _.lt(this.data.stopTime).and(_.gte(this.data.startTime)),
      },
      {
        driver: this.data.driverName,
        date: this.data.date,
        stopTime: _.gt(this.data.startTime).and(_.lte(this.data.stopTime)),
      }
    ])).get().then( res => {
      if (res.data.length > 0) {
        getApp().showError('时间段和已有记录重叠！\nTime period is overlapped with existing records!');
      } else {
        this.updateDriver();
      }
    });
  },

  updateDriver : function() {
    let that = this;
    if (that.data.lastUsedPnum != that.data.pnum ||
        that.data.lastUsedSite != that.data.site ||
        that.data.lastUsedQuarry != that.data.quarry || 
        that.data.lastUsedJobAddr != that.data.jobAddr) {
      wx.cloud.callFunction({
        name: 'updatedriver',
        data: {
          openId: getApp().globalData.openId,
          pnum: that.data.pnum,
          site: that.data.site,
          quarry: that.data.quarry,
          jobAddr: that.data.jobAddr,
        },
        success: res => {
          console.log(res)
          if (res.result.stats.updated == 1) {
            that.setData({
              lastUsedPnum: that.data.pnum,
              lastUsedSite: that.data.site,
              lastUsedQuarry: that.data.quarry,
            })
            getApp().globalData.lastUsedPnum = that.data.pnum;
            getApp().globalData.lastUsedSite = that.data.site;
            getApp().globalData.lastUsedQuarry = that.data.quarry;
            that.addSURecord();
          } else {
            getApp().showError('数据错误1，请联系管理员！\nData error 1, please contact admin!');
          }
        },
        fail: err => {
          getApp().showError('无法更新您的信息！\nUnable to update your data!');
        }
      })
    } else {
      that.addSURecord();
    }
  },

  addSURecord : function() {
    let that = this;
    let mat = that.data.matSelected;
    if (mat == 'Others') mat = that.data.otherMat;
    const db = wx.cloud.database()
    db.collection('siteuse').add({
      data: {
        driver: that.data.driverName,
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
      success: function(res) {
        getApp().showSuccess('车辆使用记录添加成功！\nSite use record is added successfully!');
      },
      fail: function(res) {
        getApp().showError('无法添加车辆使用记录！\nUnable to insert site use record!');
      }
    })
  },

  formReset(e) {
    var i;
    for (i = 0; i < this.data.mats.length; i++) {
      this.data.mats[i].selected = false;
    }
    this.setData({
      driverName: getApp().globalData.driverName,
      startTime: '',
      stopTime: '',
      mats: this.data.mats,
      otherMat: '',
      quarry: '',
      notes: '',
      matSeleted: '',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var i;
    for (i = 0; i < this.data.mats.length; i++) this.data.mats[i].disabled = true;
    this.setData({
      driverName: getApp().globalData.driverName,
      lastUsedPnum: getApp().globalData.lastUsedPnum,
      pnum: getApp().globalData.lastUsedPnum,
      lastUsedSite: getApp().globalData.lastUsedSite,
      site: getApp().globalData.lastUsedSite,
      lastUsedQuarry: getApp().globalData.lastUsedQuarry,
      quarry: getApp().globalData.lastUsedQuarry,
      lastUsedJobAddr: getApp().globalData.lastUsedJobAddr,
      jobAddr: getApp().globalData.lastUsedJobAddr,
      date: this.getCurrentDate(),
      mats: this.data.mats,
      matSelected: this.data.mats[0].name,
      matSelectedIdx: 0,
    });
    this.loadSites();
    this.loadVehicles();
    this.loadQuarries();
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
            if (this.data.lastUsedSite == res.result.data[i].addr) {
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
        } else {
          // no record found
          getApp().showError('没有工作地址可选，请联系管理员！\nNo job address to select, contact admin!')
        }
        this.setData({ldStDone:true})
      },
      fail: err => {
        this.setData({ldStDone:true})
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
        this.switchType(this.data.pnum);
      } else {
        // no record found
        getApp().showError('没有车辆可选，请联系管理员！\nNo vehicle to select, contact admin!');
      }
      this.setData({ldVcDone:true})
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
          if (this.data.lastUsedQuarry == res.data[i].name) {
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
      } else {
        // no record found
        getApp().showError('没有采石场/倒土场可选，请联系管理员！\nNo quarry to select, contact admin!');
      }
      this.setData({ldQrDone:true})
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