// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const _ = db.command;
    return await db.collection('worktime').where({
      driver: event.driver,
      date: _.gte(event.startDate).and(_.lte(event.stopDate)),
    }).get();
  } catch(e) {
    console.error(e)
  }
}