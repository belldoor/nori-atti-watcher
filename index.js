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
      return "๐ข ๋ด์ผ์ ์๊ฒ ์ง..";
    case 1:
      return "๐ฎ ์ค๋ ๋น์ฅ ๋ฌ๋ ค!";
    default:
      return "๐ฅฑ ์ฒ์ฒํ ๋น๋ฆฌ๋ฌ ๊ฐ์๊ตฌ.";
  }
}

async function init() {
  if (!telegramToken || !telegramChatId) {
    throw new Error("There is no Telegram token or chat id!");
  }

  const now = moment().format("YYYY-MM-DD");
  const firstNotiText = `\\[*${now}*\] ์ ๋์ด์๋  ์๊ณ์  ์ฅ๋๊ฐ ์ฌ๊ณ  ์ํ๋ฅผ ๋ณด์ฌ์ค๊ฒ~๐๐`;
  await axios(encodeURI(`${telegramEndpoint}&text=${firstNotiText}`));
}

async function checkProducts() {
  const products = [
    {
      name: "๋ฝ๋ก๋ก ๊ผฌ๋ง๋์๊ด",
      url: "http://www.nwscc.or.kr/new/raise/dab3.php?pno=03020202&sort=itemname%20asc&sch_field=itemname&page=25&sch_bcode=&sch_age=&sch_value=&listcnt=8&mode=view&itemcode=NW02TI000007",
    },
    {
      name: "๋ฝ๋ก๋ก ์ฒ์ฒ๋ธ๋ญ ์์๋ธ๋ญ",
      url: "http://www.nwscc.or.kr/new/raise/dab3.php?pno=03020202&sort=itemname%20asc&sch_field=itemname&page=26&sch_bcode=&sch_age=&sch_value=&listcnt=8&mode=view&itemcode=NW02TC000012",
    },
    {
      name: "์์ด์คํฌ๋ฆผ ์นดํธ",
      url: "http://www.nwscc.or.kr/new/raise/dab3.php?pno=03020202&sort=itemname%20asc&sch_field=itemname&page=37&sch_bcode=&sch_age=&sch_value=&listcnt=8&mode=view&itemcode=NW02TJ000040",
    },
    {
      name: "ํํฐํํฐ ์์ผ์ผ์ดํฌ",
      url: "http://www.nwscc.or.kr/new/raise/dab3.php?pno=03020202&mode=view&itemcode=NW02TI000008",
    },
  ];

  console.info(`${products.length}๊ฐ์ ์ฅ๋๊ฐ ์ฌ๊ณ ๋ฅผ ์ฒดํฌํฉ๋๋ค.`);

  await Promise.all(products.map((product) => axios(product.url))).then(
    async (results) => {
      for (const [i, { data }] of results.entries()) {
        const $ = cheerio.load(data);
        // green class means available
        const availableCount = $(".__ico1.green").length;
        const { name, url } = products[i];
        const extra = extraText(availableCount);
        const text = `- [\`${name}\` ์(๋) ํ์ฌ \`${availableCount}\`๊ฐ ๋จ์์ด. ${extra}](${url})`;
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