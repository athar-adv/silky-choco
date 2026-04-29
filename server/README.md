# Bike Marketplace Server

Node.js/Express backend for the bike marketplace with SQLite database.

## Setup

1. **Install dependencies** (from root directory):
```bash
npm install
```

2. **Create environment file** (copy from example):
```bash
copy .env.example .env
```

3. **Start the server**:
```bash
npm run server
```

Or for development with auto-reload:
```bash
npm run server:dev
```

To run Astro frontend + server together:
```bash
npm run dev:full
```

## Database

SQLite database is automatically created at `server/marketplace.db` on first run.

### Tables:
- **listings**: Bike listings with details
- **comments**: Reviews/comments on listings
- **users**: User accounts (for future auth)
- **favorites**: User favorites

## API Endpoints

### Listings (`/api/listings`)

**GET /api/listings**
- Get all active listings with filters
- Query params:
  - `search`: Search title/description
  - `category`: Filter by category
  - `condition`: Filter by condition (e.g., "excellent", "good", "fair", "poor")
  - `location`: Filter by location
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
  - `sort`: "newest", "oldest", "price-low", "price-high"

Example: `GET /api/listings?category=mountain&sort=price-low&maxPrice=5000000`

**GET /api/listings/:id**
- Get single listing with comments

**POST /api/listings**
- Create new listing
- Body:
```json
{
  "title": "Mountain Bike",
  "description": "Great condition...",
  "price": 3500000,
  "condition": "excellent",
  "category": "mountain",
  "seller_name": "John Doe",
  "seller_email": "john@example.com",
  "seller_phone": "08xxx",
  "location": "Jakarta",
  "images": "url1,url2,url3"
}
```

**PUT /api/listings/:id**
- Update listing (any field)

**DELETE /api/listings/:id**
- Delete listing

**GET /api/listings/categories/all**
- Get all categories

### Comments (`/api/comments`)

**GET /api/comments/listing/:listing_id**
- Get approved comments for a listing

**POST /api/comments**
- Add comment (requires admin approval)
- Body:
```json
{
  "listing_id": 1,
  "author_name": "Jane",
  "author_email": "jane@example.com",
  "rating": 5,
  "comment_text": "Great bike!"
}
```

**DELETE /api/comments/:id**
- Delete comment

### Admin (`/api/admin`)

**GET /api/admin/listings**
- Get all listings (including inactive)

**GET /api/admin/comments/pending**
- Get comments awaiting approval

**GET /api/admin/comments/approved**
- Get approved comments

**PATCH /api/admin/comments/:id/approve**
- Approve a pending comment

**DELETE /api/admin/comments/:id**
- Reject/delete comment

**PATCH /api/admin/listings/:id/status**
- Change listing status
- Body: `{ "status": "active|inactive|sold" }`

**GET /api/admin/stats**
- Get dashboard statistics

## Frontend Integration (Astro)

Example fetch calls in Astro components:

```javascript
// Get listings
const response = await fetch('http://localhost:5000/api/listings?category=mountain');
const listings = await response.json();

// Create listing
fetch('http://localhost:5000/api/listings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(listing)
});

// Add comment
fetch('http://localhost:5000/api/comments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(comment)
});
```

## Future Enhancements

- [ ] JWT authentication
- [ ] Password hashing for users
- [ ] Image upload handling
- [ ] Messaging system between users
- [ ] Advanced search with aggregations
- [ ] Rate limiting
- [ ] Database backups
- [ ] Email notifications
