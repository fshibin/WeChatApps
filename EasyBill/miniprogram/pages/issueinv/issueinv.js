// miniprogram/pages/issueinv/issueinv.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageWidth: 0,
    infoLeft: 0,
    clients: [],
    clientNames: [],
    client: '',
    idxSelected: '',
    ldCtDone: false,
    invoiceId: '',
    items: [],
    checked: false,
    desc: '',
    price: '',
    gst: false,
    qty: '',
    isAdding: true,
    idx: '',
    totalPrice: '0.00',
    paid: '',
  },

  changeclient(e) {
    this.setData({
      idxSelected: e.detail.value,
      client: this.data.clientNames[e.detail.value],
    })
  },

  onDesc: function(e) {
    this.data.desc = e.detail.value
      .trim() // trim frist & last spaces
      .replace(/\s+/g, ' ') // compress spaces
      .replace(/\s*,/g, ',') // no space before comma
      .replace(/\s*\/\s*/g, '\/'); // no space before and after slash
  },

  onPrice: function(e) {
    var price;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      price = e.detail.value;
    } else {
      price = this.data.price; // restore old value
    }
    this.setData({
      price: price,
    })
  },

  onPaid: function(e) {
    var paid;
    if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) {
      paid = e.detail.value;
    } else {
      paid = this.data.paid; // restore old value
    }
    this.setData({
      paid: paid,
    })
  },

  onGst: function(e) {
    if (e.detail.value.length == 0) {
      this.data.gst = false;
    } else {
      this.data.gst = true;
    }
    this.getTotalPrice();
  },

  onQty: function(e) {
    var qty;
    if (/^([1-9][0-9]*)?$/.test(e.detail.value)) {
      qty = e.detail.value;
    } else {
      qty = this.data.qty; // restore old value
    }
    this.setData({
      qty: qty,
    })
  },

  onReset: function() {
    this.setData({
      isAdding: true,
      desc: '',
      price: '',
      qty: '',
      checkedGst: false,
      isAdding: true,
      idx: -1,
    })
  },

  onResetAll: function() {
    this.onReset();
    this.setData({
      gst: false,
      invoiceId: '',
      items: [],
      paid: '',
      client: '',
      totalPrice: '',
    })
  },

  onCommit: function () {
    if (this.data.desc == '') {
      getApp().showError('条目描述为空！\nItem description is empty!');
      return;
    }
    if (this.data.price == '') {
      getApp().showError('条目价格为空！\nItem price is empty!');
      return;
    }
    if (this.data.qty == '') {
      getApp().showError('条目数量空！\nItem quantity is empty!');
      return;
    }
    // getApp().showLoading('处理中');
    if (this.data.isAdding) {
      let i;
      let fd = false;
      for (i = 0; i < this.data.items.length; i++) {
        if (this.data.items[i].desc == this.data.desc) {
          fd = true;
          break;
        }
      }
      if (fd) {
        getApp().showError("记录已存在！\nRecord already exists!");
      } else {
        this.data.items.push({
          desc: this.data.desc,
          price: this.data.price,
          qty: this.data.qty,
        });
        this.setData({items: this.data.items})
        this.onReset();
      }
    } else {
      this.data.items[this.data.idx].desc = this.data.desc;
      this.data.items[this.data.idx].price = this.data.price;
      this.data.items[this.data.idx].qty = this.data.qty;
      this.setData({items: this.data.items});
      this.onReset();
    }
    this.getTotalPrice();
  },

  onCheckboxChange: function(e) {
    var idx = e.target.dataset.checkid;
    if (e.detail.value.length == 1) {
      this.data.items[idx].selected = true;
    } else {
      this.data.items[idx].selected = false;
    }
  },

  onChange: function() {
    var i;
    var idx = -1;
    var numSelected = 0;
    for (i = 0; i < this.data.items.length; i++) {
      if (this.data.items[i].selected) {
        numSelected++;
        idx = i;
      }
    }
    if (numSelected == 0) {
      getApp().showError('请选择一个项目！\nPlease select one item!');
      return;
    } else if (numSelected > 1) {
      getApp().showError('只能选择一个项目！\nYou can only select one item!');
      return;
    } else {
      this.setData({
        desc: this.data.items[idx].desc,
        price: this.data.items[idx].price,
        qty: this.data.items[idx].qty,
        idx: idx,
        isAdding: false,
      })
    }
  },

  onDelete: function () {
    var i;
    var numToDelete = 0;
    for (i = 0; i < this.data.items.length; i++) {
      if (this.data.items[i].selected) {
        numToDelete++;
      }
    }
    if (numToDelete == 0) {
      getApp().showError('请至少选择一个项目！\nPlease select at least one item!');
      return;
    }
    //getApp().showLoading('处理中');
    for (i = this.data.items.length - 1; i >= 0; i--) {
      if (this.data.items[i].selected) {
        this.data.items.splice(i, 1)
      }
    };
    this.setData({
      items: this.data.items,
      checked: false,
    })
    this.getTotalPrice();
  },

  getTotalPrice: function() {
    let i;
    let tp = 0;
    for (i = 0; i < this.data.items.length; i++) {
      tp = tp + parseFloat(this.data.items[i].price)
        * parseInt(this.data.items[i].qty);
    }
    if (!this.data.gst) {
      tp = tp * 1.15;
    }
    this.setData({
      totalPrice: '' + (Math.round(tp * 100) / 100),
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.cloud.callFunction({
      name: 'loadclients',
      data: {
      },
      success: res => {
        if (res.result != null) {
          this.data.clients = res.result.data;
          let i;
          for (i = 0; i < res.result.data.length; i++) 
            this.data.clientNames.push(res.result.data[i].name);
          this.setData({
            clientNames: this.data.clientNames,
            ldCtDone: true,
          });
        }
      },
      fail: err => {
        this.setData({ldCtDone:true})
      },
    });
    this.setData({
      pageWidth: getApp().globalData.pageWidth,
      infoLeft: getApp().globalData.infoLeft,
    });
  },

  onGenerate: function() {
    let that = this;
    getApp().showLoading('处理中');
    const db = wx.cloud.database()
    const $ = db.command.aggregate
    let year = new Date().getYear() + 1900;
    let nextSn = 1;
    db.collection('invoices').aggregate().group({
      _id: '$year',
      maxSn: $.max('$sn'),
    }).end({
      success: function(res) {
        if (res.list.length > 0) {
          let i;
          for (i = 0; i < res.list.length; i++) {
            if (res.list[i]._id == year) {
              nextSn = (res.list[i].maxSn + 1);
              break;
            }
          }
        }
        let iid = year + "-" + ("000" + nextSn).slice(-4);
        db.collection('invoices').add({
          data: {
            iid: iid,
            client: that.data.client,
            items: that.data.items,
            gstIn: that.data.gst,
            paid: that.data.paid,
            state: 'normal',
            year: year,
            sn: nextSn,
          },
          success: res => {
            that.onReset();
            that.setData({invoiceId: iid});
            that.generatePdf();
          },
          fail: err => {
            getApp().showError('无法添加发票记录到数据库！');
          },
        })
      },
      fail: function(err) {
        console.error(err)
        getApp().showError('无法获取目前最大序列号！');
      }
    })
  },

  onOpenPdf: function() {
    getApp().showLoading('处理中');
    /*let fileID = this.data.fileID;
    wx.cloud.downloadFile({
      fileID: fileID,
      success: res => {
        var filePath = res.tempFilePath;*/
        var filePath = this.data.filePath;
        wx.openDocument({
          filePath: filePath,
          success: res => {
            wx.hideLoading({
              complete: (res) => {},
            })
          },
          fail: err => {
            getApp().showError('无法打开PDF！\nUnable to open PDF!')
          }
        })
      /*},
      fail: err => {
        getApp().showError('无法下载PDF！\nUnable to download PDF!')
      },
    });*/
  },

  generatePdf: function() {
    let totalWoGst = 0;
    let gst = 0;
    let i;
    for (i = 0; i < this.data.items.length; i++) {
      let item = this.data.items[i];
      let prc = item.price;
      if (this.data.gst) {
        prc = Math.round(prc / 1.15 * 100) / 100;
        gst += (Math.round(item.price * item.qty * 100 - prc * item.qty * 100) / 100);
      } else {
        gst += (Math.round(item.price * item.qty * 0.15 * 100) / 100);
      }
      item.prc = prc; // add
      item.sub = Math.round(prc * item.qty * 100) / 100;
      totalWoGst += item.sub;
    }
    let totalWiGst = totalWoGst + gst;
    let due = Math.round((totalWiGst - this.data.paid) * 100) / 100;
    let that = this;
    let d1 = new Date();
    let date = (d1.getDate() < 10 ? '0' + d1.getDate() : d1.getDate()) +
      '-' + (d1.getMonth() < 9 ? '0' + (d1.getMonth() + 1) : (d1.getMonth() + 1)) + 
      '-' + d1.getFullYear();
    gst = Math.round(gst * 100) / 100;
    wx.cloud.callFunction({
      name: 'genpdfinv',
      data: {
        client: this.data.clients[this.data.idxSelected],
        items: this.data.items,
        iid: this.data.invoiceId,
        totalWoGst: totalWoGst,
        gst: gst,
        totalWiGst: totalWiGst,
        paid: this.data.paid,
        due: due,
        date: date,
      },
      success: res => {
        let fileID = res.result.fileID;
        console.log(fileID)
        that.data.fileID = fileID;
        wx.cloud.downloadFile({
          fileID: fileID,
          success: res => {
            var filePath = res.tempFilePath;
            that.data.filePath = filePath;
            wx.openDocument({
              filePath: filePath,
              success: res => {
                wx.hideLoading({
                  complete: (res) => {},
                })
              },
              fail: err => {
                getApp().showError('无法打开PDF！\nUnable to open PDF!')
              }
            })
          },
          fail: err => {
            console.log(err);
            getApp().showError('无法下载PDF！\nUnable to download PDF!')
          },
        });
      },
      fail: err => {
        console.log(err);
        getApp().showError('无法生成PDF！\nUnable to generate PDF!')
      },
    })
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