// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    res = await db.collection('siteuse').where({
      _id: event._id,
    }).remove()
    if (res.stats.removed != 1) return -1;
    else return event.index;
  } catch(e) {
    console.error(e)
  }
}