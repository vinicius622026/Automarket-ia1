CREATE TABLE `bulk_import_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeId` int NOT NULL,
	`status` enum('PENDING','PROCESSING','COMPLETED','FAILED') NOT NULL DEFAULT 'PENDING',
	`totalRecords` int NOT NULL,
	`processedRecords` int NOT NULL DEFAULT 0,
	`failedRecords` int NOT NULL DEFAULT 0,
	`errorLog` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `bulk_import_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `car_photos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`carId` int NOT NULL,
	`urls` json NOT NULL,
	`orderIndex` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `car_photos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cars` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`storeId` int,
	`brand` varchar(100) NOT NULL,
	`model` varchar(100) NOT NULL,
	`version` varchar(100) NOT NULL,
	`yearFab` int NOT NULL,
	`yearModel` int NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`mileage` int NOT NULL,
	`transmission` enum('MANUAL','AUTOMATIC','CVT') NOT NULL,
	`fuel` enum('FLEX','GASOLINE','DIESEL','ELECTRIC','HYBRID') NOT NULL,
	`color` varchar(50) NOT NULL,
	`description` text,
	`features` json,
	`status` enum('DRAFT','ACTIVE','SOLD','BANNED') NOT NULL DEFAULT 'DRAFT',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`carId` int NOT NULL,
	`senderId` int NOT NULL,
	`receiverId` int NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int NOT NULL,
	`fullName` text NOT NULL,
	`avatarUrl` text,
	`phone` varchar(20),
	`location` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sellerId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`carId` int,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_review` UNIQUE(`sellerId`,`reviewerId`,`carId`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` text NOT NULL,
	`slug` varchar(255) NOT NULL,
	`logoUrl` text,
	`document` varchar(20) NOT NULL,
	`apiKey` varchar(64) NOT NULL,
	`isVerified` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`),
	CONSTRAINT `stores_slug_unique` UNIQUE(`slug`),
	CONSTRAINT `stores_apiKey_unique` UNIQUE(`apiKey`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`carId` int NOT NULL,
	`buyerId` int NOT NULL,
	`sellerId` int NOT NULL,
	`proposedPrice` decimal(12,2),
	`status` enum('PENDING','ACCEPTED','REJECTED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','store_owner') NOT NULL DEFAULT 'user';--> statement-breakpoint
CREATE INDEX `store_idx` ON `bulk_import_jobs` (`storeId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `bulk_import_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `car_idx` ON `car_photos` (`carId`);--> statement-breakpoint
CREATE INDEX `order_idx` ON `car_photos` (`carId`,`orderIndex`);--> statement-breakpoint
CREATE INDEX `seller_idx` ON `cars` (`sellerId`);--> statement-breakpoint
CREATE INDEX `store_idx` ON `cars` (`storeId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `cars` (`status`);--> statement-breakpoint
CREATE INDEX `brand_model_idx` ON `cars` (`brand`,`model`);--> statement-breakpoint
CREATE INDEX `price_idx` ON `cars` (`price`);--> statement-breakpoint
CREATE INDEX `year_idx` ON `cars` (`yearModel`);--> statement-breakpoint
CREATE INDEX `car_idx` ON `messages` (`carId`);--> statement-breakpoint
CREATE INDEX `sender_idx` ON `messages` (`senderId`);--> statement-breakpoint
CREATE INDEX `receiver_idx` ON `messages` (`receiverId`);--> statement-breakpoint
CREATE INDEX `conversation_idx` ON `messages` (`carId`,`senderId`,`receiverId`);--> statement-breakpoint
CREATE INDEX `seller_idx` ON `reviews` (`sellerId`);--> statement-breakpoint
CREATE INDEX `reviewer_idx` ON `reviews` (`reviewerId`);--> statement-breakpoint
CREATE INDEX `owner_idx` ON `stores` (`ownerId`);--> statement-breakpoint
CREATE INDEX `slug_idx` ON `stores` (`slug`);--> statement-breakpoint
CREATE INDEX `car_idx` ON `transactions` (`carId`);--> statement-breakpoint
CREATE INDEX `buyer_idx` ON `transactions` (`buyerId`);--> statement-breakpoint
CREATE INDEX `seller_idx` ON `transactions` (`sellerId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `transactions` (`status`);