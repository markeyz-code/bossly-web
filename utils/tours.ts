export interface TourStep {
  route: string;
  target?: string;
  title: string;
  body: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface Tour {
  id: string;
  title: string;
  description: string;
  duration: string;
  color: string;
  steps: TourStep[];
}

export const TOURS: Tour[] = [
  {
    id: 'getting-started',
    title: 'Run your first week',
    description: 'The four screens that turn a side hustle into a business you can see.',
    duration: '90 seconds',
    color: '#FF5A1F',
    steps: [
      { route: '/app', target: 'dashboard-stats', title: 'Your truth, in four numbers', body: 'Revenue, real profit, money owed to you and stock value. Everything else on this dashboard is detail.', placement: 'bottom' },
      { route: '/app/sales/new', target: 'sale-form', title: 'Record a sale in seconds', body: 'Pick the product, quantity and what the customer paid. Bossly handles stock, profit and any debt.', placement: 'right' },
      { route: '/app/products/new', target: 'product-form', title: 'Your catalogue powers everything', body: 'One product becomes a storefront listing, a stock record and a line in every report.', placement: 'right' },
      { route: '/app/website', target: 'website-templates', title: 'Pick a look and publish', body: 'Your free website is built from the same catalogue. No coding, no designer.', placement: 'left' },
      { route: '/app/settings?tab=billing', target: 'billing-plans', title: 'Upgrade only when it pays', body: 'Start free. Move to Hustle or Boss when you need more room, a custom domain or exports.', placement: 'top' },
    ],
  },
  {
    id: 'money',
    title: 'Know your money',
    description: 'Profit, debts and expenses — the three places money hides.',
    duration: '60 seconds',
    color: '#0B3D2E',
    steps: [
      { route: '/app/reports', target: 'reports-summary', title: 'Reports that answer questions', body: 'See revenue, profit, expenses and best sellers for any period. Export when you need proof.', placement: 'bottom' },
      { route: '/app/debts', target: 'debts-list', title: 'Debts with a memory', body: 'Every unpaid balance has a customer, a due date and a reminder button. Stop chasing from memory.', placement: 'bottom' },
      { route: '/app/expenses', target: 'expenses-page', title: 'Expenses make profit honest', body: 'Transport, packaging, data and stock costs belong here. It takes ten seconds.', placement: 'right' },
    ],
  },
  {
    id: 'whatsapp',
    title: 'Sell from WhatsApp',
    description: 'Link your number, paste chats and let the bot keep the records.',
    duration: '60 seconds',
    color: '#25D366',
    steps: [
      { route: '/app/orders/paste', target: 'paste-input', title: 'Paste a real conversation', body: 'Bossly pulls out names, items, quantities, prices and the delivery address. You review before anything is saved.', placement: 'right' },
      { route: '/app/settings?tab=whatsapp', target: 'whatsapp-link', title: 'Link your number', body: 'Generate a code and send LINK 123456 from your WhatsApp. Then record sales by messaging the bot.', placement: 'bottom' },
      { route: '/app/orders', target: 'orders-list', title: 'Nothing gets lost', body: 'Pasted chats, bot orders and website orders all land in the same pipeline.', placement: 'top' },
    ],
  },
];

export function getTour(id: string): Tour | undefined {
  return TOURS.find((tour) => tour.id === id);
}
