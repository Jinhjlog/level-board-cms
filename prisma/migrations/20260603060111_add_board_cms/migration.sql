-- AlterTable
ALTER TABLE `users` ADD COLUMN `level` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `boards` (
    `id` CHAR(26) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `read_level` INTEGER NOT NULL DEFAULT 1,
    `write_level` INTEGER NOT NULL DEFAULT 1,
    `comment_level` INTEGER NOT NULL DEFAULT 1,
    `manager_id` CHAR(26) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` CHAR(26) NOT NULL,
    `board_id` CHAR(26) NOT NULL,
    `author_id` CHAR(26) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_posts_board_created`(`board_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` CHAR(26) NOT NULL,
    `post_id` CHAR(26) NOT NULL,
    `author_id` CHAR(26) NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_comments_post_created`(`post_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_attachments` (
    `id` CHAR(26) NOT NULL,
    `post_id` CHAR(26) NOT NULL,
    `storage_key` VARCHAR(500) NOT NULL,
    `url` VARCHAR(1000) NOT NULL,
    `original_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(100) NOT NULL,
    `file_size` INTEGER NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_post_attachments_post`(`post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `fk_posts_board` FOREIGN KEY (`board_id`) REFERENCES `boards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_attachments` ADD CONSTRAINT `fk_post_attachments_post` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
