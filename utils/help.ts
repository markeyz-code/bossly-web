export interface HelpArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  body: string[];
}

export interface HelpCategory {
  key: string;
  label: string;
  description: string;
}

export const HELP_CATEGORIES: HelpCategory[] = [
  { key: 'start', label: 'Start here', description: 'Set up, record your first sale and understand the dashboard.' },
  { key: 'money', label: 'Money & profit', description: 'Costs, expenses, reports, exports and what the numbers mean.' },
  { key: 'customers', label: 'Customers & debts', description: 'Sell on credit, send reminders and get paid.' },
  { key: 'stock', label: 'Products & stock', description: 'Variants, restocks, low-stock thresholds and overselling.' },
  { key: 'website', label: 'Your website', description: 'Templates, media, publishing, domains and the embed widget.' },
  { key: 'whatsapp', label: 'WhatsApp', description: 'Paste chats, link your number, bot commands and summaries.' },
  { key: 'billing', label: 'Plans & referrals', description: 'Trials, upgrades, invoices and the affiliate programme.' },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'first-sale', category: 'start', title: 'Record your first sale',
    summary: 'The fastest path from “I sold something” to a profit number you can trust.',
    body: [
      'Tap Record sale in the top bar. Search for the product, choose the variant and set the quantity. If the customer paid in full, enter the amount paid and choose how they paid.',
      'If they paid part of the money, enter what they paid. Bossly creates the debt automatically against the customer’s phone number and keeps the balance visible on the Debts page.',
      'Every sale stores the cost price at that moment. That is what makes the profit figure real — later cost changes do not rewrite history.',
    ],
  },
  {
    id: 'profit', category: 'money', title: 'Why my profit is different from my cash',
    summary: 'Revenue, cost of goods, expenses and debt are four different things.',
    body: [
      'Revenue is the value of what you sold, whether or not the customer has paid yet. Cash is what actually entered your account.',
      'Profit = revenue − cost of goods sold − recorded expenses. If a customer still owes you, the sale counts toward revenue but the unpaid portion appears in Money owed to you.',
      'Record transport, packaging, data and other business costs as expenses. Otherwise your profit will look better than it really is.',
      'Use Reports → This month to compare periods. Export CSV or PDF when you need to show a partner, parent or investor.',
    ],
  },
  {
    id: 'debts', category: 'customers', title: 'Sell now, get paid later — safely',
    summary: 'How part payments, due dates and reminders work.',
    body: [
      'When you record a sale with less than the full amount paid, Bossly creates a debt with a due date. You can also create a customer and add a debt directly.',
      'Open Debts to see who owes you, how long it has been and what they have paid so far. Record a payment whenever money arrives.',
      'Use the WhatsApp reminder for a one-tap message, or send an email reminder if you have the customer’s email. Automatic reminders are optional in Settings → Alerts.',
      'When a debt is fully paid, it moves to Settled and the customer’s outstanding balance updates everywhere.',
    ],
  },
  {
    id: 'stock', category: 'stock', title: 'Stock, variants and low-stock alerts',
    summary: 'Keep counts honest without doing inventory every night.',
    body: [
      'Each product has one or more variants (for example Black / M). Stock is tracked per variant, not just per product.',
      'Sales and confirmed orders reduce stock automatically. Cancellations and voids put it back. Use Stock adjustments for damaged items, personal use or a recount.',
      'Set a low-stock threshold per variant. When stock reaches it, Bossly nudges you in-app and can email or WhatsApp you. Alerts are debounced so you are not spammed.',
      'Bossly refuses to oversell. If two people try to buy the last item, only one order can reserve it.',
    ],
  },
  {
    id: 'whatsapp-paste', category: 'whatsapp', title: 'Turn a WhatsApp chat into an order',
    summary: 'Copy the conversation, paste it, review, confirm.',
    body: [
      'Open Orders → Paste chat. Paste the real conversation — names, quantities, prices, delivery details and all.',
      'Bossly extracts the customer, phone, delivery address, items and amounts, then matches items to your catalogue. Anything it cannot match is flagged instead of guessed.',
      'Review every line, fix quantities or prices, then create the order. The original message is kept as context for you and your staff.',
      'The same parser powers the WhatsApp bot when you link your number.',
    ],
  },
  {
    id: 'whatsapp-link', category: 'whatsapp', title: 'Link your WhatsApp number',
    summary: 'Record sales by messaging the Bossly number.',
    body: [
      'Go to Settings → WhatsApp → Get link code. Send LINK 123456 from your WhatsApp to the Bossly platform number shown on the page.',
      'Once linked, send a message like “sold 2 hoodies 5000, Tola owes 2000”. The bot replies with a summary and waits for YES.',
      'Send UNDO within 15 minutes to reverse a mistaken sale. Stock, the debt and the receipt are reversed together.',
      'The bot only works for linked numbers. You can unlink a number at any time from the same page.',
    ],
  },
  {
    id: 'website', category: 'website', title: 'Publish a website that sells',
    summary: 'Pick a template, add real photos and share one link.',
    body: [
      'Your catalogue is already the website. In My website → Design, pick a template and set your brand colour. In Media, add a hero video, story image and a lookbook.',
      'Use Content to write a tagline people remember, and SEO to control what appears when the link is shared on WhatsApp or Google.',
      'Publish when the preview looks right. Share the bossly.ng link everywhere; connect a custom domain on the Boss plan.',
      'The embed tab gives you a small script for an existing website or link-in-bio page.',
    ],
  },
  {
    id: 'referrals', category: 'billing', title: 'Earn from referring other businesses',
    summary: 'Share your code, earn 20% of a referred business’s first payment.',
    body: [
      'Open Refer & earn to get your personal code and link. Share it with another student business owner.',
      'When they sign up with your link and make their first subscription payment, you earn 20% of that payment. There is one commission per business.',
      'Commissions are held for 7 days, then become available to withdraw. The minimum payout is ₦1,000.',
      'Add your Nigerian bank details, request a payout, and track it from the same page. Bossly pays approved requests manually.',
    ],
  },
  {
    id: 'offline', category: 'start', title: 'What happens when the network dies',
    summary: 'Sales and expenses are saved on your phone.',
    body: [
      'If a sale or expense cannot reach the server, Bossly keeps it on this device and shows an offline banner.',
      'When your connection returns, queued items sync in order. Stock is checked at sync time; if an item has sold out, the entry is marked “needs attention” instead of silently failing.',
      'Open Offline queue to retry or delete entries. The queue is per device, so use the same phone and browser.',
    ],
  },
  {
    id: 'plans', category: 'billing', title: 'Trials, plans and what is included',
    summary: 'No data is ever locked when a trial ends.',
    body: [
      'New businesses start on a 14-day Hustle trial. When it ends, you move to Free automatically. Products, sales, customers and your website stay intact.',
      'Free includes 25 products, the storefront, WhatsApp links and profit reporting. Hustle adds more products, staff, exports and templates. Boss adds a custom domain and priority support.',
      'Upgrade from Settings → Billing. Paystack handles the payment; a receipt appears in your email.',
      'If you have a coupon, enter it before choosing a plan.',
    ],
  },
];
