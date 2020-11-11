// 云函数入口文件
const cloud = require("wx-server-sdk");

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database();
  const ids = [
    "o09lM5ECOJcXzwJpfXDgWGq4Vcoc",
    "o09lM5NfDKgutwssN_TJv9yj3cMM",
    "o09lM5FFSAhSUNKqLu-dZeh1_sxA",
    "o09lM5N64E28M9_Ps1bKFFJfxWjA",
    "o09lM5Kx7aoya4Lqxdcj6Zv8losU",
    "o09lM5NDqq0yT32CJC-6Vr0jaT6I",
    "o09lM5OmGUfPQakuFGJuuhJv_XBM",
  ];
  const pickers = [
    { name: "110门", price: "110" },
    { name: "220门", price: "220" },
    { name: "350门", price: "350" },
  ];
  const result = []
  for (let i = 0; i < ids.length; i++) {
    const openId = ids[i];
    for (const picker of pickers) {
      const res = await db.collection("types").add({
        data: {
          name: picker.name,
          price: picker.price,
          openId,
        },
      });
      result.push(res)
    }
  }
  // const _ = db.command
  // return db.collection('types').where({
  //   openId: _.in(ids)
  // }).remove()
  return Promise.resolve(result);
};
