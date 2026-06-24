# Dashboard API

## Purpose

API endpoints for the admin dashboard.

## Endpoints

### Products
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard/products` | List products |
| POST | `/api/dashboard/products` | Create product |
| PATCH | `/api/dashboard/products/:id` | Update product |

### Product Files
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/dashboard/products/:id/files/upload-intent` | Start upload |
| POST | `/api/dashboard/products/:id/files/finalize` | Save metadata |
| DELETE | `/api/dashboard/products/:id/files/:fileId` | Delete file |

### Inventory
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/dashboard/inventory/adjust` | Adjust stock quantity |

### Orders
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard/orders` | List orders |
| POST | `/api/dashboard/orders/confirm` | Confirm order |
| DELETE | `/api/dashboard/orders/delete` | Delete order |

### Users
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/dashboard/users` | List users |
| POST | `/api/dashboard/users` | Create user |
| POST | `/api/dashboard/users/role` | Change role |
| POST | `/api/dashboard/users/deactivate` | Deactivate user |
| POST | `/api/dashboard/users/reactivate` | Reactivate user |
