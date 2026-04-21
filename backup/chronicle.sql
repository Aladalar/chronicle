/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.8.6-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: chronicle_dev
-- ------------------------------------------------------
-- Server version	11.8.6-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `campaign_members`
--

DROP TABLE IF EXISTS `campaign_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaign_members` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `campaign_id` uuid NOT NULL,
  `user_id` uuid DEFAULT NULL,
  `role` enum('dm','player') NOT NULL DEFAULT 'player',
  `invite_code` uuid NOT NULL,
  `invite_claimed` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_75ce5e34655354d7eb855e896d` (`invite_code`),
  KEY `FK_8b6d060c3f938a00c8e76461f1a` (`campaign_id`),
  KEY `FK_4df1dd281dc5fc825499233ef39` (`user_id`),
  CONSTRAINT `FK_4df1dd281dc5fc825499233ef39` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_8b6d060c3f938a00c8e76461f1a` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaign_members`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `campaign_members` WRITE;
/*!40000 ALTER TABLE `campaign_members` DISABLE KEYS */;
INSERT INTO `campaign_members` VALUES
('0be0d2de-072a-4f8c-a03c-66b3824a0ee4','2026-04-16 07:48:28.236359','2026-04-16 07:48:28.236359','c3cc8d18-29ee-48ae-b4fd-b25947ffeea7','3ae6ece4-8947-4e93-9a90-a408bffca141','dm','59bc1bc3-89e3-4cfc-b90a-eca2f4b4e838',1),
('1377f7e7-9d22-4f8b-bc56-7e3bcc2f8476','2026-04-15 15:15:11.216899','2026-04-15 15:15:11.216899','c7b0060a-ffce-4d4d-83c9-ebf056677ed4','3ae6ece4-8947-4e93-9a90-a408bffca141','dm','48e4ee67-60c6-4f01-9e92-3725d324f3e9',1);
/*!40000 ALTER TABLE `campaign_members` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaigns` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` uuid NOT NULL,
  `current_age` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `FK_49da41a196c3d2bd6f5ce1dc3b5` (`created_by`),
  CONSTRAINT `FK_49da41a196c3d2bd6f5ce1dc3b5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
INSERT INTO `campaigns` VALUES
('c3cc8d18-29ee-48ae-b4fd-b25947ffeea7','2026-04-16 07:48:28.233177','2026-04-16 07:48:28.233177','asdasf','asfasfsa','3ae6ece4-8947-4e93-9a90-a408bffca141',1),
('c7b0060a-ffce-4d4d-83c9-ebf056677ed4','2026-04-15 15:15:11.213389','2026-04-15 15:15:11.213389','Main Campaign','First campaign','3ae6ece4-8947-4e93-9a90-a408bffca141',1);
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `character_abilities`
--

DROP TABLE IF EXISTS `character_abilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `character_abilities` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `character_id` uuid NOT NULL,
  `ref_ability_id` uuid DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `rank_id` uuid DEFAULT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK_59c41bf5db3c5a74babffd2ed1c` (`character_id`),
  KEY `FK_b97ff1fff66b3e7abb897ab3518` (`ref_ability_id`),
  KEY `FK_c757096d79125a24cb1ca59c6f8` (`rank_id`),
  CONSTRAINT `FK_59c41bf5db3c5a74babffd2ed1c` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_b97ff1fff66b3e7abb897ab3518` FOREIGN KEY (`ref_ability_id`) REFERENCES `ref_abilities` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_c757096d79125a24cb1ca59c6f8` FOREIGN KEY (`rank_id`) REFERENCES `ref_ranks` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `character_abilities`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `character_abilities` WRITE;
