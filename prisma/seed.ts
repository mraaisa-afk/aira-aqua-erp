import { PrismaClient, UserRole, AccType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Super Admin
  const hash = await bcrypt.hash('Admin@1234', 12)
  await prisma.user.upsert({
    where: { email: 'admin@aira.app' },
    update: {},
    create: { name: 'Super Admin', email: 'admin@aira.app', password: hash, role: UserRole.SUPER_ADMIN, isActive: true },
  })
  console.log('Super Admin: admin@aira.app / Admin@1234')

  // Default Warehouse
  await prisma.warehouse.upsert({
    where: { name: 'প্রধান গুদাম' },
    update: {},
    create: { name: 'প্রধান গুদাম', address: 'ঢাকা, বাংলাদেশ' },
  })

  // Default Units
  const units = [
    { name: 'পিস', symbol: 'pcs' },
    { name: 'কেজি', symbol: 'kg' },
    { name: 'লিটার', symbol: 'ltr' },
    { name: 'মিটার', symbol: 'mtr' },
    { name: 'বাক্স', symbol: 'box' },
  ]
  for (const u of units) {
    await prisma.unit.upsert({ where: { symbol: u.symbol }, update: {}, create: u })
  }

  // Default Categories
  const cats = ['কাঁচামাল', 'তৈরি পণ্য', 'প্যাকেজিং', 'যন্ত্রপাতি', 'অন্যান্য']
  for (const name of cats) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } })
  }

  // Chart of Accounts
  const coa = [
    { code: '1000', name: 'সম্পদ (Assets)', type: AccType.ASSET, parentId: null },
    { code: '1100', name: 'নগদ ও ব্যাংক', type: AccType.ASSET },
    { code: '1101', name: 'নগদ তহবিল', type: AccType.ASSET },
    { code: '1102', name: 'ব্যাংক হিসাব', type: AccType.ASSET },
    { code: '1200', name: 'প্রাপ্য হিসাব', type: AccType.ASSET },
    { code: '1300', name: 'মজুদ পণ্য', type: AccType.ASSET },
    { code: '1400', name: 'অগ্রিম ও আমানত', type: AccType.ASSET },
    { code: '2000', name: 'দায় (Liabilities)', type: AccType.LIABILITY, parentId: null },
    { code: '2100', name: 'প্রদেয় হিসাব', type: AccType.LIABILITY },
    { code: '2200', name: 'স্বল্পমেয়াদী ঋণ', type: AccType.LIABILITY },
    { code: '2300', name: 'অন্যান্য দায়', type: AccType.LIABILITY },
    { code: '3000', name: 'মালিকানা স্বত্ব (Equity)', type: AccType.EQUITY, parentId: null },
    { code: '3100', name: 'মূলধন', type: AccType.EQUITY },
    { code: '3200', name: 'সংরক্ষিত আয়', type: AccType.EQUITY },
    { code: '4000', name: 'আয় (Income)', type: AccType.INCOME, parentId: null },
    { code: '4100', name: 'বিক্রয় আয়', type: AccType.INCOME },
    { code: '4200', name: 'অন্যান্য আয়', type: AccType.INCOME },
    { code: '5000', name: 'ব্যয় (Expenses)', type: AccType.EXPENSE, parentId: null },
    { code: '5100', name: 'ক্রয় ব্যয়', type: AccType.EXPENSE },
    { code: '5200', name: 'পরিচালনা ব্যয়', type: AccType.EXPENSE },
    { code: '5300', name: 'বেতন ও মজুরি', type: AccType.EXPENSE },
    { code: '5400', name: 'ভাড়া ব্যয়', type: AccType.EXPENSE },
    { code: '5500', name: 'অন্যান্য ব্যয়', type: AccType.EXPENSE },
  ]

  // Insert root accounts first, then children
  const roots = coa.filter(a => a.parentId === null)
  const children = coa.filter(a => a.parentId !== false && a.parentId !== null)
  for (const a of roots) {
    await prisma.accountHead.upsert({ where: { code: a.code }, update: {}, create: { code: a.code, name: a.name, type: a.type } })
  }
  // Assign parents by code prefix
  for (const a of children) {
    const parentCode = a.code.slice(0,1) + '000'
    const parent = await prisma.accountHead.findUnique({ where: { code: parentCode } })
    await prisma.accountHead.upsert({
      where: { code: a.code },
      update: {},
      create: { code: a.code, name: a.name, type: a.type, parentId: parent?.id ?? null },
    })
  }

  console.log('Seed complete.')
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
