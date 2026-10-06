/** Sunlit Product Lab content reference: user-provided affiliate table adapted for no-audio video. */
export type PromotionStrategy = {
  category: string;
  products: string;
  audience: string;
  platforms: string;
  title: string;
  noAudioStrategy: string;
};

export const promotionStrategies: PromotionStrategy[] = [
  {
    category: "Otomotif & Aksesoris",
    products: "Velg motor, helm, sarung tangan riding, cairan pengkilap bodi",
    audience: "Pria dan wanita hobi motor, modifikator pemula, komuter harian",
    platforms: "TikTok Shop, Facebook Groups",
    title: "Visual Showcase — Slow Zoom",
    noAudioStrategy: "Model berpose kasual sambil memegang produk; produk tetap terlihat utuh di tengah frame; gunakan slow zoom-in/dolly-in halus, pencahayaan samping, dan teks overlay singkat sebagai ajakan klik. Tanpa musik, dialog, atau voice-over.",
  },
  {
    category: "Fashion & Apparel",
    products: "Kaos oversize, celana jeans, sneakers, tas selempang kanvas, jaket hoodie",
    audience: "Gen Z dan milenial, mahasiswa, pekerja muda",
    platforms: "TikTok Shop, Instagram, Facebook",
    title: "OOTD Transition — Text-led",
    noAudioStrategy: "Gunakan transisi ganti pakaian yang jelas secara visual, lalu tampilkan detail ukuran, bahan, dan kombinasi outfit melalui teks overlay estetik. Gerak dipandu visual, tanpa musik, dialog, atau voice-over.",
  },
  {
    category: "Kecantikan & Perawatan",
    products: "Sunscreen, lip tint, sabun mandi, body lotion, serum wajah",
    audience: "Pengguna yang peduli penampilan, usia 15–35 tahun",
    platforms: "TikTok Shop, Instagram",
    title: "Routine Detail — Close-up",
    noAudioStrategy: "Tampilkan rutinitas penggunaan dan detail kemasan secara close-up, dengan transisi visual sederhana dan teks overlay faktual yang perlu diverifikasi. Hindari klaim hasil, manfaat kesehatan, atau before/after yang menyesatkan. Tanpa musik, dialog, atau voice-over.",
  },
  {
    category: "Elektronik & Gadget",
    products: "TWS, casing HP, powerbank mini, ring light, stand HP",
    audience: "Pembuat konten, pekerja mobile, pengguna gadget sehari-hari",
    platforms: "TikTok Shop, Facebook, Instagram",
    title: "Aesthetic Unboxing — Macro",
    noAudioStrategy: "Rekam proses membuka kemasan dari jarak dekat; fokus pada tekstur, bentuk, port, dan isi paket yang terlihat tanpa memperlihatkan wajah. Gunakan teks overlay untuk penanda bagian produk. Tanpa musik, dialog, atau voice-over.",
  },
  {
    category: "Perlengkapan Rumah (Home & Living)",
    products: "Rak penyimpan, alat pel, sprei, lampu tidur LED, diffuser",
    audience: "Ibu rumah tangga, anak kos, pekerja muda, keluarga baru",
    platforms: "TikTok Shop, Facebook, Instagram",
    title: "A Day in My Life — Soft Selling",
    noAudioStrategy: "Masukkan produk secara alami ke kegiatan rutin, misalnya merapikan kamar atau menata meja; gunakan transisi mulus dan teks rekomendasi yang jujur. Produk tetap menjadi fokus visual. Tanpa musik, dialog, atau voice-over.",
  },
  {
    category: "Kesehatan & Olahraga",
    products: "Baju dry-fit, matras yoga, botol minum, dumbel mini, skipping",
    audience: "Penggiat gaya hidup aktif, pemula olahraga, pekerja yang ingin bergerak lebih banyak",
    platforms: "TikTok Shop, Instagram",
    title: "Workout Routine — POV",
    noAudioStrategy: "Gunakan sudut pandang POV saat aktivitas ringan di rumah; sorot produk ketika digunakan dan tampilkan teks overlay yang hanya menjelaskan detail visual atau penggunaan. Hindari klaim kesehatan. Tanpa musik, dialog, atau voice-over.",
  },
  {
    category: "Buku, Alat Tulis & Produktivitas",
    products: "Buku self-improvement, planner, pulpen, dekorasi meja",
    audience: "Pelajar, mahasiswa, pekerja kantoran yang menyukai produktivitas",
    platforms: "Instagram, TikTok, Facebook",
    title: "Quote & Setup — Desk Aesthetic",
    noAudioStrategy: "Sorot setup meja kerja dan detail produk secara berurutan; gunakan teks overlay berupa poin fungsi atau kutipan original yang relevan, tanpa memakai materi berhak cipta. Tanpa musik, dialog, atau voice-over.",
  },
];
