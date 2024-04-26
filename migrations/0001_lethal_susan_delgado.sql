DROP INDEX IF EXISTS `name_idx`;--> statement-breakpoint
CREATE INDEX `created_at_name_idx` ON `queue` (`created_at`,`running`);--> statement-breakpoint
CREATE INDEX `name_created_at_idx` ON `queue` (`running`,`created_at`);