/*!40000 ALTER TABLE `character_abilities` DISABLE KEYS */;
/*!40000 ALTER TABLE `character_abilities` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `character_arcane`
--

DROP TABLE IF EXISTS `character_arcane`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `character_arcane` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `character_id` uuid NOT NULL,
  `element_id` uuid DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `tier` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_38b5b6c64049d02d3bbccf242bc` (`character_id`),
  KEY `FK_008b5ba5de23cb2f9aca57518a1` (`element_id`),
  CONSTRAINT `FK_008b5ba5de23cb2f9aca57518a1` FOREIGN KEY (`element_id`) REFERENCES `ref_arcane_elements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_38b5b6c64049d02d3bbccf242bc` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `character_arcane`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `character_arcane` WRITE;
/*!40000 ALTER TABLE `character_arcane` DISABLE KEYS */;
/*!40000 ALTER TABLE `character_arcane` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `character_attributes`
--

DROP TABLE IF EXISTS `character_attributes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `character_attributes` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `character_id` uuid NOT NULL,
  `attribute` varchar(10) NOT NULL,
  `base` int(11) NOT NULL DEFAULT 0,
  `modifier` int(11) NOT NULL DEFAULT 0,
  `progress` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_0af7fbb18a113e0171495a3bee` (`character_id`,`attribute`),
  CONSTRAINT `FK_31dcc8c9b4ea75a69459235a34c` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `character_attributes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `character_attributes` WRITE;
/*!40000 ALTER TABLE `character_attributes` DISABLE KEYS */;
/*!40000 ALTER TABLE `character_attributes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `character_inventory`
--

DROP TABLE IF EXISTS `character_inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `character_inventory` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `character_id` uuid NOT NULL,
  `ref_item_id` uuid DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `attributes` varchar(100) DEFAULT NULL,
  `rarity` varchar(20) NOT NULL DEFAULT 'Common',
  `item_condition` varchar(20) NOT NULL DEFAULT 'Ok',
  `quantity` int(11) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK_0a12f8fd7953c0d4144121928d0` (`character_id`),
  KEY `FK_dc902baa17dfde0efc9c6d80372` (`ref_item_id`),
  CONSTRAINT `FK_0a12f8fd7953c0d4144121928d0` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_dc902baa17dfde0efc9c6d80372` FOREIGN KEY (`ref_item_id`) REFERENCES `ref_item_templates` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `character_inventory`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `character_inventory` WRITE;
/*!40000 ALTER TABLE `character_inventory` DISABLE KEYS */;
/*!40000 ALTER TABLE `character_inventory` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `character_knowledge`
--

DROP TABLE IF EXISTS `character_knowledge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `character_knowledge` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `character_id` uuid NOT NULL,
  `ref_knowledge_id` uuid DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `progress` int(11) NOT NULL DEFAULT 0,
  `arcane_element_id` uuid DEFAULT NULL,
  `arcane_level` varchar(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK_42c3c8d69b79267acc27faa3630` (`character_id`),
  KEY `FK_9a8addfff730175e2f1b542ec1c` (`ref_knowledge_id`),
  KEY `FK_8e837bb953c5b4a6fa53d900472` (`arcane_element_id`),
  CONSTRAINT `FK_42c3c8d69b79267acc27faa3630` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_8e837bb953c5b4a6fa53d900472` FOREIGN KEY (`arcane_element_id`) REFERENCES `ref_arcane_elements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_9a8addfff730175e2f1b542ec1c` FOREIGN KEY (`ref_knowledge_id`) REFERENCES `ref_knowledge` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `character_knowledge`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `character_knowledge` WRITE;
/*!40000 ALTER TABLE `character_knowledge` DISABLE KEYS */;
/*!40000 ALTER TABLE `character_knowledge` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `character_tasks`
--

DROP TABLE IF EXISTS `character_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `character_tasks` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `character_id` uuid NOT NULL,
  `text` text NOT NULL,
  `is_done` tinyint(4) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK_0d7f1cebaa1590dd00a44fec75b` (`character_id`),
  CONSTRAINT `FK_0d7f1cebaa1590dd00a44fec75b` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `character_tasks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `character_tasks` WRITE;
/*!40000 ALTER TABLE `character_tasks` DISABLE KEYS */;
/*!40000 ALTER TABLE `character_tasks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `character_traits`
--

DROP TABLE IF EXISTS `character_traits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `character_traits` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `character_id` uuid NOT NULL,
  `ref_trait_id` uuid DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `info` text DEFAULT NULL,
  `attribute_mods` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_8bc0dcfea6f07baea708dc25c5c` (`character_id`),
  KEY `FK_21e51777e3367eb290c9a58ad40` (`ref_trait_id`),
  CONSTRAINT `FK_21e51777e3367eb290c9a58ad40` FOREIGN KEY (`ref_trait_id`) REFERENCES `ref_traits` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_8bc0dcfea6f07baea708dc25c5c` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `character_traits`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `character_traits` WRITE;
/*!40000 ALTER TABLE `character_traits` DISABLE KEYS */;
/*!40000 ALTER TABLE `character_traits` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `characters`
--

DROP TABLE IF EXISTS `characters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `characters` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `campaign_id` uuid NOT NULL,
  `owner_id` uuid NOT NULL,
  `race_id` uuid DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `titles` text DEFAULT NULL,
  `souls_energy` int(11) NOT NULL DEFAULT 0,
  `currency_minor` int(11) NOT NULL DEFAULT 0,
  `currency_major` int(11) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `is_companion` tinyint(4) NOT NULL DEFAULT 0,
  `parent_character_id` uuid DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_2b173736524327685635f8e6e92` (`campaign_id`),
  KEY `FK_025221b79ca49c31bcc7f1373c7` (`owner_id`),
  KEY `FK_fbceb34d4391b1e3adb59e65155` (`race_id`),
  KEY `FK_692ffa1302ded11b146b3138f12` (`parent_character_id`),
  CONSTRAINT `FK_025221b79ca49c31bcc7f1373c7` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_2b173736524327685635f8e6e92` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_692ffa1302ded11b146b3138f12` FOREIGN KEY (`parent_character_id`) REFERENCES `characters` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_fbceb34d4391b1e3adb59e65155` FOREIGN KEY (`race_id`) REFERENCES `ref_races` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `characters`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `characters` WRITE;
/*!40000 ALTER TABLE `characters` DISABLE KEYS */;
INSERT INTO `characters` VALUES
('75f6c5ad-6187-42fd-87b9-d3fb1b7aa72c','2026-04-15 15:20:04.105672','2026-04-15 15:20:04.105672','c7b0060a-ffce-4d4d-83c9-ebf056677ed4','3ae6ece4-8947-4e93-9a90-a408bffca141',NULL,'New Character',NULL,0,0,0,NULL,0,NULL);
/*!40000 ALTER TABLE `characters` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ingredient_parts`
--

DROP TABLE IF EXISTS `ingredient_parts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredient_parts` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `ingredient_id` uuid NOT NULL,
  `part` varchar(100) NOT NULL,
  `effect` varchar(100) DEFAULT NULL,
  `power` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_321ad52a2a3c3c02d81b5146b99` (`ingredient_id`),
  CONSTRAINT `FK_321ad52a2a3c3c02d81b5146b99` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredient_parts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ingredient_parts` WRITE;
/*!40000 ALTER TABLE `ingredient_parts` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingredient_parts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ingredients`
--

DROP TABLE IF EXISTS `ingredients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingredients` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `campaign_id` uuid NOT NULL,
  `name` varchar(200) NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `biome` varchar(100) DEFAULT NULL,
  `occurrence` varchar(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_95066d2cb579c092e8fa1442395` (`campaign_id`),
  CONSTRAINT `FK_95066d2cb579c092e8fa1442395` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingredients`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ingredients` WRITE;
/*!40000 ALTER TABLE `ingredients` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingredients` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `journal_entries`
--

DROP TABLE IF EXISTS `journal_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `journal_entries` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `campaign_id` uuid NOT NULL,
  `author_id` uuid NOT NULL,
  `title` varchar(300) NOT NULL,
  `content` text DEFAULT NULL,
  `session_date` date DEFAULT NULL,
  `tags` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_b7855897b38664bca881dc4913e` (`campaign_id`),
  KEY `FK_0b2a93dabfffac0661870c2ca8d` (`author_id`),
  CONSTRAINT `FK_0b2a93dabfffac0661870c2ca8d` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_b7855897b38664bca881dc4913e` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_entries`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `journal_entries` WRITE;
/*!40000 ALTER TABLE `journal_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `journal_entries` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `lore_entries`
--

DROP TABLE IF EXISTS `lore_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `lore_entries` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `campaign_id` uuid NOT NULL,
  `title` varchar(300) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_bd134470fbf8023959cda2e8c87` (`campaign_id`),
  CONSTRAINT `FK_bd134470fbf8023959cda2e8c87` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lore_entries`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `lore_entries` WRITE;
/*!40000 ALTER TABLE `lore_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `lore_entries` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` bigint(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES
(1,1776242137500,'Init1776242137500');
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `proposals`
--

DROP TABLE IF EXISTS `proposals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `proposals` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `author_id` uuid NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `op` enum('create','update','delete') NOT NULL,
  `target_id` uuid DEFAULT NULL,
  `data` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `reason` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_8af17413dd39a475692dec170d0` (`author_id`),
  CONSTRAINT `FK_8af17413dd39a475692dec170d0` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `proposals`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `proposals` WRITE;
/*!40000 ALTER TABLE `proposals` DISABLE KEYS */;
/*!40000 ALTER TABLE `proposals` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_abilities`
--

DROP TABLE IF EXISTS `ref_abilities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_abilities` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `type_id` uuid DEFAULT NULL,
  `attribute` varchar(10) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_33f1b02a69e825ac36e771adc13` (`type_id`),
  CONSTRAINT `FK_33f1b02a69e825ac36e771adc13` FOREIGN KEY (`type_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_abilities`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_abilities` WRITE;
/*!40000 ALTER TABLE `ref_abilities` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_abilities` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_arcane_elements`
--

DROP TABLE IF EXISTS `ref_arcane_elements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_arcane_elements` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_arcane_elements`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_arcane_elements` WRITE;
/*!40000 ALTER TABLE `ref_arcane_elements` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_arcane_elements` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_beasts`
--

DROP TABLE IF EXISTS `ref_beasts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_beasts` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `habitat` varchar(200) DEFAULT NULL,
  `threat_level` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_beasts`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_beasts` WRITE;
/*!40000 ALTER TABLE `ref_beasts` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_beasts` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_dungeons`
--

DROP TABLE IF EXISTS `ref_dungeons`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_dungeons` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `inhabitant` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_dungeons`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_dungeons` WRITE;
/*!40000 ALTER TABLE `ref_dungeons` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_dungeons` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_flora`
--

DROP TABLE IF EXISTS `ref_flora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_flora` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `biome` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_flora`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_flora` WRITE;
/*!40000 ALTER TABLE `ref_flora` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_flora` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_gods`
--

DROP TABLE IF EXISTS `ref_gods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_gods` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `domain` varchar(200) DEFAULT NULL,
  `type_id` uuid DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ecba855353b0f014c2d529ad44e` (`type_id`),
  CONSTRAINT `FK_ecba855353b0f014c2d529ad44e` FOREIGN KEY (`type_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_gods`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_gods` WRITE;
/*!40000 ALTER TABLE `ref_gods` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_gods` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_item_templates`
--

DROP TABLE IF EXISTS `ref_item_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_item_templates` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `type_id` uuid DEFAULT NULL,
  `rarity_id` uuid DEFAULT NULL,
  `attributes` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_cca45411c32d3f1eb472d499ffd` (`type_id`),
  KEY `FK_6bb3390c44b55363cfbb4d45ab6` (`rarity_id`),
  CONSTRAINT `FK_6bb3390c44b55363cfbb4d45ab6` FOREIGN KEY (`rarity_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_cca45411c32d3f1eb472d499ffd` FOREIGN KEY (`type_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_item_templates`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_item_templates` WRITE;
/*!40000 ALTER TABLE `ref_item_templates` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_item_templates` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_items`
--

DROP TABLE IF EXISTS `ref_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_items` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `template_id` uuid DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `attributes` varchar(200) DEFAULT NULL,
  `rarity_id` uuid DEFAULT NULL,
  `type_id` uuid DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_2a6a6480a121cc6052476227396` (`template_id`),
  KEY `FK_0a4ea21221699ac44a14d13be46` (`rarity_id`),
  KEY `FK_0815415ede54124e3eeb28a7b24` (`type_id`),
  CONSTRAINT `FK_0815415ede54124e3eeb28a7b24` FOREIGN KEY (`type_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_0a4ea21221699ac44a14d13be46` FOREIGN KEY (`rarity_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_2a6a6480a121cc6052476227396` FOREIGN KEY (`template_id`) REFERENCES `ref_item_templates` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_items`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_items` WRITE;
/*!40000 ALTER TABLE `ref_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_items` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_knowledge`
--

DROP TABLE IF EXISTS `ref_knowledge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_knowledge` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `type_id` uuid DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_e6ba4f8827600a30ca9ed45bca1` (`type_id`),
  CONSTRAINT `FK_e6ba4f8827600a30ca9ed45bca1` FOREIGN KEY (`type_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_knowledge`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_knowledge` WRITE;
/*!40000 ALTER TABLE `ref_knowledge` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_knowledge` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_materials`
--

DROP TABLE IF EXISTS `ref_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_materials` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `type_id` uuid DEFAULT NULL,
  `biome` varchar(200) DEFAULT NULL,
  `occurrence` varchar(200) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `parts` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_8163d24ba58880cdbc4fe2bb0a5` (`type_id`),
  CONSTRAINT `FK_8163d24ba58880cdbc4fe2bb0a5` FOREIGN KEY (`type_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_materials`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_materials` WRITE;
/*!40000 ALTER TABLE `ref_materials` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_materials` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_monsters`
--

DROP TABLE IF EXISTS `ref_monsters`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_monsters` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `type_id` uuid DEFAULT NULL,
  `threat_level` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_2b370d44e53a6f1116dd6d1f0aa` (`type_id`),
  CONSTRAINT `FK_2b370d44e53a6f1116dd6d1f0aa` FOREIGN KEY (`type_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_monsters`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_monsters` WRITE;
/*!40000 ALTER TABLE `ref_monsters` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_monsters` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_npc_important`
--

DROP TABLE IF EXISTS `ref_npc_important`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_npc_important` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `race_id` uuid DEFAULT NULL,
  `role` varchar(200) DEFAULT NULL,
  `affiliation` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_32e5baca55c42344311543aec3d` (`race_id`),
  CONSTRAINT `FK_32e5baca55c42344311543aec3d` FOREIGN KEY (`race_id`) REFERENCES `ref_races` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_npc_important`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_npc_important` WRITE;
/*!40000 ALTER TABLE `ref_npc_important` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_npc_important` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_npc_other`
--

DROP TABLE IF EXISTS `ref_npc_other`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_npc_other` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `race_id` uuid DEFAULT NULL,
  `role` varchar(200) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_813ae768b5ba2744226f29fb8d7` (`race_id`),
  CONSTRAINT `FK_813ae768b5ba2744226f29fb8d7` FOREIGN KEY (`race_id`) REFERENCES `ref_races` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_npc_other`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_npc_other` WRITE;
/*!40000 ALTER TABLE `ref_npc_other` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_npc_other` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_races`
--

DROP TABLE IF EXISTS `ref_races`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_races` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `description` text DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_races`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_races` WRITE;
/*!40000 ALTER TABLE `ref_races` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_races` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_ranks`
--

DROP TABLE IF EXISTS `ref_ranks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_ranks` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `tier_order` int(11) NOT NULL DEFAULT 0,
  `progress_cap` int(11) NOT NULL DEFAULT 10,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_ranks`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_ranks` WRITE;
/*!40000 ALTER TABLE `ref_ranks` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_ranks` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_ruins`
--

DROP TABLE IF EXISTS `ref_ruins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_ruins` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `origin` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_ruins`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_ruins` WRITE;
/*!40000 ALTER TABLE `ref_ruins` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_ruins` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_runes`
--

DROP TABLE IF EXISTS `ref_runes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_runes` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `effect` varchar(200) DEFAULT NULL,
  `arcane` varchar(100) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_runes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_runes` WRITE;
/*!40000 ALTER TABLE `ref_runes` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_runes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_settlements`
--

DROP TABLE IF EXISTS `ref_settlements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_settlements` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `population` int(11) DEFAULT NULL,
  `governance` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_settlements`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_settlements` WRITE;
/*!40000 ALTER TABLE `ref_settlements` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_settlements` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_spells`
--

DROP TABLE IF EXISTS `ref_spells`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_spells` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `type_id` uuid DEFAULT NULL,
  `arcane_id` uuid DEFAULT NULL,
  `level` varchar(20) DEFAULT NULL,
  `cost` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_393e1062fd5cdfeeccceedb1dcd` (`type_id`),
  KEY `FK_a685e991e7a6aba867ef24d288f` (`arcane_id`),
  CONSTRAINT `FK_393e1062fd5cdfeeccceedb1dcd` FOREIGN KEY (`type_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_a685e991e7a6aba867ef24d288f` FOREIGN KEY (`arcane_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_spells`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_spells` WRITE;
/*!40000 ALTER TABLE `ref_spells` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_spells` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_tomes`
--

DROP TABLE IF EXISTS `ref_tomes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_tomes` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `source` varchar(200) DEFAULT NULL,
  `type_id` uuid DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_7458c216461692e6adaca15fffb` (`type_id`),
  CONSTRAINT `FK_7458c216461692e6adaca15fffb` FOREIGN KEY (`type_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_tomes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_tomes` WRITE;
/*!40000 ALTER TABLE `ref_tomes` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_tomes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_traits`
--

DROP TABLE IF EXISTS `ref_traits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_traits` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `default_mods` text DEFAULT NULL,
  `type_id` uuid DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_32a9482d9aad9ddb119e5d8b958` (`type_id`),
  CONSTRAINT `FK_32a9482d9aad9ddb119e5d8b958` FOREIGN KEY (`type_id`) REFERENCES `ref_types` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_traits`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_traits` WRITE;
/*!40000 ALTER TABLE `ref_traits` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_traits` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_transmutations`
--

DROP TABLE IF EXISTS `ref_transmutations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_transmutations` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `notation` varchar(300) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `level` varchar(20) DEFAULT NULL,
  `cost` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_transmutations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_transmutations` WRITE;
/*!40000 ALTER TABLE `ref_transmutations` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_transmutations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_types`
--

DROP TABLE IF EXISTS `ref_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_types` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(100) NOT NULL,
  `color` varchar(7) DEFAULT NULL,
  `designations` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `icon` varchar(15) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_types`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_types` WRITE;
/*!40000 ALTER TABLE `ref_types` DISABLE KEYS */;
INSERT INTO `ref_types` VALUES
('06ef9be0-d7f5-4371-a643-0df24f66977d','2026-04-20 10:53:05.633253','2026-04-20 10:53:05.633253','Normal','#ffffff','[\"monster\"]',1,NULL),
('66d198d2-053d-4dc0-85a5-0fdc45f7efb5','2026-04-20 09:50:11.344003','2026-04-20 09:50:11.344003','Leather','#995900','[\"material\"]',1,'horse'),
('8caefc90-a902-404e-8ab4-122978c6d035','2026-04-20 09:03:19.314577','2026-04-20 09:03:19.314577','Shadow','#5f4f72','[\"arcane\"]',-2,'moon'),
('21973d48-d75c-49d1-96fa-1f024eca85e4','2026-04-20 08:51:00.952011','2026-04-20 08:58:35.000000','Speciality','#00bd26','[\"ability\",\"knowledge\",\"trait\"]',10,'star'),
('92155c20-3384-4c21-be36-2468e6102c76','2026-04-20 09:44:51.013159','2026-04-20 09:44:51.013159','Lore','#ffffff','[\"item\"]',2,'book'),
('43db3e85-bc04-449a-a911-26ce62633b4a','2026-04-17 14:02:02.438808','2026-04-17 14:02:02.438808','Rare','#7033ff','[\"rarity\"]',2,NULL),
('0995fea8-5f50-41d2-a44f-27696cda39d9','2026-04-20 09:45:28.757592','2026-04-20 09:45:28.757592','Quest','#f9f0b4','[\"item\"]',5,'question'),
('80516852-0c0c-42ec-b7c4-2f1951042766','2026-04-20 10:53:36.265296','2026-04-20 10:53:36.265296','Hollow','#0000ff','[\"monster\"]',1,NULL),
('24189eca-71a9-4ee2-b2f1-2fa24cfdb5ff','2026-04-20 09:51:29.391343','2026-04-20 09:51:29.391343','Wood','#ad7600','[\"material\"]',1,'tree'),
('7ba7fd5f-f975-414f-abe9-32c426be17d4','2026-04-20 09:00:31.981498','2026-04-20 09:00:31.981498','Earth','#058703','[\"arcane\"]',1,'mountain-sun'),
('3d1a9395-792f-4f9f-a8ee-33b72aed8ebd','2026-04-20 09:02:30.537190','2026-04-20 09:02:30.537190','Light','#ffbb00','[\"arcane\"]',2,'sun'),
('1ea86280-e316-40da-8ab7-34a693698061','2026-04-20 09:41:55.775551','2026-04-20 09:41:55.775551','Equipment','#fa0092','[\"item\"]',3,'ring'),
('65d00d81-0171-4f10-a389-3a96ec3c6978','2026-04-17 14:03:09.552334','2026-04-17 14:03:09.552334','Legendary','#ffd500','[\"rarity\"]',5,NULL),
('a12eaa92-461e-490c-8164-3e5e592d2117','2026-04-20 08:57:20.714086','2026-04-20 08:57:49.000000','Fight','#ff0000','[\"ability\",\"knowledge\",\"spell\",\"trait\"]',1,NULL),
('fe014bfe-2c70-4467-b8b0-4292c7f310f8','2026-04-20 09:01:09.230446','2026-04-20 09:01:36.000000','Water','#0062ff','[\"arcane\"]',1,'water'),
('c834caa1-da0f-4d59-a6a3-5c4a06106366','2026-04-20 08:55:54.508091','2026-04-20 08:55:54.508091','Healing','#009933','[\"spell\"]',2,'square-plus'),
('3f18bbfe-0763-446c-a375-5cb9750c3cbb','2026-04-20 09:38:17.050997','2026-04-20 09:38:17.050997','Ammunition','#808080','[\"item\"]',2,'asterisk'),
('63e955a2-f9c9-49ad-a443-60383646e753','2026-04-20 08:51:32.655646','2026-04-20 09:48:40.000000','Misc','#e08300','[\"ability\",\"knowledge\",\"trait\",\"item\",\"tome\",\"spell\"]',100,'diamond'),
('b640f456-c39c-4f36-807a-62317c7586e1','2026-04-18 13:41:28.792588','2026-04-20 08:59:25.000000','Social','#aab512','[\"ability\",\"knowledge\",\"trait\",\"spell\"]',3,'crown'),
('d5c69160-e210-4c01-9094-639f35689d35','2026-04-20 10:42:50.880559','2026-04-20 10:42:50.880559','Shei\'Rhei','#ebb800','[\"god\"]',2,NULL),
('06d1dc5a-a664-45c4-944d-699376f1fa40','2026-04-20 10:12:58.464975','2026-04-20 10:12:58.464975','Imperial Platinum','#ffffff','[\"currency\"]',1,NULL),
('52758b5c-d622-4125-b89f-6cadb22b72e8','2026-04-17 14:03:29.032844','2026-04-17 14:03:35.000000','Uniqe','#ff0000','[\"rarity\"]',6,NULL),
('479eae76-e7b2-42a1-8511-7968574960f1','2026-04-20 10:42:20.152287','2026-04-20 10:42:20.152287','Mallum','#bd0000','[\"god\"]',-1,NULL),
('da68fa40-7b26-4019-9b34-8c3f7085ff80','2026-04-20 09:42:53.921373','2026-04-20 09:42:53.921373','Food','#7ee203','[\"item\"]',3,'fish'),
('7709d4f0-1568-405e-a153-8d2db8fa765b','2026-04-20 10:12:29.414706','2026-04-20 10:12:29.414706','Minor','#808080','[\"currency\"]',1,NULL),
('3746a08a-b95b-48e4-86c1-8ec0e3600abf','2026-04-20 09:06:07.998231','2026-04-20 09:06:07.998231','Weapon','#ff0000','[\"item\"]',1,'hand-fist'),
('6a1ef2ae-f8f5-4a3c-8dfa-95cd807c5cfc','2026-04-20 10:53:14.265661','2026-04-20 10:53:14.265661','Shadow','#808080','[\"monster\"]',1,NULL),
('9bac710b-8074-460a-8a41-9e6e7e55ea2e','2026-04-20 09:53:29.530059','2026-04-20 09:53:29.530059','Fabric','#ab94ff','[\"material\"]',1,'layer-group'),
('db201db3-01ff-45eb-8f9d-a0ec070f689a','2026-04-20 09:00:07.461476','2026-04-20 09:00:07.461476','Fire','#ff0000','[\"arcane\"]',1,'fire'),
('9097520a-3f0b-4609-a32c-a17fb4ec6950','2026-04-18 14:04:26.031615','2026-04-20 08:58:23.000000','Exploration','#0099ad','[\"ability\",\"knowledge\",\"trait\",\"spell\"]',2,'map'),
('f8ca9065-112f-4b97-8fb9-a4af4954bf7a','2026-04-17 14:00:32.451916','2026-04-17 15:00:50.000000','Common','#ffffff','[\"rarity\"]',0,NULL),
('785ce52b-1bb6-4941-8d0f-acbc60d2f945','2026-04-18 13:36:09.398961','2026-04-20 08:57:58.000000','Craft','#2832bd','[\"ability\",\"knowledge\",\"trait\",\"spell\"]',2,'hammer'),
('ab07e4aa-6f13-41ed-832b-b03a465fe3fb','2026-04-20 09:52:22.425136','2026-04-20 09:52:22.425136','Glass','#80afb3','[\"material\"]',1,NULL),
('11b7fde9-0cfb-48f2-b82f-b6e67aa29c3d','2026-04-17 14:01:25.078669','2026-04-17 14:01:25.078669','Uncommon','#00ff91','[\"rarity\"]',1,NULL),
('9dca8c7e-8bd2-4444-bafa-b89d0df1f02e','2026-04-20 09:51:47.615640','2026-04-20 09:52:02.000000','Steel','#b0b0b0','[\"material\"]',1,'gears'),
('f016b190-2133-45df-814a-ba14fb09f11d','2026-04-17 14:02:44.735202','2026-04-17 14:02:44.735202','Epic','#e100ff','[\"rarity\"]',4,NULL),
('b9452d55-c16c-4f65-9755-bb3df7ddfd1f','2026-04-20 10:12:44.024388','2026-04-20 10:12:44.024388','Major','#ffc800','[\"currency\"]',1,NULL),
('39e2ed4d-d0b2-47eb-806e-c2f9f5723cca','2026-04-20 09:00:49.773986','2026-04-20 09:00:49.773986','Air','#808080','[\"arcane\"]',1,'wind'),
('b5288ec6-e82f-4c57-8b70-c7d43b42cb5c','2026-04-20 09:42:32.754138','2026-04-20 09:42:32.754138','Meds','#008f18','[\"item\"]',3,'square-plus'),
('276d8543-9851-40cf-b3ea-cc3345ae3622','2026-04-20 10:14:43.308300','2026-04-20 10:15:14.000000','Bellum','#004be0','[\"god\"]',1,NULL),
('d449bd46-8243-4101-9c93-cc3bc3e00e12','2026-04-20 09:06:52.376356','2026-04-20 09:06:52.376356','Material','#0091ff','[\"item\"]',1,'gears'),
('4bccd01b-fc68-4a44-9ecb-ccd723825c52','2026-04-20 10:53:54.650489','2026-04-20 10:53:54.650489','Elemental','#ff0000','[\"monster\"]',1,NULL),
('30dd64b4-2d7f-48ab-b49c-d4e9dff45bca','2026-04-20 09:06:22.727131','2026-04-20 09:06:22.727131','Tool','#3700ff','[\"item\"]',1,NULL),
('ac323805-230e-443d-9888-ec0f3c4c6ff4','2026-04-20 10:44:33.868292','2026-04-20 10:44:33.868292','Shaj\'Rhûn','#808080','[\"god\"]',2,NULL),
('98a34b06-c3d9-431b-8c1b-f1116c54184c','2026-04-20 09:44:07.092322','2026-04-20 09:44:07.092322','Armor','#ff5c5c','[\"item\"]',1,'shield-halved'),
('d92d4c49-bec6-4503-8367-f6c96ff811bc','2026-04-20 09:51:01.238212','2026-04-20 09:51:01.238212','Metal','#808080','[\"material\"]',1,'coins'),
('f4dbeb0f-0487-481a-8562-ff367feed809','2026-04-20 10:15:02.972786','2026-04-20 10:15:02.972786','Deum','#00a832','[\"god\"]',-1,NULL);
/*!40000 ALTER TABLE `ref_types` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `ref_wonders`
--

DROP TABLE IF EXISTS `ref_wonders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `ref_wonders` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `age` int(11) DEFAULT NULL,
  `kind` varchar(200) DEFAULT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ref_wonders`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `ref_wonders` WRITE;
/*!40000 ALTER TABLE `ref_wonders` DISABLE KEYS */;
/*!40000 ALTER TABLE `ref_wonders` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `runes`
--

DROP TABLE IF EXISTS `runes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `runes` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `campaign_id` uuid NOT NULL,
  `name` varchar(200) NOT NULL,
  `effect` varchar(200) DEFAULT NULL,
  `arcane` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(20) NOT NULL DEFAULT 'effect',
  PRIMARY KEY (`id`),
  KEY `FK_7abb3bd53a51e8cbc4152a33ffc` (`campaign_id`),
  CONSTRAINT `FK_7abb3bd53a51e8cbc4152a33ffc` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `runes`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `runes` WRITE;
/*!40000 ALTER TABLE `runes` DISABLE KEYS */;
/*!40000 ALTER TABLE `runes` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sound_ambient`
--

DROP TABLE IF EXISTS `sound_ambient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sound_ambient` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `path` varchar(500) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `volume` int(11) NOT NULL DEFAULT 80,
  `loop` varchar(3) NOT NULL DEFAULT 'no',
  `loop_delay` int(11) NOT NULL DEFAULT 0,
  `fade_in` float NOT NULL DEFAULT 0,
  `fade_out` float NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sound_ambient`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sound_ambient` WRITE;
/*!40000 ALTER TABLE `sound_ambient` DISABLE KEYS */;
/*!40000 ALTER TABLE `sound_ambient` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sound_effects`
--

DROP TABLE IF EXISTS `sound_effects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sound_effects` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `path` varchar(500) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `volume` int(11) NOT NULL DEFAULT 80,
  `loop` varchar(3) NOT NULL DEFAULT 'no',
  `loop_delay` int(11) NOT NULL DEFAULT 0,
  `fade_in` float NOT NULL DEFAULT 0,
  `fade_out` float NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sound_effects`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sound_effects` WRITE;
/*!40000 ALTER TABLE `sound_effects` DISABLE KEYS */;
INSERT INTO `sound_effects` VALUES
('6058750c-0192-4334-a133-0c80624e7498','2026-04-20 08:46:04.880083','2026-04-20 08:46:04.880083','Forest Day BGM','/home/res/BGS/Forest Day/Forest Day.ogg ','[\"BGM\",\"Forest\",\"Calm\",\"Day\"]',80,'yes',0,0,0,'BGM for forest scenes');
/*!40000 ALTER TABLE `sound_effects` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sound_music`
--

DROP TABLE IF EXISTS `sound_music`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sound_music` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `path` varchar(500) DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `volume` int(11) NOT NULL DEFAULT 80,
  `loop` varchar(3) NOT NULL DEFAULT 'no',
  `loop_delay` int(11) NOT NULL DEFAULT 0,
  `fade_in` float NOT NULL DEFAULT 0,
  `fade_out` float NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sound_music`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sound_music` WRITE;
/*!40000 ALTER TABLE `sound_music` DISABLE KEYS */;
/*!40000 ALTER TABLE `sound_music` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `sound_presets`
--

DROP TABLE IF EXISTS `sound_presets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sound_presets` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `name` varchar(200) NOT NULL,
  `tags` text DEFAULT NULL,
  `fade_in_duration` float NOT NULL DEFAULT 2,
  `fade_out_duration` float NOT NULL DEFAULT 2,
  `music_track` text DEFAULT NULL,
  `ambient_layers` text DEFAULT NULL,
  `sound_buttons` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sound_presets`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `sound_presets` WRITE;
/*!40000 ALTER TABLE `sound_presets` DISABLE KEYS */;
INSERT INTO `sound_presets` VALUES
('cb930ee7-117a-4ec9-81d6-5181767e0fda','2026-04-20 08:47:17.657946','2026-04-20 08:48:08.000000','Forest Soundboard','[\"Forest\",\"Fight\",\"Casual\"]',2,2,'{\"trackName\":\"\",\"volume\":80,\"loop\":\"yes\",\"loopDelay\":0,\"fadeIn\":2,\"fadeOut\":2}','[{\"trackId\":null,\"trackName\":\"Forest Day BGM\",\"volume\":80,\"loop\":\"yes\",\"loopDelay\":0,\"fadeIn\":1,\"fadeOut\":1}]','[{\"trackId\":null,\"trackName\":\"Forest Day BGM\",\"volume\":80,\"loop\":\"yes\",\"loopDelay\":0,\"fadeIn\":1,\"fadeOut\":1}]','Just default test sound board');
/*!40000 ALTER TABLE `sound_presets` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `transmutations`
--

DROP TABLE IF EXISTS `transmutations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `transmutations` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `campaign_id` uuid NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `notation` varchar(300) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `level` varchar(20) DEFAULT NULL,
  `cost` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_20b43dcf56e89ffb7e50baa183e` (`campaign_id`),
  CONSTRAINT `FK_20b43dcf56e89ffb7e50baa183e` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transmutations`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `transmutations` WRITE;
/*!40000 ALTER TABLE `transmutations` DISABLE KEYS */;
/*!40000 ALTER TABLE `transmutations` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` uuid NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updated_at` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `role` enum('dm','player') NOT NULL DEFAULT 'player',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_fe0bb3f6520ee0469504521e71` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

SET @OLD_AUTOCOMMIT=@@AUTOCOMMIT, @@AUTOCOMMIT=0;
LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
('3ae6ece4-8947-4e93-9a90-a408bffca141','2026-04-15 10:36:57.997996','2026-04-15 10:36:57.997996','admin','$2b$12$4p5m8xHu0rKJKNRRGayzYeLdprpheKmgBTzJaB/KRmkrEnCynC0U2','admin','dm');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
COMMIT;
SET AUTOCOMMIT=@OLD_AUTOCOMMIT;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-04-21  9:15:44
