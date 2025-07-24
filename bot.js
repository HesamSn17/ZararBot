import { Telegraf, Scenes, session,Markup  } from 'telegraf';
import 'dotenv/config';

const { WizardScene, Stage } = Scenes;

const bot = new Telegraf(process.env.BOT_TOKEN);

const startbot = () => {
  const calculationWizard = new WizardScene(
    "calculation-wizard",

    async (ctx) => {
      ctx.reply("مبلغ خرید را وارد کنید:");
      ctx.wizard.state.data = {};
      return ctx.wizard.next();
    },

    async (ctx) => {
      if (!ctx.wizard.state.data) ctx.wizard.state.data = {};
      const buy = parseFloat(ctx.message.text);
      if (isNaN(buy)) {
        return ctx.reply("لطفاً یک عدد معتبر وارد کن:");
      }
      ctx.wizard.state.data.buyPrice = buy;
      ctx.reply("مبلغ فروش را وارد کنید:");
      return ctx.wizard.next();
    },

    async (ctx) => {
      if (!ctx.wizard.state.data) ctx.wizard.state.data = {};
      const sell = parseFloat(ctx.message.text);
      if (isNaN(sell)) {
        return ctx.reply("عدد معتبر وارد کن لطفاً:");
      }
      ctx.wizard.state.data.sellPrice = sell;
      ctx.reply("تعداد شب‌های اقامت را وارد کنید:");
      return ctx.wizard.next();
    },

    async (ctx) => {
      if (!ctx.wizard.state.data) ctx.wizard.state.data = {};
      const nights = parseInt(ctx.message.text);
      if (isNaN(nights)) {
        return ctx.reply("تعداد شب‌ها باید عدد باشه:");
      }
      ctx.wizard.state.data.nights = nights;

      const { buyPrice, sellPrice } = ctx.wizard.state.data;

      ctx.wizard.state.data.totalBuy = buyPrice * nights;
      ctx.wizard.state.data.totalSell = sellPrice * nights;

      const loss = ctx.wizard.state.data.totalBuy - ctx.wizard.state.data.totalSell;
      ctx.wizard.state.data.loss = loss;

      if (loss > 0) {
        ctx.reply(`شما ${loss} دلار ضرر می‌کنی.`);
      } else {
        ctx.reply(`هیچ ضرری نداری. شاید سودم داشته باشی.`);
      }

      ctx.reply("تعداد نفرات را وارد کن:");
      return ctx.wizard.next();
    },

    
    
async (ctx) => {
  ctx.wizard.state.data.persons = parseInt(ctx.message.text);
  const { loss, persons } = ctx.wizard.state.data;
  const commission = persons * 15;

  const net = commission - loss;

  if (net > 0) {
    await ctx.reply(`رزرو به صرفه‌ست. سود خالص شما ${net} دلار هست.`);
  } else {
    await ctx.reply(`این رزرو به‌صرفه نیست. ${Math.abs(net)} دلار ضرر داری بعد از دریافت کمیسیون.`);
  }

  // ارسال دکمه برای شروع مجدد
  await ctx.reply(
    "می‌خوای دوباره حساب کنیم؟",
    Markup.inlineKeyboard([
      Markup.button.callback("🔁 دوباره حساب کن", "restart_wizard"),
    ])
  );

  return ctx.scene.leave(); // از صحنه خارج می‌شه ولی منتظر کلیک می‌مونه
});


  const stage = new Stage([calculationWizard]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.command("start", (ctx) => ctx.scene.enter("calculation-wizard"));
bot.action("restart_wizard", async (ctx) => {
  await ctx.answerCbQuery(); // بسته شدن انیمیشن دکمه
  await ctx.scene.enter("calculation-wizard");
});
  bot.launch();
};

export { startbot };
