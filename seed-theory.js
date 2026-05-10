const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const category = 'aritmatika';
  const grade = 'SD';
  const content = `
# Teori Dasar Aritmatika

**Aritmetika** (berasal dari kata Yunani *arithmos*, yang berarti angka) adalah cabang tertua dan paling dasar dari matematika yang mempelajari operasi dasar pada bilangan.

## 1. Himpunan Bilangan dalam Aritmetika
Aritmetika bekerja pada berbagai jenis sistem bilangan:
*   **Bilangan Asli ($\mathbb{N}$):** {1, 2, 3, ...} (digunakan untuk menghitung).
*   **Bilangan Cacah:** {0, 1, 2, 3, ...} (bilangan asli ditambah nol).
*   **Bilangan Bulat ($\mathbb{Z}$):** {..., -2, -1, 0, 1, 2, ...}.
*   **Bilangan Rasional ($\mathbb{Q}$):** Bilangan yang dapat dinyatakan dalam bentuk pecahan a/b.

## 2. Operasi Dasar Aritmatika
Ada empat operasi utama yang kita pelajari:
1. **Penjumlahan (+):** Menggabungkan dua angka menjadi satu jumlah.
2. **Pengurangan (-):** Mencari selisih antara dua angka.
3. **Perkalian (x):** Penjumlahan berulang dari angka yang sama.
4. **Pembagian (:):** Membagi sebuah angka menjadi bagian-bagian yang sama besar.

## 3. Contoh Soal
**Soal:** Budi memiliki 12 apel. Ia memberikan 5 apel kepada Ani dan kemudian membeli lagi 3 apel. Berapa jumlah apel Budi sekarang?

**Penyelesaian:**
1. Awal: 12 apel
2. Diberikan: 12 - 5 = 7 apel
3. Membeli lagi: 7 + 3 = 10 apel
**Jadi, jumlah apel Budi sekarang adalah 10 apel.**

---
*Materi ini disimpan dalam database untuk akses cepat dan hemat kuota AI.*
  `;

  await prisma.theory.upsert({
    where: { category_grade: { category, grade } },
    update: { content },
    create: { category, grade, content }
  });

  console.log('Materi Aritmatika berhasil dimasukkan secara manual!');
}

main().finally(() => prisma.$disconnect());
