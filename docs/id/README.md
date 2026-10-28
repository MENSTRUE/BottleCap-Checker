# BottleCap Checker — Panduan Teknis Bahasa Indonesia

**Day 23/100 · Prototipe riset inspeksi visual tutup botol · YOLOv8n + FastAPI + React**

[README utama](../../README.md) | [Metodologi](../METHODOLOGY.md) | [Testing](../TESTING.md) | [Deployment](../DEPLOYMENT.md) | [Batas klaim](../CLAIM_BOUNDARIES.md)

## 1. Masalah dan tujuan produk

Pada proses pengemasan, kondisi tutup dan cincin pengaman bisa menjadi indikator persoalan visual. Pemeriksaan manual membutuhkan perhatian berulang dan dapat melewatkan ketidaksesuaian. **BottleCap Checker** menampilkan prediksi kelas objek serta bounding box agar manusia dapat meninjau gambar secara lebih terstruktur. Sistem **tidak** mengukur torsi, kekuatan segel, kebocoran, ataupun kelayakan pangan, dan **tidak** memutuskan pass/fail otomatis.

## 2. Before → Now → Next

| Tahap | Kondisi |
|---|---|
| Before | Dataset primer dan sekunder diaudit sebelum penggabungan atau pelatihan. |
| Now — dataset | Hanya `Bottle Defects v28` dipakai untuk model final; 623 gambar (398 train, 113 valid, 112 test). |
| Now — model | YOLOv8n dari pretrained `yolov8n.pt`, checkpoint `best.pt` dipilih melalui validation, lalu dievaluasi pada 112 gambar test. |
| Now — aplikasi | FastAPI memuat `models/bottlecap_primary_best.pt`; dashboard React menerima gambar dan memperlihatkan deteksi sesungguhnya. |
| Next | Uji setiap kelas secara manual, dokumentasikan failure case, domain shift, validasi lisensi dan deployment aman. |

## 3. Dataset dan audit

**Sumber utama:** `Bottle Defects.v28i.yolov8`, mount notebook `/kaggle/input/datasets/loliwibu/bottlecap-checker-day23-datasets/Bottle Defects.v28i.yolov8/data.yaml`. Lima label dengan urutan ID wajib: `Broken Cap` (0), `Broken Ring` (1), `Good Cap` (2), `Loose Cap` (3), `No Cap` (4).

Audit primer menemukan 0 anotasi tidak valid, 0 hash berkas identik lintas-split, dan 0 tabrakan keluarga nama berkas lintas-split. **Ini bukan jaminan bebas leakage sempurna**, karena gambar nyaris identik dengan nama atau crop berbeda mungkin lolos. Jumlah bounding box per kelas adalah 63, 66, 218, 158 dan 161—itu bukan jumlah gambar unik per kelas.

**Sumber sekunder:** Dataset of Packaging menggunakan label `Cap`, `Missing`, `Wrong bottle`, `box`. Audit mencatat **9.651 label tanpa pasangan gambar yang cocok** dalam layout yang berhasil dibaca dan **0 gambar valid terpasangkan**. Dataset ini **tidak** dipakai melatih model final atau ditambahkan paksa dengan label primer. Lisensi sekunder belum diverifikasi.

## 4. Training dan pemilihan champion

Notebook asli: [`notebooks/bottlecap-checker.ipynb`](../../notebooks/bottlecap-checker.ipynb). Konfigurasi tercatat `yolov8n.pt`, input 640, 65 epoch diminta, patience 15, batch 16, seed 42, perangkat GPU Kaggle. Ultralytics `best.pt` dipilih dari hasil **validasi**, bukan dari optimasi test. Satu model utama dilatih; belum terdapat klaim pencarian puluhan arsitektur atau beberapa seed.

File yang disimpan: `models/bottlecap_primary_best.pt` (dipakai API), `models/bottlecap_primary_last.pt` (akhir training), dan `models/bottlecap_primary_best.onnx` (hasil ekspor, **belum digunakan oleh API**).

## 5. Metrik final held-out

Metrik resmi di [`reports/primary_heldout_metrics.json`](../../reports/primary_heldout_metrics.json), dievaluasi pada **112 gambar test**:

| Metrik | Hasil |
|---|---:|
| Precision | **90,03%** |
| Recall | **93,38%** |
| mAP@50 | **95,21%** |
| mAP@50–95 | **75,98%** |

| Kelas | AP@50–95 (test) |
|---|---:|
| Broken Cap | 74,39% |
| **Broken Ring** | **37,35%** |
| Good Cap | 91,37% |
| Loose Cap | 82,47% |
| No Cap | 94,33% |

Temuan terbesar: kelas **Broken Ring** masih sulit dilokalisasi pada IoU lebih ketat. Angka agregat mAP tinggi **tidak** berarti seluruh kelas sama baiknya atau 95% produk otomatis lolos QC.

## 6. Arsitektur aplikasi

```text
Foto botol → React/Vite → FastAPI → validasi file → YOLOv8n best.pt
           → deteksi kelas + bounding box + confidence
           → anotasi JPEG → dashboard, filter, ekspor JSON/gambar
           → peninjauan manusia (quality_decision = not_assessed)
```

