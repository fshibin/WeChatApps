// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    return await db.collection('siteuse').where({
      _id: event._id,
    }).update({
      data: {
        pnum: event.pnum,
        startTime: event.startTime,
        stopTime: event.stopTime,
        notes: event.notes,
        date: event.date,
        driver: event.driver,
        goods: event.goods,
        jobAddr: event.jobAddr,
        quarry: event.quarry,
        site: event.site,
      },
    })
  } catch(e) {
    console.error(e)
  }
}