// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  return db.collection('works').where({
    date: _.gte(event.min).and(_.lte(event.max)),
    openId: event.openId,
    done: false
  }).limit(100).get()
}