**Endpoint:** GET `/api/v1/health`, GET `/api/v1/models`, POST `/api/v1/predict`. Batas upload 10 MiB / 16 juta piksel; JPEG, PNG, WebP. Parameter confidence default 0.25 dan IoU 0.45. Koordinat box berbentuk XYXY dalam piksel gambar asli. `health` hanya memeriksa service/checkpoint dan field `model_loaded: false` pada versi sekarang bersifat statis, bukan bukti model gagal.

## 7. Menjalankan di Windows PowerShell

Terminal backend:

```powershell
cd "D:\porto\100 day\day 23\BottleCap-Checker\backend"
py -3.11 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Terminal frontend (berbeda):

```powershell
cd "D:\porto\100 day\day 23\BottleCap-Checker\frontend"
npm ci
npm run typecheck
npm run build
npm run dev
```

Buka `http://127.0.0.1:5173`. Gunakan gambar dari test split dengan hak penggunaan yang sesuai, pilih gambar, tekan Run Inspection, lalu periksa kelas, box dan confidence. Jika belum muncul deteksi, coba confidence lebih rendah dan catat sebagai kegagalan atau keterbatasan—bukan langsung menyimpulkan “botol normal”.

## 8. Bukti yang benar-benar tersedia

- Penelitian dan laporan JSON/CSV asli sudah di repo.
- Dari log lokal, **3 tes backend lulus**, dan `npm run build` berhasil; belum berarti deployment publik siap.
- Satu screenshot demo aplikasi menunjukkan **Loose Cap** dengan satu bounding box, confidence sekitar 89,5%, durasi sekitar 59,1 ms. Ini contoh inference, **bukan evaluasi statistik**.
- Uji lengkap lima kelas dari UI dan evaluasi data pabrik baru masih perlu dibuktikan.

![Demo aplikasi](../../assets/screenshots/Screenshot%202026-10-28%20184458.png)

## 9. Batasan, lisensi, keamanan

Dataset terbatas 623 gambar, masalah perbedaan domain, kemungkinan near duplicate, kelas Broken Ring sulit, tidak ada validasi produksi eksternal, dan skor confidence belum dikalibrasi untuk keputusan mutu. `Good Cap` hanya kelas deteksi; hasil kosong bukan tanda produk aman. API tidak menyediakan keputusan pabrik.

Lisensi kode milik proyek tercantum sebagai **MIT** di [`LICENSE`](../../LICENSE). Notebook menyebut sumber primer Roboflow berlisensi **CC BY 4.0**; pemilik, atribusi dan hak penggunaan gambar/annotation harus dicek ke sumber aslinya. Model pretrained dan dependency punya ketentuan sendiri; MIT tidak melisensikan semua aset tersebut.

Aplikasi sekarang ditujukan untuk localhost. Autentikasi, HTTPS, pembatasan request, keamanan checkpoint, pengelolaan gambar, audit log dan rollback belum dinyatakan selesai. Jangan membuka port API publik menggunakan pengaturan development.

## 10. Troubleshooting

| Gejala | Pemeriksaan |
|---|---|
| API Offline | Jalankan backend di port 8000 dan cek `/api/v1/health`. |
| 503 | Periksa file `.pt` di root `models/`, versi dependency dan log backend. |
| Upload ditolak | Format JPEG/PNG/WebP, maksimal 10 MiB / 16 juta piksel. |
| Tidak ada prediksi | Turunkan confidence sementara dan bandingkan dengan foto berlabel; catat error. |
| Build frontend gagal | Jalankan `npm ci`, `npm run typecheck`, lalu `npm run build`. |
| ONNX tidak terpakai | Normal: kode inference memanggil `.pt`, bukan ONNX Runtime. |
| Skor terlalu optimistis | Bedakan held-out dataset source dari gambar dunia nyata dan jangan hilangkan kelas lemah. |

## 11. Roadmap

Prioritas P0: uji UI tiap kelas dengan bukti dan failure-case gallery; P1: CI, audit perceptual near duplicate, evaluasi data baru, benchmark latency multi-run; P2: ONNX parity, kalibrasi keputusan di lini nyata, keamanan dan deployment terautentikasi. Ini rencana, bukan fitur yang sudah selesai.

## 12. FAQ singkat

**Apakah perlu retraining?** Tidak untuk menjalankan MVP; `.pt` tersedia dan sudah diintegrasikan. Retraining harus didorong oleh dataset baru/evaluasi valid, bukan sekadar mengejar angka.

**Apakah `Good Cap` berarti lulus QC?** Tidak. Keputusan mutu produk belum diimplementasikan.

**Apakah kedua dataset dilatih?** Tidak. Yang digunakan untuk model ini hanya Bottle Defects v28.

**Apakah hasil 95,21% berarti akurasi pabrik?** Tidak. Itu mAP@50 deteksi pada source-held-out test.

**Mengapa ada ONNX?** Berhasil diekspor untuk kemungkinan integrasi mendatang, tetapi API masih menggunakan `.pt`.

**Bolehkah digunakan secara komersial?** Tinjau lisensi semua kode, dataset, foto, pretrained weights dan dependensi terlebih dahulu; MIT kode saja belum cukup.

Detail audit dan perintah reproduksi ada di [METHODOLOGY](../METHODOLOGY.md); kriteria klaim ada di [CLAIM_BOUNDARIES](../CLAIM_BOUNDARIES.md).
