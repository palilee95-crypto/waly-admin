export interface PitchTemplate {
  id: string;
  title: string;
  category: 'onboarding' | 'pitch_fb' | 'pitch_retail' | 'standee_promo' | 'trial_nudge' | 'dormant' | 'quick_link';
  categoryLabel: string;
  language: 'bm' | 'en';
  description: string;
  text: string;
}

export const PITCH_TEMPLATES: PitchTemplate[] = [
  // --- BAHASA MELAYU (BM) TEMPLATES - NFC Focus ---
  {
    id: 'bm_fb_pitch',
    title: '🍽️ F&B Cold Pitch (Kad Cop NFC Kafe)',
    category: 'pitch_fb',
    categoryLabel: 'F&B Cold Pitch',
    language: 'bm',
    description: 'Tingkatkan repeat customer dengan Tap NFC kat kaunter bayaran.',
    text: `Hi {{owner_name}}! Saya {{agent_name}} dari RISEV. 👋

Tengok kedai {{merchant_name}} memang ngam tempatnya! Boss ada pakai kad cop fizikal lagi tak untuk customer repeat order/makan?

Sekarang orang malas nak simpan kad kertas. Guna Kad Cop Digital NFC RISEV, customer cuma **TAP phone kat Tag NFC kaunter** (atau scan QR), cop terus simpan dalam WhatsApp. Tak payah install app pape. 📱⚡

Boss boleh test tengok demo kat sini:
{{referral_link}}

Free trial 7 hari. Kalau Boss free, saya boleh singgah kedai bawa Tag NFC tunjuk demo 2 minit!`,
  },
  {
    id: 'bm_standee_promo',
    title: '🎁 Promosi Counter NFC Standee Percuma',
    category: 'standee_promo',
    categoryLabel: 'Free Standee Offer',
    language: 'bm',
    description: 'Tawaran acrylic NFC standee percuma bila daftar bawah ejen.',
    text: `Salam Boss {{owner_name}}! Tawaran percuma khas untuk kedai {{merchant_name}} 🎁

Kalau Boss register akaun RISEV minggu ni, saya bagi **FREE Acrylic Counter NFC Standee Set** (dengan Tag NFC terbina) untuk diletakkan kat kaunter bayaran.

Benda ni best sebab:
✅ Customer just TAP phone kat Standee NFC untuk kumpul cop (xyah download app)
✅ Auto hantar mesej voucher kat WhatsApp customer bila dorang dah lama tak datang
✅ Kaunter kedai nampak lebih hi-tech, modern & kemas

Boleh try register free terus kat link ni:
{{referral_link}}

Nanti mesej saya {{agent_name}} balik bila dah register, saya tolong hantarkan Standee NFC percuma tu!`,
  },
  {
    id: 'bm_retail_pitch',
    title: '💈 Barber / Salon / Retail NFC Pitch',
    category: 'pitch_retail',
    categoryLabel: 'Retail & Service Pitch',
    language: 'bm',
    description: 'Sesuai untuk barber, salon, car wash & kedai runcit.',
    text: `Salam {{owner_name}}, {{agent_name}} sini dari RISEV Loyalty. ✂️🚗

Customer {{merchant_name}} selalu terlupa nak bawa kad cop kertas bila datang potong rambut / servis tak?

Bila guna Kad Cop NFC RISEV:
1. Customer just **TAP phone kat Standee NFC kaunter** (atau scan QR).
2. Sistem auto WhatsApp remind customer bila dorang dah sebulan tak mai kedai.
3. Elak isu kad hilang atau cop kertas kena tiru.

Cuba percuma 7 hari dulu Boss:
{{referral_link}}

Boleh WhatsApp saya kalau ada soalan ya!`,
  },
  {
    id: 'bm_onboarding',
    title: '🚀 Bantuan Setup Onboarding NFC',
    category: 'onboarding',
    categoryLabel: 'Onboarding Assist',
    language: 'bm',
    description: 'Bantuan mesra untuk peniaga yang baru daftar.',
    text: `Hi {{owner_name}}! 🚀

Tengok Boss dah register akaun RISEV untuk {{merchant_name}}. Mantap!

Boss dah sempat nak set reward cop NFC (contoh: Tap 5x = Free 1 Drink/Servis)? 

Kalau belum sempat, jangan risau — saya {{agent_name}} boleh tolong kemaskan & designkan kad cop NFC kedai Boss secara percuma je. 

Boleh klik link profile Boss kat sini:
{{referral_link}}

Bila Boss free 5 minit untuk saya tolong setupkan?`,
  },
  {
    id: 'bm_trial_nudge',
    title: '⏰ Peringatan Percubaan 7 Hari',
    category: 'trial_nudge',
    categoryLabel: 'Trial Nudge',
    language: 'bm',
    description: 'Peringatan mesra tempoh percubaan nak habis.',
    text: `Hi {{owner_name}}, nak remind sikit free trial RISEV kedai {{merchant_name}} dah nak habis tak lama lagi ⏳

Sayang kalau customer tengah seronok tap NFC kumpul cop terhenti separuh jalan. 

Boleh proceed activate plan kedai Boss kat sini:
{{referral_link}}

Kalau Boss nak tanya pasal pakej bulanan, terus mesej saya {{agent_name}} bila-bila masa k!`,
  },
  {
    id: 'bm_dormant',
    title: '🔄 Kempen Re-engagement Kedai Dormant',
    category: 'dormant',
    categoryLabel: 'Re-engagement',
    language: 'bm',
    description: 'Tarik balik kedai yang dah lama tak imbas cop.',
    text: `Salam {{owner_name}}, perasan kedai {{merchant_name}} agak senyap sikit bab imbasan/tap NFC minggu ni.

Boss dah try guna feature **Auto WhatsApp Follow-Up** baru tu? Feature ni padu — dia auto-blast mesej voucher kat customer yang dah lama tak tap NFC kat kedai.

Boleh cek kat dashboard kedai Boss:
{{referral_link}}

Kalau Boss perlukan idea promosi/diskaun nak bagi customer datang balik, roger saya {{agent_name}} okay!`,
  },
  {
    id: 'bm_quick_link',
    title: '⚡ Elevators Pitch & Link Drop',
    category: 'quick_link',
    categoryLabel: 'Quick Pitch',
    language: 'bm',
    description: 'Mesej ringkas 2 baris untuk perbualan WhatsApp yang pantas.',
    text: `Salam {{owner_name}}! Nak modenkan kad cop {{merchant_name}} guna Tap NFC terus ke WhatsApp customer tanpa app? Boleh try free trial 7 hari kat sini, link ejen {{agent_name}}: {{referral_link}}`,
  },

  // --- ENGLISH (EN) TEMPLATES - NFC Focus ---
  {
    id: 'en_fb_pitch',
    title: '🍽️ F&B Cold Pitch (NFC Stamp Cards)',
    category: 'pitch_fb',
    categoryLabel: 'F&B Cold Pitch',
    language: 'en',
    description: 'Focus on boosting repeat diners with NFC Tap stamp cards.',
    text: `Hi {{owner_name}}, I'm {{agent_name}} from RISEV. 👋

I noticed {{merchant_name}} has a great crowd! Quick question: Are you currently using a paper stamp card system to get diners to return?

With RISEV NFC Digital Stamps, your customers don't need to install any apps — they simply **TAP their phone on the NFC Counter Standee** (or scan QR) to collect stamps right in WhatsApp! 📱⚡

Try our 5-second demo or register your shop for free here:
{{referral_link}}

Do you have 2 minutes for a quick demo? I can drop by with an NFC Tag!`,
  },
  {
    id: 'en_standee_promo',
    title: '🎁 Free Counter NFC Standee Promotion',
    category: 'standee_promo',
    categoryLabel: 'Free Standee Offer',
    language: 'en',
    description: 'Free acrylic NFC standee incentive offer when registering under sales agent code.',
    text: `Hi {{owner_name}}! Exclusive RISEV Merchant Partner Offer 🎁

Register your shop {{merchant_name}} this week and get a **FREE Acrylic Counter NFC Standee Set** (with built-in smart NFC tag) custom made for your checkout counter!

Key benefits:
✅ Zero app downloads required — customers just TAP their phone!
✅ Automatic WhatsApp re-engagement messages for missing customers
✅ Modern & premium counter setup

Register your free merchant profile here:
{{referral_link}}

Contact me {{agent_name}} to claim your free NFC standee!`,
  },
  {
    id: 'en_retail_pitch',
    title: '💈 Barber / Salon / Service NFC Pitch',
    category: 'pitch_retail',
    categoryLabel: 'Retail & Service Pitch',
    language: 'en',
    description: 'Ideal for barbershops, beauty salons, car washes & retail boutiques.',
    text: `Hi {{owner_name}}, I'm {{agent_name}} from RISEV Loyalty. ✂️🚗

Are your customers constantly losing or forgetting their paper stamp cards when visiting {{merchant_name}}?

With RISEV NFC Digital Stamps:
1. Customers simply **TAP their phone on the NFC counter tag** (or scan QR).
2. System automatically sends WhatsApp reminders to inactive customers.
3. No more lost or forged paper cards.

Start your 7-day free trial now:
{{referral_link}}

Thanks Boss!`,
  },
  {
    id: 'en_onboarding',
    title: '🚀 NFC Onboarding & Setup Assistance',
    category: 'onboarding',
    categoryLabel: 'Onboarding Assist',
    language: 'en',
    description: 'For newly registered merchants who have not activated their NFC stamp goal yet.',
    text: `Hi {{owner_name}}! 🚀

I noticed you recently registered {{merchant_name}} on RISEV. Congratulations!

Do you need any help setting up your NFC loyalty reward goals (e.g., Tap 5 Times = Free Drink/Service) or customizing your digital card design?

I'm {{agent_name}}, your dedicated partner agent. I can guide you through a 3-minute setup:
{{referral_link}}

Let me know when you're free for a quick walkthrough!`,
  },
  {
    id: 'en_trial_nudge',
    title: '⏰ 7-Day Free Trial Expiry Reminder',
    category: 'trial_nudge',
    categoryLabel: 'Trial Nudge',
    language: 'en',
    description: 'Reminder for merchants whose 7-day trial is nearing expiration.',
    text: `Hi {{owner_name}}, your RISEV free trial for {{merchant_name}} has a few days left! ⏳

Keep your customer NFC stamp collection uninterrupted by activating your store plan today. Enjoy:
• Unlimited NFC & QR stamp transactions
• Monthly WhatsApp campaign broadcasts
• Repeat customer analytics

Log in and activate here:
{{referral_link}}

Have questions about pricing plans? I'm {{agent_name}} and I'm here to help!`,
  },
  {
    id: 'en_dormant',
    title: '🔄 Dormant Store Re-engagement',
    category: 'dormant',
    categoryLabel: 'Re-engagement',
    language: 'en',
    description: 'For active merchants who haven’t logged stamp transactions in over 7 days.',
    text: `Hi {{owner_name}}, we noticed {{merchant_name}} hasn't logged NFC stamp transactions in the past week.

Have you tried our new **Auto WhatsApp Win-Back** feature? It automatically sends discount vouchers to customers who haven't tapped their phone at your cashier counter in a while.

Check your RISEV merchant portal:
{{referral_link}}

Let me know if you'd like me to drop by to test your counter NFC standee!`,
  },
  {
    id: 'en_quick_link',
    title: '⚡ Quick Pitch & Link Drop',
    category: 'quick_link',
    categoryLabel: 'Quick Pitch',
    language: 'en',
    description: 'Short 2-liner elevator pitch for fast WhatsApp chats.',
    text: `Hi {{owner_name}}! Upgrade {{merchant_name}}'s stamp cards to WhatsApp NFC digital stamps without apps. Register free under agent {{agent_name}}: {{referral_link}}`,
  },
];

export const renderTemplateText = (
  templateText: string,
  data: {
    merchantName?: string;
    ownerName?: string;
    referralLink: string;
    agentName?: string;
  }
): string => {
  const mName = data.merchantName?.trim() || 'kedai Boss';
  let oName = data.ownerName?.trim();
  if (!oName && data.merchantName) {
    oName = data.merchantName.split("'")[0].split(' ')[0];
  }
  if (!oName || oName.toLowerCase() === 'kedai boss') {
    oName = 'Boss';
  }

  const agentName = data.agentName?.trim() || 'Ejen RISEV';

  let result = templateText
    .replaceAll('{{merchant_name}}', mName)
    .replaceAll('{{owner_name}}', oName)
    .replaceAll('{{referral_link}}', data.referralLink)
    .replaceAll('{{agent_name}}', agentName);

  return result.replaceAll('kedai kedai Boss', 'kedai Boss');
};
