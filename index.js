const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");
const dotenv = require("dotenv");
const express = require('express');
const app = express();

dotenv.config();

const port = process.env.PORT || 3000;
const telegramToken = process.env.TELEGRAM_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHAT_ID;
const telegramEndpoint = `https://api.telegram.org/bot${telegramToken}/sendmessage?chat_id=${telegramChatId}&parse_mode=markdown`;

function extraText(availableCount) {
  switch (availableCount) {
    case 0:
      return "😢 내일은 있겠지..";
    case 1:
      return "😮 오늘 당장 달려!";
    default:
      return "🥱 천천히 빌리러 가자구.";
  }
}

async function init() {
  if (!telegramToken || !telegramChatId) {
    throw new Error("There is no Telegram token or chat id!");
  }

  const now = moment().format("YYYY-MM-DD");
  const firstNotiText = `\\[*${now}*\] 의 놀이아띠 월계점 장난감 재고 상태를 보여줄게~🙈🙉`;
  await axios(encodeURI(`${telegramEndpoint}&text=${firstNotiText}`));
}

async function checkProducts() {
  const products = [
    {
      name: "뽀로로 꼬마도서관",
      url: "http://www.nwscc.or.kr/new/raise/dab3.php?pno=03020202&sort=itemname%20asc&sch_field=itemname&page=25&sch_bcode=&sch_age=&sch_value=&listcnt=8&mode=view&itemcode=NW02TI000007",
    },
    {
      name: "뽀로로 척척블럭 자석블럭",
      url: "http://www.nwscc.or.kr/new/raise/dab3.php?pno=03020202&sort=itemname%20asc&sch_field=itemname&page=26&sch_bcode=&sch_age=&sch_value=&listcnt=8&mode=view&itemcode=NW02TC000012",
    },
    {
      name: "아이스크림 카트",
      url: "http://www.nwscc.or.kr/new/raise/dab3.php?pno=03020202&sort=itemname%20asc&sch_field=itemname&page=37&sch_bcode=&sch_age=&sch_value=&listcnt=8&mode=view&itemcode=NW02TJ000040",
    },
    {
      name: "파티파티 생일케이크",
      url: "http://www.nwscc.or.kr/new/raise/dab3.php?pno=03020202&mode=view&itemcode=NW02TI000008",
    },
  ];

  console.info(`${products.length}개의 장난감 재고를 체크합니다.`);

  await Promise.all(products.map((product) => axios(product.url))).then(
    async (results) => {
      for (const [i, { data }] of results.entries()) {
        const $ = cheerio.load(data);
        // green class means available
        const availableCount = $(".__ico1.green").length;
        const { name, url } = products[i];
        const extra = extraText(availableCount);
        const text = `- [\`${name}\` 은(는) 현재 \`${availableCount}\`개 남았어. ${extra}](${url})`;
        console.info(text);
        await axios(encodeURI(`${telegramEndpoint}&text=${text}`));
      }
    }
  );
}

async function main() {
  await init();
  await checkProducts();
}

app.get('/', async (req, res) => {
  await main();
  return res.send('Successfully checked Nori Atti products!')
});

app.listen(port, () => {
  console.log(`App listening at ${port}`);
});