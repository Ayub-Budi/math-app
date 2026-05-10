const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- SEDANG MEMBERSIHKAN DATABASE ---');
  
  const theoryCount = await prisma.theory.deleteMany();
  console.log(`Berhasil menghapus ${theoryCount.count} data Teori.`);
  
  const bankSoalCount = await prisma.aIBankSoal.deleteMany();
  console.log(`Berhasil menghapus ${bankSoalCount.count} data Bank Soal.`);
  
  console.log('--- DATABASE SUDAH BERSIH DAN SIAP DIUPDATE ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
