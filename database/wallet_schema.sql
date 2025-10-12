-- Prime Wallet Schema (MSSQL)
-- Safe create pattern with IF NOT EXISTS checks to avoid conflicts

-- Users and Orders are assumed to already exist

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Wallets')
BEGIN
    CREATE TABLE Wallets (
        wallet_id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        balance DECIMAL(18,2) NOT NULL CONSTRAINT DF_Wallets_Balance DEFAULT (0),
        status VARCHAR(50) NOT NULL CONSTRAINT DF_Wallets_Status DEFAULT ('ACTIVE'),
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Wallets_CreatedAt DEFAULT (SYSUTCDATETIME()),
        updated_at DATETIME2 NOT NULL CONSTRAINT DF_Wallets_UpdatedAt DEFAULT (SYSUTCDATETIME())
        -- FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE -- uncomment when Users table name/PK confirmed
    );
    
    -- Constraints
    ALTER TABLE Wallets WITH CHECK ADD CONSTRAINT CK_Wallets_Balance CHECK (balance >= 0);
    ALTER TABLE Wallets WITH CHECK ADD CONSTRAINT CK_Wallets_Status CHECK (status IN ('ACTIVE','LOCKED','PENDING'));

    CREATE INDEX IX_Wallets_UserStatus ON Wallets(user_id, status);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Wallet_Transactions')
BEGIN
    CREATE TABLE Wallet_Transactions (
        tx_id INT IDENTITY(1,1) PRIMARY KEY,
        wallet_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        amount DECIMAL(18,2) NOT NULL,
        status VARCHAR(50) NOT NULL CONSTRAINT DF_WalletTx_Status DEFAULT ('PENDING'),
        description VARCHAR(255) NULL,
        ref_code VARBINARY(MAX) NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_WalletTx_CreatedAt DEFAULT (SYSUTCDATETIME())
        -- FOREIGN KEY (wallet_id) REFERENCES Wallets(wallet_id) ON DELETE CASCADE
    );

    ALTER TABLE Wallet_Transactions WITH CHECK ADD CONSTRAINT CK_WalletTx_Type CHECK (type IN ('TOPUP','PAYMENT','WITHDRAWAL','POINTS_EARNED'));
    ALTER TABLE Wallet_Transactions WITH CHECK ADD CONSTRAINT CK_WalletTx_Amount CHECK (amount >= 0);
    ALTER TABLE Wallet_Transactions WITH CHECK ADD CONSTRAINT CK_WalletTx_Status CHECK (status IN ('PENDING','SUCCESS','FAILED'));

    CREATE INDEX IX_Wallet_Transactions_TypeDate ON Wallet_Transactions(type, created_at DESC);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Points')
BEGIN
    CREATE TABLE Points (
        point_id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        points DECIMAL(18,2) NOT NULL,
        earned_from_tx_id INT NULL,
        expire_date DATETIME2 NOT NULL,
        created_at DATETIME2 NOT NULL CONSTRAINT DF_Points_CreatedAt DEFAULT (SYSUTCDATETIME())
        -- FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
        -- FOREIGN KEY (earned_from_tx_id) REFERENCES Wallet_Transactions(tx_id)
    );

    ALTER TABLE Points WITH CHECK ADD CONSTRAINT CK_Points_NonNegative CHECK (points >= 0);
    CREATE INDEX IX_Points_UserExpire ON Points(user_id, expire_date);
END
GO

-- NOTE: Existing domain already has a table named `vouchers`. To avoid conflict,
-- create loyalty vouchers for point redemption in a separate table.
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LoyaltyVouchers')
BEGIN
    CREATE TABLE LoyaltyVouchers (
        voucher_id INT IDENTITY(1,1) PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        discount DECIMAL(18,2) NOT NULL,
        cost_points INT NOT NULL,
        stock INT NOT NULL CONSTRAINT DF_LoyaltyVouchers_Stock DEFAULT (100),
        created_at DATETIME2 NOT NULL CONSTRAINT DF_LoyaltyVouchers_CreatedAt DEFAULT (SYSUTCDATETIME())
    );

    ALTER TABLE LoyaltyVouchers WITH CHECK ADD CONSTRAINT CK_LoyaltyVouchers_CostPoints CHECK (cost_points > 0);
    ALTER TABLE LoyaltyVouchers WITH CHECK ADD CONSTRAINT CK_LoyaltyVouchers_Stock CHECK (stock >= 0);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Redeems')
BEGIN
    CREATE TABLE Redeems (
        redeem_id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        voucher_id INT NOT NULL,
        redeemed_at DATETIME2 NOT NULL CONSTRAINT DF_Redeems_RedeemedAt DEFAULT (SYSUTCDATETIME())
        -- FOREIGN KEY (user_id) REFERENCES Users(user_id),
        -- FOREIGN KEY (voucher_id) REFERENCES LoyaltyVouchers(voucher_id)
    );
END
GO

-- Audit trigger: requires Audit_Log table. Guarded to avoid creation errors if not present.
IF OBJECT_ID('TR_Wallet_Update', 'TR') IS NULL
    AND EXISTS (SELECT * FROM sys.tables WHERE name = 'Wallets')
BEGIN
    EXEC('CREATE TRIGGER TR_Wallet_Update ON Wallets AFTER UPDATE AS
    BEGIN
        SET NOCOUNT ON;
        IF OBJECT_ID(''Audit_Log'') IS NOT NULL
        BEGIN
            INSERT INTO Audit_Log (table_name, action, user_id, old_balance, new_balance, updated_at)
            SELECT ''Wallets'', ''UPDATE'', i.user_id, d.balance, i.balance, SYSUTCDATETIME()
            FROM inserted i
            INNER JOIN deleted d ON i.wallet_id = d.wallet_id;
        END
    END');
END
GO



