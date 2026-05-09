import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'

config()

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

function apiKey(): string {
  const hex = '0123456789abcdef'
  let k = 'brm_'
  for (let i = 0; i < 48; i++) k += hex[Math.floor(Math.random() * 16)]
  return k
}

async function main() {
  console.log('Cleaning existing data...')
  await prisma.transaction.deleteMany()
  await prisma.invitation.deleteMany()
  await prisma.applicationMember.deleteMany()
  await prisma.feedback.deleteMany()
  await prisma.bugReport.deleteMany()
  await prisma.application.deleteMany()
  await prisma.oAuthAccount.deleteMany()
  await prisma.user.deleteMany()

  const hash = await bcrypt.hash('demo1234', 12)

  // --- Users ---
  const demo = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Alex Demo',
      password: hash,
      plan: 'PRO',
      subscriptionStatus: 'ACTIVE',
    },
  })

  const teammate = await prisma.user.create({
    data: {
      email: 'team@example.com',
      name: 'Sam Teammate',
      password: hash,
      plan: 'FREE',
    },
  })

  // --- Applications ---
  const web = await prisma.application.create({
    data: {
      name: 'E-Commerce Website',
      type: 'WEBSITE',
      description: 'Main customer-facing storefront serving global traffic.',
      apiKey: apiKey(),
      userId: demo.id,
    },
  })

  const android = await prisma.application.create({
    data: {
      name: 'Mobile Shopping App',
      type: 'ANDROID',
      description: 'Android companion app for on-the-go shopping.',
      apiKey: apiKey(),
      userId: demo.id,
    },
  })

  const ios = await prisma.application.create({
    data: {
      name: 'iOS Shopping App',
      type: 'IOS',
      description: 'Native iOS app for the Apple ecosystem.',
      apiKey: apiKey(),
      userId: demo.id,
    },
  })

  const desktop = await prisma.application.create({
    data: {
      name: 'Admin Dashboard',
      type: 'DESKTOP',
      description: 'Internal Electron-based tool for operations and admins.',
      apiKey: apiKey(),
      userId: demo.id,
    },
  })

  // Sam is an editor on the web app
  await prisma.applicationMember.create({
    data: { userId: teammate.id, applicationId: web.id, role: 'EDITOR' },
  })

  // Pending invitation for the iOS app
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  await prisma.invitation.create({
    data: {
      email: 'designer@example.com',
      role: 'VIEWER',
      token: 'invite_token_demo_abc123',
      status: 'PENDING',
      expiresAt,
      applicationId: ios.id,
      invitedById: demo.id,
    },
  })

  // --- Bug Reports: Web ---
  await prisma.bugReport.createMany({
    data: [
      {
        title: 'Checkout page crashes on payment submission',
        description: 'Clicking "Pay Now" makes the page unresponsive. Affects ~15% of checkout attempts across all browsers.',
        status: 'OPEN',
        priority: 'CRITICAL',
        appVersion: '2.4.1',
        deviceInfo: 'Chrome 124 / Windows 11',
        stackTrace: `TypeError: Cannot read properties of undefined (reading 'paymentIntent')\n    at CheckoutForm.handleSubmit (checkout.tsx:87)\n    at HTMLFormElement.dispatchEvent (<anonymous>)`,
        reporterEmail: 'alice@customer.com',
        applicationId: web.id,
        createdAt: new Date('2026-05-08T09:15:00'),
      },
      {
        title: 'Product images fail to load on Safari',
        description: 'Thumbnails show a broken image icon on Safari 17+. Chrome and Firefox are unaffected.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        appVersion: '2.4.1',
        deviceInfo: 'Safari 17.4 / macOS Sonoma',
        reporterEmail: 'bob@customer.com',
        applicationId: web.id,
        createdAt: new Date('2026-05-07T14:30:00'),
      },
      {
        title: 'Category filter has no effect on search results',
        description: 'All products show regardless of which category is selected in the dropdown. The URL query param does update correctly.',
        status: 'OPEN',
        priority: 'HIGH',
        appVersion: '2.4.0',
        deviceInfo: 'Firefox 125 / Ubuntu 22.04',
        reporterEmail: 'carol@customer.com',
        applicationId: web.id,
        createdAt: new Date('2026-05-06T11:00:00'),
      },
      {
        title: 'Cart badge disappears after page refresh',
        description: 'The cart icon badge resets to zero on refresh even though items are still in the cart session.',
        status: 'RESOLVED',
        priority: 'MEDIUM',
        appVersion: '2.3.9',
        deviceInfo: 'Chrome 123 / macOS',
        reporterEmail: 'dave@customer.com',
        applicationId: web.id,
        createdAt: new Date('2026-05-02T08:00:00'),
      },
      {
        title: 'Expired coupon codes still apply discount',
        description: 'The checkout form accepts expired codes and shows the discount. The API rejects it but UX flow is broken.',
        status: 'OPEN',
        priority: 'MEDIUM',
        appVersion: '2.4.1',
        deviceInfo: 'Edge 124 / Windows 10',
        reporterEmail: 'eve@customer.com',
        applicationId: web.id,
        createdAt: new Date('2026-05-05T16:45:00'),
      },
      {
        title: 'Wishlist tooltip overlaps navigation bar',
        description: 'At 1024px viewport width, the wishlist icon tooltip bleeds over the top nav.',
        status: 'CLOSED',
        priority: 'LOW',
        appVersion: '2.3.8',
        deviceInfo: 'Chrome 122 / Windows 10',
        applicationId: web.id,
        createdAt: new Date('2026-04-28T10:00:00'),
      },
    ],
  })

  // --- Bug Reports: Android ---
  await prisma.bugReport.createMany({
    data: [
      {
        title: 'App crashes on startup on Android 14 (Samsung)',
        description: 'After the Android 14 update, the app crashes immediately at launch on Samsung Galaxy S-series devices.',
        status: 'OPEN',
        priority: 'CRITICAL',
        appVersion: '3.1.2',
        deviceInfo: 'Samsung Galaxy S24 / Android 14',
        stackTrace: `FATAL EXCEPTION: main\nProcess: com.example.shopping, PID: 4823\njava.lang.RuntimeException: Unable to start activity\n    at android.app.ActivityThread.performLaunchActivity(ActivityThread.java:3782)\nCaused by: java.lang.NullPointerException: Attempt to invoke virtual method on a null object`,
        reporterEmail: 'frank@customer.com',
        applicationId: android.id,
        createdAt: new Date('2026-05-08T07:00:00'),
      },
      {
        title: 'Push notifications not delivered in battery saver mode',
        description: 'Order status notifications fail to arrive when battery saver is active. Affects Android 12+.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        appVersion: '3.1.2',
        deviceInfo: 'Pixel 7 / Android 13',
        reporterEmail: 'grace@customer.com',
        applicationId: android.id,
        createdAt: new Date('2026-05-07T12:00:00'),
      },
      {
        title: 'Dark mode text contrast fails WCAG AA in cart',
        description: 'Cart item names use #767676 text on a #1A1A1A background — contrast ratio 3.1:1, below the 4.5:1 AA requirement.',
        status: 'OPEN',
        priority: 'MEDIUM',
        appVersion: '3.1.1',
        deviceInfo: 'OnePlus 12 / Android 14',
        applicationId: android.id,
        createdAt: new Date('2026-05-04T09:30:00'),
      },
      {
        title: 'Scroll position resets when navigating back from PDP',
        description: 'After tapping a product and pressing Back, the list scrolls to top instead of restoring position.',
        status: 'RESOLVED',
        priority: 'MEDIUM',
        appVersion: '3.0.8',
        deviceInfo: 'Various / Android 12+',
        applicationId: android.id,
        createdAt: new Date('2026-04-20T14:00:00'),
      },
    ],
  })

  // --- Bug Reports: iOS ---
  await prisma.bugReport.createMany({
    data: [
      {
        title: 'Face ID authentication fails on first attempt ~30%',
        description: 'Biometric login succeeds on retry but the first attempt fails more than expected, forcing password entry.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        appVersion: '3.1.2',
        deviceInfo: 'iPhone 15 Pro / iOS 17.4',
        reporterEmail: 'henry@customer.com',
        applicationId: ios.id,
        createdAt: new Date('2026-05-08T10:00:00'),
      },
      {
        title: 'Keyboard covers submit button on iPhone SE',
        description: 'The soft keyboard obscures "Place Order" on small screens, making checkout impossible without dismissing it first.',
        status: 'OPEN',
        priority: 'HIGH',
        appVersion: '3.1.2',
        deviceInfo: 'iPhone SE 3rd gen / iOS 17.3',
        reporterEmail: 'iris@customer.com',
        applicationId: ios.id,
        createdAt: new Date('2026-05-06T15:20:00'),
      },
      {
        title: 'App icon badge count not clearing after opening notifications',
        description: 'Red badge persists after the user reads all notifications. Requires force-quitting the app to reset.',
        status: 'RESOLVED',
        priority: 'LOW',
        appVersion: '3.1.0',
        deviceInfo: 'iPhone 14 / iOS 17',
        applicationId: ios.id,
        createdAt: new Date('2026-04-25T08:00:00'),
      },
    ],
  })

  // --- Bug Reports: Desktop ---
  await prisma.bugReport.createMany({
    data: [
      {
        title: 'CSV export silently truncates descriptions > 255 chars',
        description: 'Long product descriptions are cut off without warning when exporting. Data loss occurs silently.',
        status: 'OPEN',
        priority: 'MEDIUM',
        appVersion: '1.8.0',
        deviceInfo: 'Windows 11 / Electron 29',
        reporterEmail: 'jack@internal.com',
        applicationId: desktop.id,
        createdAt: new Date('2026-05-07T11:00:00'),
      },
      {
        title: 'Bulk status update times out for > 100 orders',
        description: 'Selecting more than 100 orders and applying a bulk action triggers a 30s timeout. Smaller batches succeed.',
        status: 'OPEN',
        priority: 'HIGH',
        appVersion: '1.8.0',
        deviceInfo: 'macOS Sonoma / Electron 29',
        stackTrace: `Error: Request timeout after 30000ms\n    at TimeoutError (/app/api/client.js:142)\n    at processOrders (/app/features/orders/bulk.js:67)`,
        reporterEmail: 'kate@internal.com',
        applicationId: desktop.id,
        createdAt: new Date('2026-05-05T13:00:00'),
      },
    ],
  })

  // --- Feedback: Web ---
  await prisma.feedback.createMany({
    data: [
      {
        title: 'Love the recommendation section!',
        message: 'The new product recommendation carousel on the homepage helped me discover items I never would have found. Really thoughtful feature.',
        type: 'COMPLIMENT',
        status: 'READ',
        rating: 5,
        reporterEmail: 'happy@customer.com',
        appVersion: '2.4.1',
        applicationId: web.id,
        createdAt: new Date('2026-05-08T08:00:00'),
      },
      {
        title: 'Please add a clothing size guide',
        message: 'A size chart on clothing product pages would be really helpful. I always struggle picking the right size and end up returning items.',
        type: 'SUGGESTION',
        status: 'NEW',
        rating: 4,
        reporterEmail: 'suggest@customer.com',
        appVersion: '2.4.0',
        applicationId: web.id,
        createdAt: new Date('2026-05-07T10:00:00'),
      },
      {
        title: 'Shipping costs are way too high for small orders',
        message: 'Paying $8 shipping on a $15 order is unreasonable. Your competitors offer free shipping above $25. This is pushing me away.',
        type: 'COMPLAINT',
        status: 'NEW',
        rating: 2,
        reporterEmail: 'unhappy@customer.com',
        applicationId: web.id,
        createdAt: new Date('2026-05-06T17:00:00'),
      },
      {
        title: 'Checkout has too many steps',
        message: 'Four screens to place an order is too many. Consolidating to two steps would significantly improve conversion.',
        type: 'SUGGESTION',
        status: 'ARCHIVED',
        rating: 3,
        reporterEmail: 'checkout@customer.com',
        appVersion: '2.3.9',
        applicationId: web.id,
        createdAt: new Date('2026-04-30T09:00:00'),
      },
    ],
  })

  // --- Feedback: Android ---
  await prisma.feedback.createMany({
    data: [
      {
        title: 'Blazing fast app!',
        message: 'The app is incredibly smooth even on my 3-year-old phone. Loading times are impressive. 10/10.',
        type: 'COMPLIMENT',
        status: 'READ',
        rating: 5,
        appVersion: '3.1.2',
        applicationId: android.id,
        createdAt: new Date('2026-05-07T06:00:00'),
      },
      {
        title: 'Add fingerprint login please',
        message: 'Typing a password every time is tedious. Please add biometric / fingerprint login — most of your competitors already have it.',
        type: 'SUGGESTION',
        status: 'NEW',
        rating: 4,
        reporterEmail: 'suggest2@customer.com',
        appVersion: '3.1.1',
        applicationId: android.id,
        createdAt: new Date('2026-05-03T14:00:00'),
      },
    ],
  })

  // --- Transactions ---
  await prisma.transaction.createMany({
    data: [
      {
        userId: demo.id,
        amount: 2900,
        currency: 'usd',
        status: 'SUCCEEDED',
        plan: 'PRO',
        paymentId: 'xendit_pay_seed_001',
        createdAt: new Date('2026-04-01'),
      },
      {
        userId: demo.id,
        amount: 2900,
        currency: 'usd',
        status: 'SUCCEEDED',
        plan: 'PRO',
        paymentId: 'xendit_pay_seed_002',
        createdAt: new Date('2026-05-01'),
      },
    ],
  })

  console.log('\nSeed complete!')
  console.log('─────────────────────────────')
  console.log('Login credentials:')
  console.log('  Email:    demo@example.com')
  console.log('  Password: demo1234')
  console.log()
  console.log('Secondary account:')
  console.log('  Email:    team@example.com')
  console.log('  Password: demo1234')
  console.log('─────────────────────────────')
  console.log(`Users:        2`)
  console.log(`Applications: 4  (web, android, ios, desktop)`)
  console.log(`Bug reports:  ${6 + 4 + 3 + 2}`)
  console.log(`Feedback:     ${4 + 2}`)
  console.log(`Transactions: 2`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
