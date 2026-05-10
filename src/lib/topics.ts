export interface SubTopic {
  id: string;
  title: string;
  description: string;
  xpReward: number;
}

export interface CurriculumCategory {
  id: string;
  title: string;
  description: string;
  color: string;
  level: string;
  grades: string[];
  topics: SubTopic[];
}

export const curriculum: CurriculumCategory[] = [
  {
    id: 'aritmatika',
    title: 'Aritmatika (Bilangan)',
    description: 'Kuasai angka, operasi hitung, pecahan, hingga FPB & KPK.',
    color: 'bg-orange-500',
    level: 'Pemula',
    grades: ['SD', 'SMP', 'SMA'],
    topics: [
      { id: 'mengenal-bilangan', title: '1. Mengenal Bilangan', description: 'Belajar membaca dan menulis bilangan cacah hingga ribuan.', xpReward: 50 },
      { id: 'nilai-tempat', title: '2. Nilai Tempat', description: 'Memahami satuan, puluhan, ratusan, dan ribuan.', xpReward: 50 },
      { id: 'penjumlahan-dasar', title: '3. Penjumlahan Dasar', description: 'Menjumlahkan angka satuan hingga ratusan dengan teknik menyimpan.', xpReward: 60 },
      { id: 'pengurangan-dasar', title: '4. Pengurangan Dasar', description: 'Mengurangi angka dengan teknik meminjam.', xpReward: 60 },
      { id: 'perkalian-menyenangkan', title: '5. Perkalian Dasar', description: 'Perkalian sebagai penjumlahan berulang. Menghafal perkalian 1-10.', xpReward: 100 },
      { id: 'pembagian-mudah', title: '6. Pembagian Dasar', description: 'Pembagian sebagai pengurangan berulang dan konsep sisa.', xpReward: 100 },
      { id: 'operasi-campuran', title: '7. Hitung Campuran', description: 'Aturan (KABATAKU) Kali, Bagi, Tambah, Kurang.', xpReward: 150 },
      { id: 'mengenal-pecahan', title: '8. Mengenal Pecahan', description: 'Mengenal 1/2, 1/3, 1/4 melalui potongan pizza atau kue.', xpReward: 100 },
      { id: 'pecahan-senilai', title: '9. Pecahan Senilai', description: 'Mencari pecahan yang nilainya sama.', xpReward: 150 },
      { id: 'operasi-pecahan', title: '10. Operasi Pecahan', description: 'Penjumlahan dan pengurangan pecahan berpenyebut sama.', xpReward: 200 },
      { id: 'kelipatan-faktor', title: '11. Kelipatan & Faktor', description: 'Mencari bilangan kelipatan dan faktor pembagi suatu angka.', xpReward: 150 },
      { id: 'kpk-fpb', title: '12. KPK dan FPB', description: 'Kelipatan Persekutuan Terkecil dan Faktor Persekutuan Terbesar.', xpReward: 250 },
    ]
  },
  {
    id: 'aljabar',
    title: 'Aljabar & Pola',
    description: 'Bermain dengan pola bilangan dan mencari nilai misterius.',
    color: 'bg-blue-500',
    level: 'Menengah',
    grades: ['SD', 'SMP', 'SMA'],
    topics: [
      { id: 'pola-gambar', title: '1. Pola Gambar', description: 'Menebak gambar apa yang muncul selanjutnya dalam suatu barisan.', xpReward: 50 },
      { id: 'pola-bilangan', title: '2. Pola Bilangan', description: 'Mencari angka selanjutnya dari deret angka sederhana (+2, +3).', xpReward: 80 },
      { id: 'pengenalan-variabel', title: '3. Angka Misterius', description: 'Mengisi kotak kosong (contoh: 5 + ? = 12). Pengantar Aljabar.', xpReward: 100 },
      { id: 'persamaan-linear-1', title: '4. Persamaan Linear (Bag. 1)', description: 'Cara mudah memecahkan persamaan linear satu variabel.', xpReward: 150 },
      { id: 'persamaan-linear-2', title: '5. Persamaan Linear (Bag. 2)', description: 'Persamaan tingkat lanjut dengan pecahan.', xpReward: 200 },
    ]
  },
  {
    id: 'geometri',
    title: 'Geometri & Pengukuran',
    description: 'Jelajahi dunia bentuk, ruang, dimensi, waktu, dan pengukuran.',
    color: 'bg-green-500',
    level: 'Pemula',
    grades: ['SD', 'SMP'],
    topics: [
      { id: 'bentuk-2d', title: '1. Mengenal Bangun Datar', description: 'Ciri-ciri persegi, segitiga, persegi panjang, dan lingkaran.', xpReward: 50 },
      { id: 'pengukuran-panjang', title: '2. Mengukur Panjang', description: 'Mengenal penggaris, cm, dan m. Menghitung panjang benda.', xpReward: 50 },
      { id: 'pengukuran-berat', title: '3. Mengukur Berat', description: 'Mengenal timbangan, gram, dan kilogram.', xpReward: 50 },
      { id: 'mengenal-waktu', title: '4. Mengenal Waktu', description: 'Membaca jam jarum, jam digital, menit, dan detik.', xpReward: 80 },
      { id: 'keliling-datar', title: '5. Keliling Bangun Datar', description: 'Menghitung batas luar (pagar) dari sebuah bangun.', xpReward: 100 },
      { id: 'luas-datar', title: '6. Luas Bangun Datar', description: 'Mengukur luas area dari persegi dan persegi panjang.', xpReward: 150 },
      { id: 'bentuk-3d', title: '7. Mengenal Bangun Ruang', description: 'Mengenal Kubus, Balok, Tabung, dan Bola dalam kehidupan nyata.', xpReward: 100 },
      { id: 'volume-dasar', title: '8. Volume Dasar (Kubus & Balok)', description: 'Menghitung isi atau kapasitas bangun ruang dasar.', xpReward: 200 },
    ]
  },
  {
    id: 'statistika',
    title: 'Statistika & Data',
    description: 'Belajar membaca informasi dari gambar, tabel, dan diagram.',
    color: 'bg-purple-500',
    level: 'Lanjut',
    grades: ['SD', 'SMP', 'SMA'],
    topics: [
      { id: 'piktogram', title: '1. Piktogram (Diagram Gambar)', description: 'Membaca data jumlah benda menggunakan perwakilan gambar.', xpReward: 80 },
      { id: 'membaca-tabel', title: '2. Membaca Tabel Data', description: 'Menyusun dan membaca data survei sederhana dari sebuah tabel.', xpReward: 100 },
      { id: 'diagram-batang', title: '3. Diagram Batang', description: 'Membuat dan membaca grafik balok/batang.', xpReward: 120 },
      { id: 'mean-median-modus', title: '4. Mean, Median, Modus', description: 'Mencari nilai rata-rata, tengah, dan yang sering muncul.', xpReward: 150 },
      { id: 'peluang-dasar', title: '5. Peluang Dasar', description: 'Seberapa besar kemungkinan dadu angka 6 akan muncul?', xpReward: 200 },
    ]
  }
];

export function getCategoryById(id: string) {
  return curriculum.find(c => c.id === id);
}

export function getTopicById(categoryId: string, topicId: string) {
  const category = getCategoryById(categoryId);
  return category?.topics.find(t => t.id === topicId);
}
