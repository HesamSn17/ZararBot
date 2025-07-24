import { Telegraf, Scenes, session } from 'telegraf';
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
      if (!ctx.wizard.state.data) ctx.wizard.state.data = {};
      const persons = parseInt(ctx.message.text);
      if (isNaN(persons)) {
        return ctx.reply("تعداد نفرات باید عدد باشه:");
      }
      ctx.wizard.state.data.persons = persons;

      const { loss } = ctx.wizard.state.data;
      const commission = persons * 15;
      const net = commission - loss;

      if (net > 0) {
        ctx.reply(`رزرو به صرفه‌ست. سود خالص شما ${net} دلار هست.`);
      } else {
        ctx.reply(`این رزرو به‌صرفه نیست. ${Math.abs(net)} دلار ضرر داری بعد از دریافت کمیسیون.`);
      }

      return ctx.scene.leave();
    }
  );

  const stage = new Stage([calculationWizard]);

  bot.use(session());
  bot.use(stage.middleware());

  bot.command("start", (ctx) => ctx.scene.enter("calculation-wizard"));

  bot.launch();
};

export { startbot };
