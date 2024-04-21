CREATE TABLE `queue` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`input` text,
	`output` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`running` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `name_idx` ON `queue` (`created_at`,`running`);