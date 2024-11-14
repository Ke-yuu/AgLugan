-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 12, 2024 at 10:27 PM
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
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(16, 10016, 13.00, 'Gcash', 'pending', 2147483647, 1);

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
(1059, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '15:00-15:30'),
(1044, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '07:30-08:00'),
(1043, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '07:00-07:30'),
(1042, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '06:30-07:00'),
(1041, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '06:00-06:30'),
(1023, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '17:00-17:30'),
(1021, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '16:00-16:30'),
(1019, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '15:00-15:30'),
(1017, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '14:00-14:30'),
(1015, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '13:00-13:30'),
(1002, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '06:30-07:00'),
(1058, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '14:30-15:00'),
(1057, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '14:00-14:30'),
(1056, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '13:30-14:00'),
(1055, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '13:00-13:30'),
(1054, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '12:30-13:00'),
(1053, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '12:00-12:30'),
(1052, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '11:30-12:00'),
(1051, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '11:00-11:30'),
(1050, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '10:30-11:00'),
(1049, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '10:00-10:30'),
(1048, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '09:30-10:00'),
(1045, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '08:00-08:30'),
(1024, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '17:30-18:00'),
(1022, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '16:30-17:00'),
(1020, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '15:30-16:00'),
(1018, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '14:30-15:00'),
(1016, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '13:30-14:00'),
(1014, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '12:30-13:00'),
(1013, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '12:00-12:30'),
(1012, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '11:30-12:00'),
(1011, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '11:00-11:30'),
(1010, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '10:30-11:00'),
(1009, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '10:00-10:30'),
(1008, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '09:30-10:00'),
(1007, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '09:00-09:30'),
(1006, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '08:30-09:00'),
(1005, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '08:00-08:30'),
(1004, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '07:30-08:00'),
(1003, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '07:00-07:30'),
(1001, NULL, NULL, 'SLU Mary Heights', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '06:00-06:30'),
(1047, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '09:00-09:30'),
(1046, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '08:30-09:00'),
(1060, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '15:30-16:00'),
(1061, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '16:00-16:30'),
(1062, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '16:30-17:00'),
(1063, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '17:00-17:30'),
(1064, NULL, NULL, 'SLU Mary Heights', 'Igorot Garden', 'Inactive', 13.00, '00:20:00.000000', '17:30-18:00'),
(1081, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '06:00-06:30'),
(1082, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '06:30-07:00'),
(1083, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '07:00-07:30'),
(1084, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '07:30-08:00'),
(1085, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '08:00-08:30'),
(1086, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '08:30-09:00'),
(1087, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '09:00-09:30'),
(1088, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '09:30-10:00'),
(1089, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '10:00-10:30'),
(1090, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '10:30-11:00'),
(1091, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '11:00-11:30'),
(1092, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '11:30-12:00'),
(1093, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '12:00-12:30'),
(1094, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '12:30-13:00'),
(1095, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '13:00-13:30'),
(1096, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '13:30-14:00'),
(1097, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '14:00-14:30'),
(1098, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '14:30-15:00'),
(1099, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '15:00-15:30'),
(1100, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '15:30-16:00'),
(1101, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '16:00-16:30'),
(1102, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '16:30-17:00'),
(1103, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '17:00-17:30'),
(1104, NULL, NULL, 'Igorot Garden', 'SLU Mary Heights', 'Inactive', 13.00, '00:20:00.000000', '17:30-18:00'),
(1121, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '06:00-06:30'),
(1122, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '06:30-07:00'),
(1123, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '07:00-07:30'),
(1124, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '07:30-08:00'),
(1125, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '08:00-08:30'),
(1126, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '08:30-09:00'),
(1127, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '09:00-09:30'),
(1128, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '09:30-10:00'),
(1129, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '10:00-10:30'),
(1130, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '10:30-11:00'),
(1131, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '11:00-11:30'),
(1132, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '11:30-12:00'),
(1133, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '12:00-12:30'),
(1134, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '12:30-13:00'),
(1135, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '13:00-13:30'),
(1136, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '13:30-14:00'),
(1137, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '14:00-14:30'),
(1138, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '14:30-15:00'),
(1139, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '15:00-15:30'),
(1140, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '15:30-16:00'),
(1141, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '16:00-16:30'),
(1142, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '16:30-17:00'),
(1143, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '17:00-17:30'),
(1144, NULL, NULL, 'Igorot Garden', 'Holy Family Parish Church', 'Inactive', 11.00, '00:20:00.000000', '17:30-18:00');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_type` enum('Student','Faculty/Staff','Driver') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `name` (`name`(250))
) ENGINE=MyISAM AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `phone_number`, `user_type`) VALUES
(1, 'Kennely Ray', 'krbucang@gmail.com', '$2y$10$UnbJyb0qC35J8UphZv8LXO3B5D42ij5gzxYjejnnZIMTmJI.yXj/2', '9984276714', 'Student'),
(22, 'Anne Marie', 'amarie@gmail.com', '$2y$10$CCBHgUEbmEIq2GlWJMhLNeLVeAn3mBs5QD4DIfH10/KOTA49HVody', '9183724988', 'Student'),
(23, 'Jan Michael', 'jmrocks@yahoo.com', '$2y$10$aldOaVXyiZ/TFqIAKgYgK.2U7dOLNH0WwiwGNQ1bJQHuDi9b3dBJi', '9323586725', 'Student'),
(24, 'Brittany Brit', 'maambrit@hotmail.com', '$2y$10$dLYs/Ye.HobGA2FgdEaC6.ggplDK2gAPAQmfknKjvMXFcbCaNn2vC', '9485721331', 'Faculty/Staff'),
(25, 'Josh Marco', 'slustaff@slu.edu.ph', '$2y$10$NLZY57pRhXwX4/3oJRUJCuM05sss4xSXbU5Uy4Tvy1Kaaj5fywDla', '9124855813', 'Faculty/Staff'),
(26, 'Marc Maron', 'singerist123@hotmail.com', '$2y$10$UpwQWyv32AD/rwswJjfANef7awWgMFwpzHrvPArB.xjNXrqFrkhXG', '9328567431', 'Faculty/Staff');

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
