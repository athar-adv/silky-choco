import express from 'express';
import { allAsync, getAsync, runAsync } from '../database.js';

const router = express.Router();

// Get all listings with filtering and search
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, condition, location, sort } = req.query;
    
    let sql = 'SELECT * FROM listings WHERE status = "active"';
    const params = [];

    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (condition) {
      sql += ' AND condition = ?';
      params.push(condition);
    }

    if (location) {
      sql += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    if (minPrice) {
      sql += ' AND price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sql += ' AND price <= ?';
      params.push(parseFloat(maxPrice));
    }

    // Sorting
    if (sort === 'newest') {
      sql += ' ORDER BY created_at DESC';
    } else if (sort === 'oldest') {
      sql += ' ORDER BY created_at ASC';
    } else if (sort === 'price-low') {
      sql += ' ORDER BY price ASC';
    } else if (sort === 'price-high') {
      sql += ' ORDER BY price DESC';
    } else {
      sql += ' ORDER BY created_at DESC';
    }

    const listings = await allAsync(sql, params);
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get single listing by ID
router.get('/:id', async (req, res) => {
  try {
    const listing = await getAsync('SELECT * FROM listings WHERE id = ?', [req.params.id]);
    
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Get comments for this listing
    const comments = await allAsync(
      'SELECT * FROM comments WHERE listing_id = ? AND is_approved = 1 ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json({ ...listing, comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
});

// Create new listing
router.post('/', async (req, res) => {
  try {
    const { title, description, price, condition, category, seller_name, seller_email, seller_phone, location, images } = req.body;

    if (!title || !description || !price || !condition || !category || !seller_name || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await runAsync(
      `INSERT INTO listings (title, description, price, condition, category, seller_name, seller_email, seller_phone, location, images)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, price, condition, category, seller_name, seller_email, seller_phone, location, images]
    );

    res.status(201).json({ id: result.id, message: 'Listing created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Update listing
router.put('/:id', async (req, res) => {
  try {
    const { title, description, price, condition, category, status, seller_name, seller_email, seller_phone, location, images } = req.body;

    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (price !== undefined) { updates.push('price = ?'); params.push(price); }
    if (condition !== undefined) { updates.push('condition = ?'); params.push(condition); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }
    if (seller_name !== undefined) { updates.push('seller_name = ?'); params.push(seller_name); }
    if (seller_email !== undefined) { updates.push('seller_email = ?'); params.push(seller_email); }
    if (seller_phone !== undefined) { updates.push('seller_phone = ?'); params.push(seller_phone); }
    if (location !== undefined) { updates.push('location = ?'); params.push(location); }
    if (images !== undefined) { updates.push('images = ?'); params.push(images); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(req.params.id);

    const sql = `UPDATE listings SET ${updates.join(', ')} WHERE id = ?`;
    const result = await runAsync(sql, params);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ message: 'Listing updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
});

// Delete listing
router.delete('/:id', async (req, res) => {
  try {
    const result = await runAsync('DELETE FROM listings WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const categories = await allAsync('SELECT DISTINCT category FROM listings WHERE status = "active"');
    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
