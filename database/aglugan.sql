-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Oct 22, 2024 at 03:55 PM
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
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `ride_id`, `amount`, `payment_method`, `status`, `phone_number`, `user_id`) VALUES
(1, NULL, 13.00, 'Gcash', 'pending', 0, 0),
(2, NULL, 13.00, 'cash', 'pending', 0, 0),
(3, NULL, 13.00, 'cash', 'completed', 0, 0),
(4, NULL, 13.00, 'Maya', 'failed', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

DROP TABLE IF EXISTS `ratings`;
CREATE TABLE IF NOT EXISTS `ratings` (
  `rating_id` int NOT NULL AUTO_INCREMENT,
  `ride_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `score` int DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`rating_id`),
  KEY `ride_id` (`ride_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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
  `status` enum('on-route','waiting','unavailable') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fare` decimal(10,2) NOT NULL,
  `waiting_time` time(6) NOT NULL,
  PRIMARY KEY (`ride_id`),
  KEY `passenger_id` (`user_id`),
  KEY `driver_id` (`driver_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10004 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rides`
--

INSERT INTO `rides` (`ride_id`, `user_id`, `driver_id`, `start_location`, `end_location`, `status`, `fare`, `waiting_time`) VALUES
(1001, 1, 4, 'Bakakeng', 'Town', 'on-route', 13.00, '00:10:00.000000'),
(1002, 2, 5, 'Bakakeng', 'Town', 'waiting', 13.00, '00:05:00.000000'),
(1003, 5, 6, 'Town', 'Bakakeng', 'unavailable', 13.00, '00:00:00.000000'),
(10003, NULL, NULL, 'Town', 'Bakakeng', 'on-route', 13.00, '00:05:00.000000');

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
  `user_type` enum('passenger','driver') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  KEY `name` (`name`(250))
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password_hash`, `phone_number`, `user_type`) VALUES
(1, 'Marc Pogi', 'pogi@email.com', '123', '09090909091', 'passenger'),
(2, 'Marron', 'angas@email.com', '1234', '09696969696', 'passenger'),
(3, 'Daniga', 'black@email.com', '123', '09321532561', 'passenger'),
(4, 'JM', 'ffegzsdg@email.com', '123', '09937485021', 'driver'),
(5, 'Driver2', 'driver@email.com', '123', '0912345627481', 'driver'),
(6, 'Driver3', 'driver3@email.com', '123', '0926481726412', 'driver');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
CREATE TABLE IF NOT EXISTS `vehicles` (
  `vehicle_id` int NOT NULL AUTO_INCREMENT,
  `driver_id` int DEFAULT NULL,
  `capacity` int NOT NULL,
  `plate_number` varchar(1234) COLLATE utf8mb4_unicode_ci NOT NULL,
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
