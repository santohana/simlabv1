-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for simlab_ipa
CREATE DATABASE IF NOT EXISTS `simlab_ipa` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `simlab_ipa`;

-- Dumping structure for table simlab_ipa.alat
CREATE TABLE IF NOT EXISTS `alat` (
  `id` varchar(50) NOT NULL,
  `kode_alat` varchar(50) NOT NULL,
  `nama_alat` varchar(100) NOT NULL,
  `kategori` varchar(50) NOT NULL,
  `jumlah` int NOT NULL,
  `kondisi` varchar(50) NOT NULL,
  `lokasi` varchar(100) NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `spesifikasi` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table simlab_ipa.alat: ~8 rows (approximately)
INSERT INTO `alat` (`id`, `kode_alat`, `nama_alat`, `kategori`, `jumlah`, `kondisi`, `lokasi`, `foto`, `spesifikasi`) VALUES
	('motzwrfi7hsfo', 'MH-01', 'Manusia', 'Biologi', 1, 'Dalam perbaikan', 'Lemari B1', 'uploads/alat_6a028ce199c72.jpg', 'Awet dan tahan lama'),
	('mp2030e0ihgnc', 'FIS-01', 'Jangka Sorong Manual', 'Fisika', 5, 'Baik', 'Lemari F1', 'uploads/alat_6a028db151426.jpeg', 'Bahan Baja'),
	('mp206vx6d63kg', 'FIS-02', 'Jangka Sorong Digital', 'Fisika', 15, 'Baik', 'Lemari F1', 'uploads/alat_6a028e662904b.jpeg', 'Untuk Mengukur'),
	('mp209fojobqes', 'FIS-01', 'pH Meter', 'Fisika', 10, 'Baik', 'Lemari F1', 'uploads/alat_6a028edd15b90.jpeg', 'Pengukur Keasaman/Kebasaan'),
	('mp20bglcvdook', 'FIS-01', 'TDS Digital', 'Fisika', 10, 'Baik', 'Lemari F1', 'uploads/alat_6a028f3b8e03b.jpeg', 'Mengukur Jumlah Total Padatan Terlarut'),
	('mp20d0936wofw', 'FIS-01', 'Mikroskop Digital', 'Fisika', 3, 'Baik', 'Lemari F1', 'uploads/alat_6a028f83aede4.jpeg', 'Melihat Hal-hal Kecil'),
	('mp20mrhpgw6iu', 'FIS-01', 'Camera', 'Fisika', 3, 'Rusak ringan', 'Lemari F2', '', 'Sony A6000');

-- Dumping structure for table simlab_ipa.detail_peminjaman
CREATE TABLE IF NOT EXISTS `detail_peminjaman` (
  `id` varchar(50) NOT NULL,
  `peminjaman_id` varchar(50) NOT NULL,
  `alat_id` varchar(50) NOT NULL,
  `jumlah` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table simlab_ipa.detail_peminjaman: ~6 rows (approximately)
INSERT INTO `detail_peminjaman` (`id`, `peminjaman_id`, `alat_id`, `jumlah`) VALUES
	('dp1', 'p1', 'a1', 5),
	('dp2', 'p1', 'a2', 5),
	('dp3', 'p2', 'a5', 10),
	('dp4', 'p2', 'a7', 4),
	('dp5', 'p3', 'a9', 3),
	('mp20hlzgulrn6', 'mp20hlyrljhfs', 'mp20d0936wofw', 1),
	('mpaicunidli58', 'mpaicun4uiwg9', 'mp2030e0ihgnc', 3);

-- Dumping structure for table simlab_ipa.jadwal
CREATE TABLE IF NOT EXISTS `jadwal` (
  `id` varchar(50) NOT NULL,
  `laboratorium_id` varchar(20) NOT NULL,
  `guru_id` varchar(20) NOT NULL,
  `mata_pelajaran` varchar(50) NOT NULL,
  `kelas` varchar(20) NOT NULL,
  `tanggal` date NOT NULL,
  `jam_mulai` varchar(10) NOT NULL,
  `jam_selesai` varchar(10) NOT NULL,
  `status` varchar(20) NOT NULL,
  `kegiatan` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table simlab_ipa.jadwal: ~7 rows (approximately)
INSERT INTO `jadwal` (`id`, `laboratorium_id`, `guru_id`, `mata_pelajaran`, `kelas`, `tanggal`, `jam_mulai`, `jam_selesai`, `status`, `kegiatan`) VALUES
	('j1', 'l1', 'u3', 'Fisika', 'XII IPA 1', '2026-05-06', '08:00', '10:00', 'approved', 'Praktikum Hukum Newton'),
	('j2', 'l2', 'u5', 'Kimia', 'XI IPA 2', '2026-05-06', '10:00', '12:00', 'approved', 'Praktikum Titrasi Asam Basa'),
	('j3', 'l3', 'u3', 'Biologi', 'X IPA 1', '2026-05-07', '08:00', '10:00', 'approved', 'Pengamatan Sel dengan Mikroskop'),
	('j4', 'l1', 'u5', 'Fisika', 'XI IPA 1', '2026-05-08', '13:00', '15:00', 'approved', 'Praktikum Rangkaian Listrik'),
	('j5', 'l2', 'u3', 'Kimia', 'XII IPA 2', '2026-05-04', '08:00', '10:00', 'approved', 'Praktikum Reaksi Redoks'),
	('j6', 'l1', 'u3', 'Fisika', 'X IPA 2', '2026-05-11', '08:00', '10:00', 'approved', 'Praktikum Gerak Lurus'),
	('mpai9ep63io2q', 'l2', 'u1', 'Fisika', '10', '2026-05-20', '12:22', '09:59', 'approved', 'pratik');

-- Dumping structure for table simlab_ipa.labs
CREATE TABLE IF NOT EXISTS `labs` (
  `id` varchar(20) NOT NULL,
  `nama_lab` varchar(100) NOT NULL,
  `lokasi` varchar(100) NOT NULL,
  `kapasitas` int NOT NULL,
  `deskripsi` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table simlab_ipa.labs: ~3 rows (approximately)
INSERT INTO `labs` (`id`, `nama_lab`, `lokasi`, `kapasitas`, `deskripsi`) VALUES
	('l1', 'Lab Fisika', 'Gedung A Lt. 2', 40, 'Laboratorium fisika dengan perlengkapan mekanika, optik, dan listrik'),
	('l2', 'Lab Kimia', 'Gedung A Lt. 3', 35, 'Laboratorium kimia dilengkapi lemari asam dan perlengkapan analisis'),
	('l3', 'Lab Biologi', 'Gedung B Lt. 1', 38, 'Laboratorium biologi dengan mikroskop dan specimen koleksi');

-- Dumping structure for table simlab_ipa.notifikasi
CREATE TABLE IF NOT EXISTS `notifikasi` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `pesan` varchar(255) NOT NULL,
  `tipe` varchar(20) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table simlab_ipa.notifikasi: ~5 rows (approximately)
INSERT INTO `notifikasi` (`id`, `user_id`, `pesan`, `tipe`, `is_read`, `created_at`) VALUES
	('n1', 'u2', 'Pengajuan jadwal baru dari Budi Santoso - Praktikum Biologi', 'jadwal', 1, '2026-05-06 08:35:00'),
	('n2', 'u2', 'Pengajuan peminjaman alat dari Budi Santoso', 'peminjaman', 1, '2026-05-06 08:35:00'),
	('n3', 'u3', 'Jadwal Praktikum Hukum Newton telah disetujui', 'jadwal', 1, '2026-05-05 08:35:00'),
	('n4', 'u1', 'Timbangan Analitik (KIM-005) berstatus rusak berat', 'alat', 1, '2026-05-06 08:35:00'),
	('n5', 'u2', 'Stok Buret 50ml tersisa 8 unit', 'stok', 1, '2026-05-04 08:35:00');

-- Dumping structure for table simlab_ipa.peminjaman
CREATE TABLE IF NOT EXISTS `peminjaman` (
  `id` varchar(50) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `tanggal_pinjam` date NOT NULL,
  `tanggal_kembali` date NOT NULL,
  `status` varchar(20) NOT NULL,
  `catatan` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table simlab_ipa.peminjaman: ~4 rows (approximately)
INSERT INTO `peminjaman` (`id`, `user_id`, `tanggal_pinjam`, `tanggal_kembali`, `status`, `catatan`) VALUES
	('mp20hlyrljhfs', 'u1', '2026-05-14', '2026-05-13', 'Dikembalikan', 'Latihan kelas 8, Melihat hal kecil'),
	('mpaicun4uiwg9', 'u1', '2026-05-11', '2026-05-19', 'Dikembalikan', 'alasan'),
	('p1', 'u3', '2026-05-03', '2026-05-06', 'Dikembalikan', 'Untuk praktikum fisika kelas XII'),
	('p2', 'u5', '2026-05-01', '2026-05-04', 'Dikembalikan', 'Praktikum kimia kelas XI'),
	('p3', 'u3', '2026-05-06', '2026-05-09', 'Ditolak', 'Untuk demonstrasi di kelas');

-- Dumping structure for table simlab_ipa.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` enum('admin','laboran','guru','siswa') NOT NULL,
  `email` varchar(100) NOT NULL,
  `created_at` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table simlab_ipa.users: ~5 rows (approximately)
INSERT INTO `users` (`id`, `nama`, `username`, `password`, `role`, `email`, `created_at`) VALUES
	('mpaiervn1vz67', 'Dewi x', 'siswa2', '123', 'siswa', 'd@gmail.com', '2026-05-18'),
	('u1', 'Pandoe', 'admin', 'admin123', 'admin', 'admin@simlab.id', '2026-01-15'),
	('u2', 'Siti', 'laboran', 'laboran123', 'laboran', 'laboran@simlab.sch.id', '2026-01-15'),
	('u3', 'Budi', 'guru', 'guru123', 'guru', 'guru@simlab.sch.id', '2026-01-20'),
	('u4', 'Bambang', 'siswa', 'siswa123', 'siswa', 'siswa@simlab.sch.id', '2026-02-01');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
