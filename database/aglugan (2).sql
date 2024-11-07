-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Nov 07, 2024 at 02:24 PM
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
) ENGINE=MyISAM AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(12, 1001, 13.00, 'Gcash', 'pending', 2147483647, 1);

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
  `status` enum('Available','Upcoming','On-Route') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
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
(1001, 1, 4, 'SLU', 'CHURCH', 'Available', 11.00, '00:10:00.000000', '6:00-7:00'),
(10007, 2, 5, 'SLU', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '7:00-8:00'),
(10008, 3, 6, 'SLU', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '8:00-9:00'),
(10009, 4, 7, 'SLU', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '9:00-10:00'),
(10010, 5, 8, 'SLU', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '10:00-11:00'),
(10011, 6, 9, 'SLU', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '11:00-12:00'),
(10012, 7, 10, 'SLU', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '12:00-13:00'),
(10013, 8, 11, 'SLU', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '13:00-14:00'),
(10014, 9, 12, 'SLU', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '14:00-15:00'),
(10015, 10, 13, 'SLU', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '15:00-16:00'),
(10016, 11, 14, 'SLU', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '16:00-17:00'),
(10017, 12, 15, 'SLU', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '17:00-18:00'),
(10018, 1, 4, 'SLU', 'TOWN', 'Available', 13.00, '00:10:00.000000', '6:00-7:00'),
(10019, 2, 5, 'SLU', 'TOWN', 'Upcoming', 13.00, '00:10:00.000000', '7:00-8:00'),
(10020, 3, 6, 'SLU', 'TOWN', 'Upcoming', 13.00, '00:10:00.000000', '8:00-9:00'),
(10021, 4, 7, 'SLU', 'TOWN', 'Upcoming', 13.00, '00:10:00.000000', '9:00-10:00'),
(10022, 5, 8, 'SLU', 'TOWN', 'Upcoming', 13.00, '00:10:00.000000', '10:00-11:00'),
(10023, 6, 9, 'SLU', 'TOWN', 'Upcoming', 13.00, '00:10:00.000000', '11:00-12:00'),
(10024, 7, 10, 'SLU', 'TOWN', 'Upcoming', 13.00, '00:10:00.000000', '12:00-13:00'),
(10025, 8, 11, 'SLU', 'TOWN', 'Upcoming', 13.00, '00:10:00.000000', '13:00-14:00'),
(10026, 9, 12, 'SLU', 'TOWN', 'Upcoming', 13.00, '00:10:00.000000', '14:00-15:00'),
(10027, 10, 13, 'SLU', 'TOWN', 'Upcoming', 13.00, '00:10:00.000000', '15:00-16:00'),
(10028, 11, 14, 'SLU', 'TOWN', 'Upcoming', 13.00, '00:10:00.000000', '16:00-17:00'),
(10029, 12, 15, 'SLU', 'TOWN', 'Upcoming', 13.00, '00:10:00.000000', '17:00-18:00'),
(10030, 1, 4, 'TOWN', 'SLU', 'Available', 13.00, '00:10:00.000000', '6:00-7:00'),
(10031, 2, 5, 'TOWN', 'SLU', 'Upcoming', 13.00, '00:10:00.000000', '7:00-8:00'),
(10032, 3, 6, 'TOWN', 'SLU', 'Upcoming', 13.00, '00:10:00.000000', '8:00-9:00'),
(10033, 4, 7, 'TOWN', 'SLU', 'Upcoming', 13.00, '00:10:00.000000', '9:00-10:00'),
(10034, 5, 8, 'TOWN', 'SLU', 'Upcoming', 13.00, '00:10:00.000000', '10:00-11:00'),
(10035, 6, 9, 'TOWN', 'SLU', 'Upcoming', 13.00, '00:10:00.000000', '11:00-12:00'),
(10036, 7, 10, 'TOWN', 'SLU', 'Upcoming', 13.00, '00:10:00.000000', '12:00-13:00'),
(10037, 8, 11, 'TOWN', 'SLU', 'Upcoming', 13.00, '00:10:00.000000', '13:00-14:00'),
(10038, 9, 12, 'TOWN', 'SLU', 'Upcoming', 13.00, '00:10:00.000000', '14:00-15:00'),
(10039, 10, 13, 'TOWN', 'SLU', 'Upcoming', 13.00, '00:10:00.000000', '15:00-16:00'),
(10040, 11, 14, 'TOWN', 'SLU', 'Upcoming', 13.00, '00:10:00.000000', '16:00-17:00'),
(10041, 12, 15, 'TOWN', 'SLU', 'Upcoming', 13.00, '00:10:00.000000', '17:00-18:00'),
(10042, 1, 4, 'TOWN', 'CHURCH', 'Available', 11.00, '00:10:00.000000', '6:00-7:00'),
(10043, 2, 5, 'TOWN', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '7:00-8:00'),
(10044, 3, 6, 'TOWN', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '8:00-9:00'),
(10045, 4, 7, 'TOWN', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '9:00-10:00'),
(10046, 5, 8, 'TOWN', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '10:00-11:00'),
(10047, 6, 9, 'TOWN', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '11:00-12:00'),
(10048, 7, 10, 'TOWN', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '12:00-13:00'),
(10049, 8, 11, 'TOWN', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '13:00-14:00'),
(10050, 9, 12, 'TOWN', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '14:00-15:00'),
(10051, 10, 13, 'TOWN', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '15:00-16:00'),
(10052, 11, 14, 'TOWN', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '16:00-17:00'),
(10053, 12, 15, 'TOWN', 'CHURCH', 'Upcoming', 11.00, '00:10:00.000000', '17:00-18:00');

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
