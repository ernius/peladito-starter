# Version: 1.0
# Date: 03/09/2026

# Data Model

## 3. Data Models

The system relies on a relational schema to guarantee data consistency (`ACID` compliance) for multi-location financial and inventory tracking.

### `warehouses` Table

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique warehouse identifier |
| `code` | VARCHAR(10) | UNIQUE, NOT NULL | Short code (e.g., WH-EAST, WH-WEST) |
| `name` | VARCHAR(100) | NOT NULL | Name of the facility |
| `is_active` | BOOLEAN | DEFAULT TRUE | Operational status of the warehouse |

### `products` Table

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique product identifier |
| `sku` | VARCHAR(50) | UNIQUE, NOT NULL | Stock Keeping Unit code |
| `name` | VARCHAR(255) | NOT NULL | Display name of the product |
| `price` | DECIMAL(10,2) | NOT NULL | Current retail price |

### `stock_levels` Table

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `product_id` | UUID | FOREIGN KEY | References `products.id` |
| `warehouse_id`| UUID | FOREIGN KEY | References `warehouses.id` |
| `quantity` | INT | NOT NULL, >= 0 | Available units at *this specific warehouse* |
| `updated_at` | TIMESTAMP | NOT NULL | Last time this local stock was modified |

*Composite Primary Key: (`product_id`, `warehouse_id`)*

### `inventory_transfers` Table

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique transfer tracking number |
| `from_warehouse_id`| UUID | FOREIGN KEY | Source warehouse (`warehouses.id`) |
| `to_warehouse_id`  | UUID | FOREIGN KEY | Destination warehouse (`warehouses.id`) |
| `status` | VARCHAR(20) | NOT NULL | PENDING, IN_TRANSIT, COMPLETED, REJECTED |
| `created_at` | TIMESTAMP | NOT NULL | Timestamp when transit initiated |
| `updated_at` | TIMESTAMP | NOT NULL | Timestamp of latest lifecycle change |

### `inventory_transfer_items` Table

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique line-item identifier |
| `transfer_id` | UUID | FOREIGN KEY | References `inventory_transfers.id` |
| `product_id` | UUID | FOREIGN KEY | References `products.id` |
| `quantity` | INT | NOT NULL, > 0 | Units to be moved |

