import { io } from "socket.io-client";
import chalk from "chalk";

const socket = io("https://skinport.com", {
  transports: ["websocket"],
});

type Sale = {
  saleId: number;
  shortId: string;
  productId: number;
  assetId: number;
  itemId: number;
  appid: number;
  steamid: string;
  url: string;
  family: string;
  family_localized: string;
  name: string;
  title: string;
  text: string;
  marketName: string;
  marketHashName: string;
  color: string;
  bgColor: null | string;
  image: string;
  classid: string;
  assetid: string;
  lock: string;
  version: string;
  versionType: string;
  stackAble: boolean;
  suggestedPrice: number;
  salePrice: number;
  currency: string;
  saleStatus: string;
  saleType: string;
  category: string;
  category_localized: string;
  subCategory: string;
  subCategory_localized: string;
  pattern: number;
  finish: number;
  customName: string;
  wear: number;
  link: string;
  type: string;
  exterior: string;
  quality: string;
  rarity: string;
  rarity_localized: string;
  rarityColor: string;
  collection: string;
  collection_localized: string;
  stickers: [];
  canHaveScreenshots: true;
  screenshots: string[];
  souvenir: boolean;
  stattrak: boolean;
  tags: { name: string; name_localized: string }[];
  ownItem: boolean;
};

type SaleFeedEvent = {
  eventType: string;
  sales: Sale[];
};

// Listen to the Sale Feed
socket.on("saleFeed", (result: SaleFeedEvent) => {
  for (let i = 0; i < result.sales.length; i++) {
    const item = result.sales[i];
    const name = chalk.hex(item.rarityColor)(item.marketHashName);
    const price = (item.salePrice / 100).toFixed(2);
    const suggestedPrice = (item.suggestedPrice / 100).toFixed(2);
    const currency = item.currency;
    const link = `https://skinport.com/item/${item.url}/${item.saleId}`;
    let screenshot_url = `https://community.cloudflare.steamstatic.com/economy/image/${item.image}`;

    if (item.screenshots.length > 0) {
      screenshot_url = `https://cdn.skinport.com/cdn-cgi/image/width=1024,height=1024,fit=pad,format=webp,quality=85,background=transparent/images/screenshots/${item.assetId}/${item.screenshots[0]}.png`;
    }

    const difference =
      ((item.suggestedPrice - item.salePrice) / item.suggestedPrice) * 100;

    let message = "";

    // if (item.category !== "Knife") {
    //   continue;
    // }

    // if (!item.title.includes("M9") && !item.title.includes("Karambit")) {
    //   continue;
    // }

    // if (
    //   !item.title.includes("Doppler") &&
    //   !item.title.includes("Tiger Tooth")
    // ) {
    //   continue;
    // }

    if (difference > 20) {
      fetch("https://ntfy.hysm.io/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic {{PASTE_HERE}}",
          Attach: screenshot_url,
        },
        body: JSON.stringify({
          topic: "skinport",
          message: `Found ${item.marketHashName} for ${difference.toFixed(
            0
          )}% cheaper than suggested price.`,
          title: `${difference.toFixed(0)}% off ${item.marketHashName}`,
          // tags: ["warning", "cd"],
          // priority: 4,
          icon: `https://skinport.com/favicon.ico`,
          // filename: "diskspace.jpg",
          //
          click: link,
          // actions: [
          //   {
          //     action: "view",
          //     label: "Admin panel",
          //     url: "https://filesrv.lan/admin",
          //   },
          // ],
          filename: "playside.webp",
          attach: screenshot_url,
        }),
      })
        .then((result) => {
          if (result.status !== 200) console.error(result);
        })
        .catch(console.error);
    }

    const differenceString =
      difference > 0
        ? chalk.green(`+${difference.toFixed(2)}`)
        : chalk.red(difference.toFixed(2));

    // console.log(item);
    console.log(
      `${
        result.eventType === "sold" ? "💸" : "🛒"
      } ${name} - $${price} ($${suggestedPrice}) ${currency} | ${differenceString}`
    );
    console.log(`    Link: ${link}`);
    console.log(`    Screenshot: ${screenshot_url}`);
  }
  // console.log();
});

// Join Sale Feed with paramters.
socket.emit("saleFeedJoin", { currency: "AUD", locale: "en", appid: 730 });
