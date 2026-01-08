-- Veritabanı ve tabloları kontrol etmek için SQL sorguları

-- 1. Veritabanının var olup olmadığını kontrol et
SELECT name FROM sys.databases WHERE name = 'ProjectManagementSystemDb';

-- 2. Tüm tabloları listele
USE ProjectManagementSystemDb;
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- 3. Roles tablosunu kontrol et
SELECT * FROM Roles;

-- 4. Users tablosunu kontrol et
SELECT * FROM Users;

-- 5. Projects tablosunu kontrol et
SELECT * FROM Projects;

-- 6. TaskItems tablosunu kontrol et
SELECT * FROM TaskItems;

-- 7. ProjectUsers tablosunu kontrol et
SELECT * FROM ProjectUsers;

-- 8. Tablo yapılarını (kolonları) görmek için
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('Roles', 'Users', 'Projects', 'TaskItems', 'ProjectUsers')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 9. Foreign key ilişkilerini görmek için
SELECT 
    fk.name AS ForeignKeyName,
    OBJECT_NAME(fk.parent_object_id) AS TableName,
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS ColumnName,
    OBJECT_NAME(fk.referenced_object_id) AS ReferencedTableName,
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS ReferencedColumnName
FROM sys.foreign_keys AS fk
INNER JOIN sys.foreign_key_columns AS fc ON fk.object_id = fc.constraint_object_id
WHERE OBJECT_NAME(fk.parent_object_id) IN ('Users', 'Projects', 'TaskItems', 'ProjectUsers')
ORDER BY TableName;

