-- Translation tables for i18n support
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `post_translations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`postId` integer NOT NULL,
	`locale` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_post_translations_post_locale` ON `post_translations` (`postId`, `locale`);--> statement-breakpoint
CREATE TABLE `blog_translations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`blogId` integer NOT NULL,
	`locale` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`blogId`) REFERENCES `blogs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_blog_translations_blog_locale` ON `blog_translations` (`blogId`, `locale`);--> statement-breakpoint
CREATE TABLE `course_translations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`courseId` integer NOT NULL,
	`locale` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_course_translations_course_locale` ON `course_translations` (`courseId`, `locale`);--> statement-breakpoint
CREATE TABLE `tag_translations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tagId` integer NOT NULL,
	`locale` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`tagId`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_tag_translations_tag_locale` ON `tag_translations` (`tagId`, `locale`);--> statement-breakpoint
CREATE TABLE `resource_translations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`resourceId` integer NOT NULL,
	`locale` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	FOREIGN KEY (`resourceId`) REFERENCES `resources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_resource_translations_resource_locale` ON `resource_translations` (`resourceId`, `locale`);--> statement-breakpoint
CREATE TABLE `image_translations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`imageId` integer NOT NULL,
	`locale` text NOT NULL,
	`altText` text NOT NULL,
	FOREIGN KEY (`imageId`) REFERENCES `images`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_image_translations_image_locale` ON `image_translations` (`imageId`, `locale`);--> statement-breakpoint
CREATE TABLE `video_translations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`videoId` integer NOT NULL,
	`locale` text NOT NULL,
	`altText` text NOT NULL,
	FOREIGN KEY (`videoId`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uq_video_translations_video_locale` ON `video_translations` (`videoId`, `locale`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
