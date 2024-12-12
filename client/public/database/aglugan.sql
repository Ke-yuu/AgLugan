-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 10, 2024 at 06:51 AM
-- Server version: 8.3.0
-- PHP Version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `aglugan`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `password`) VALUES
(1, 'admin', '$2y$10$Qp46ZzA.w0b23e/Yc3dZaeF9A4DYa2glVK5xoB.RgLlm2c9rTkAi2');

-- --------------------------------------------------------

--
-- Table structure for table `passenger_statistics`
--

DROP TABLE IF EXISTS `passenger_statistics`;
CREATE TABLE IF NOT EXISTS `passenger_statistics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `day_of_week` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') COLLATE utf8mb4_unicode_ci NOT NULL,
  `time_slot` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bookings_count` int DEFAULT '0',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `passenger_statistics`
--

INSERT INTO `passenger_statistics` (`id`, `day_of_week`, `time_slot`, `bookings_count`, `updated_at`) VALUES
(1, 'Monday', '6:00 AM - 7:00 AM', 15, '2024-12-10 02:58:00'),
(2, 'Monday', '7:00 AM - 8:00 AM', 25, '2024-12-10 02:58:00'),
(3, 'Tuesday', '6:00 AM - 7:00 AM', 10, '2024-12-10 02:58:00'),
(4, 'Tuesday', '7:00 AM - 8:00 AM', 30, '2024-12-10 02:58:00'),
(5, 'Saturday', '9:00 AM - 10:00 AM', 5, '2024-12-10 02:58:00');

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `payment_id` int NOT NULL AUTO_INCREMENT,
  `ride_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('cash','Gcash','Maya') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','completed','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`payment_id`),
  KEY `ride_id` (`ride_id`),
  KEY `fk_user_id` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `ride_id`, `amount`, `payment_method`, `status`, `phone_number`, `user_id`) VALUES
(1, NULL, 13.00, 'Gcash', 'pending', 0, 0),
(2, NULL, 13.00, 'cash', 'pending', 0, 0),
(3, NULL, 13.00, 'cash', 'completed', 0, 0),
(4, NULL, 13.00, 'Maya', 'failed', 0, 0),
(5, 1001, 15.00, 'cash', 'pending', 0, 1),
(6, 1001, 13.00, 'cash', 'pending', 0, 1),
(7, 10007, 13.00, 'cash', 'pending', 0, 1),
(8, 1001, 13.00, 'Gcash', 'pending', 2147483647, 1),
(9, 10008, 13.00, 'Maya', 'pending', 2147483647, 1),
(10, 1001, 13.00, 'Gcash', 'pending', 2147483647, 1),
(11, 10007, 13.00, 'Gcash', 'pending', 2147483647, 1),
(12, 1001, 13.00, 'Gcash', 'pending', 2147483647, 1),
(13, 1001, 13.00, 'Gcash', 'pending', 2147483647, 22),
(14, 1001, 13.00, 'Gcash', 'pending', 2147483647, 22),
(15, 10016, 13.00, 'cash', 'pending', 0, 1),
(16, 10016, 13.00, 'Gcash', 'pending', 2147483647, 1),
(17, 1008, 18.00, 'cash', 'pending', 0, 1),
(18, 1059, 18.00, 'cash', 'pending', 0, 1),
(19, 1048, 18.00, 'Gcash', 'pending', 2147483647, 1),
(20, 1059, 18.00, 'cash', 'pending', 0, 22),
(21, 1054, 20.00, 'cash', 'pending', 0, 24),
(22, 1051, 20.00, 'cash', 'pending', 0, 24),
(23, 1052, 20.00, 'Gcash', 'pending', 2147483647, 24),
(24, 1053, 13.00, 'cash', 'pending', 0, 24),
(25, 1013, 13.00, 'Gcash', 'pending', 2147483647, 24),
(26, 1059, 13.00, 'cash', 'pending', 0, 24),
(27, 1053, 13.00, 'Maya', 'pending', 2147483647, 24);

-- --------------------------------------------------------

--
-- Table structure for table `rides`
--

DROP TABLE IF EXISTS `rides`;
CREATE TABLE IF NOT EXISTS `rides` (
  `ride_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `driver_id` int DEFAULT NULL,
  `start_location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `end_location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('Loading','Scheduled','Inactive') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fare` decimal(10,2) NOT NULL,
  `waiting_time` time(6) NOT NULL,
  `time_range` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`ride_id`),
  KEY `passenger_id` (`user_id`),
  KEY `driver_id` (`driver_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10054 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rides`
--

INSERT INTO `rides` (`ride_id`, `user_id`, `driver_id`, `start_location`, `end_location`, `status`, `fare`, `waiting_time`, `time_range`) VALUES
(1059, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Scheduled', 13.00, '00:20:00.000000', '15:00-15:30'),
(1044, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '07:30-08:00'),
(1043, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '07:00-07:30'),
(1042, NULL, 102, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '06:30-07:00'),
(1041, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '06:00-06:30'),
(1023, NULL, 101, 'SLU Mary Heights', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '17:00-17:30'),
(1021, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '16:00-16:30'),
(1019, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '15:00-15:30'),
(1017, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '14:00-14:30'),
(1015, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '13:00-13:30'),
(1002, NULL, 101, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '06:30-07:00'),
(1058, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Scheduled', 13.00, '00:20:00.000000', '14:30-15:00'),
(1057, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Scheduled', 13.00, '00:20:00.000000', '14:00-14:30'),
(1056, NULL, 102, 'SLU Mary Heights', 'Igorot Garden', 'Scheduled', 13.00, '00:20:00.000000', '13:30-14:00'),
(1055, NULL, 102, 'SLU Mary Heights', 'Igorot Garden', 'Scheduled', 13.00, '00:20:00.000000', '13:00-13:30'),
(1054, NULL, 102, 'SLU Mary Heights', 'Igorot Garden', 'Scheduled', 13.00, '00:20:00.000000', '12:30-13:00'),
(1053, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Loading', 13.00, '00:20:00.000000', '12:00-12:30'),
(1052, NULL, 102, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '11:30-12:00'),
(1051, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '11:00-11:30'),
(1050, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '10:30-11:00'),
(1049, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '10:00-10:30'),
(1048, NULL, 102, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '09:30-10:00'),
(1045, NULL, 102, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '08:00-08:30'),
(1024, NULL, 101, 'SLU Mary Heights', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '17:30-18:00'),
(1022, NULL, 101, 'SLU Mary Heights', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '16:30-17:00'),
(1020, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '15:30-16:00'),
(1018, NULL, 101, 'SLU Mary Heights', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '14:30-15:00'),
(1016, NULL, 101, 'SLU Mary Heights', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '13:30-14:00'),
(1014, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '12:30-13:00'),
(1013, NULL, 101, 'SLU Mary Heights', 'Holy Family Parish Church', 'Loading', 11.00, '00:20:00.000000', '12:00-12:30'),
(1012, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '11:30-12:00'),
(1011, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '11:00-11:30'),
(1010, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '10:30-11:00'),
(1009, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '10:00-10:30'),
(1008, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '09:30-10:00'),
(1007, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '09:00-09:30'),
(1006, NULL, 101, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '08:30-09:00'),
(1005, NULL, 101, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '08:00-08:30'),
(1004, NULL, 101, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '07:30-08:00'),
(1003, NULL, 101, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '07:00-07:30'),
(1001, NULL, 102, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '06:00-06:30'),
(1047, NULL, 102, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '09:00-09:30'),
(1046, NULL, 102, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '08:30-09:00'),
(1060, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Scheduled', 13.00, '00:20:00.000000', '15:30-16:00'),
(1061, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Scheduled', 13.00, '00:20:00.000000', '16:00-16:30'),
(1062, NULL, 102, 'SLU Mary Heights', 'Igorot Garden', 'Scheduled', 13.00, '00:20:00.000000', '16:30-17:00'),
(1063, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Scheduled', 13.00, '00:20:00.000000', '17:00-17:30'),
(1064, NULL, 101, 'SLU Mary Heights', 'Igorot Garden', 'Scheduled', 13.00, '00:20:00.000000', '17:30-18:00'),
(1081, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '06:00-06:30'),
(1082, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '06:30-07:00'),
(1083, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '07:00-07:30'),
(1084, NULL, 101, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '07:30-08:00'),
(1085, NULL, 101, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '08:00-08:30'),
(1086, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '08:30-09:00'),
(1087, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '09:00-09:30'),
(1088, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '09:30-10:00'),
(1089, NULL, 101, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '10:00-10:30'),
(1090, NULL, 101, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '10:30-11:00'),
(1091, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '11:00-11:30'),
(1092, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '11:30-12:00'),
(1093, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Loading', 13.00, '00:20:00.000000', '12:00-12:30'),
(1094, NULL, 101, 'Igorot Garden', 'SLU Mary Heights', 'Scheduled', 13.00, '00:20:00.000000', '12:30-13:00'),
(1095, NULL, 101, 'Igorot Garden', 'SLU Mary Heights', 'Scheduled', 13.00, '00:20:00.000000', '13:00-13:30'),
(1096, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Scheduled', 13.00, '00:20:00.000000', '13:30-14:00'),
(1097, NULL, 101, 'Igorot Garden', 'SLU Mary Heights', 'Scheduled', 13.00, '00:20:00.000000', '14:00-14:30'),
(1098, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Scheduled', 13.00, '00:20:00.000000', '14:30-15:00'),
(1099, NULL, 101, 'Igorot Garden', 'SLU Mary Heights', 'Scheduled', 13.00, '00:20:00.000000', '15:00-15:30'),
(1100, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Scheduled', 13.00, '00:20:00.000000', '15:30-16:00'),
(1101, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Scheduled', 13.00, '00:20:00.000000', '16:00-16:30'),
(1102, NULL, 101, 'Igorot Garden', 'SLU Mary Heights', 'Scheduled', 13.00, '00:20:00.000000', '16:30-17:00'),
(1103, NULL, 102, 'Igorot Garden', 'SLU Mary Heights', 'Scheduled', 13.00, '00:20:00.000000', '17:00-17:30'),
(1104, NULL, 101, 'Igorot Garden', 'SLU Mary Heights', 'Scheduled', 13.00, '00:20:00.000000', '17:30-18:00'),
(1121, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '06:00-06:30'),
(1122, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '06:30-07:00'),
(1123, NULL, 102, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '07:00-07:30'),
(1124, NULL, 102, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '07:30-08:00'),
(1125, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '08:00-08:30'),
(1126, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '08:30-09:00'),
(1127, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '09:00-09:30'),
(1128, NULL, 102, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '09:30-10:00'),
(1129, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '10:00-10:30'),
(1130, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '10:30-11:00'),
(1131, NULL, 102, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '11:00-11:30'),
(1132, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '11:30-12:00'),
(1133, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Loading', 11.00, '00:20:00.000000', '12:00-12:30'),
(1134, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '12:30-13:00'),
(1135, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '13:00-13:30'),
(1136, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '13:30-14:00'),
(1137, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '14:00-14:30'),
(1138, NULL, 102, 'Igorot Garden', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '14:30-15:00'),
(1139, NULL, 102, 'Igorot Garden', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '15:00-15:30'),
(1140, NULL, 102, 'Igorot Garden', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '15:30-16:00'),
(1141, NULL, 102, 'Igorot Garden', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '16:00-16:30'),
(1142, NULL, 102, 'Igorot Garden', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '16:30-17:00'),
(1143, NULL, 101, 'Igorot Garden', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '17:00-17:30'),
(1144, NULL, 102, 'Igorot Garden', 'Holy Family Parish Church', 'Scheduled', 11.00, '00:20:00.000000', '17:30-18:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_type` enum('Student','Faculty/Staff','Driver') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_picture` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `name` (`name`(250))
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `username`, `email`, `password_hash`, `phone_number`, `user_type`, `profile_picture`) VALUES
(27, 'Kennely Ray', 'Kennely', 'krbucang@gmail.com', '$2a$04$1C4FKZqrYJSMO3J/n74wm.MyUdf4Pgn0RpOz8OCQriaW.SMAlLYfK', '9984276714', 'Student', '/uploads/profile_pictures/1733812221356-121137962-Blackpink_RosÃ©_Rimowa_1.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE IF NOT EXISTS `vehicles` (
  `vehicle_id` int NOT NULL AUTO_INCREMENT,
  `driver_id` int DEFAULT NULL,
  `capacity` int NOT NULL,
  `plate_number` varchar(1234) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`vehicle_id`),
  KEY `driver_id` (`driver_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `driver_id`, `capacity`, `plate_number`) VALUES
(1, 101, 23, 'WEB 445'),
(2, 102, 23, 'SAF 214');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
