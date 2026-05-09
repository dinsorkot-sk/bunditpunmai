CREATE TABLE `news` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	`image` text DEFAULT '' NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`status` text NOT NULL,
	`authorId` integer NOT NULL,
	`createdAt` integer NOT NULL
);
