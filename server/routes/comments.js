import express from 'express';
import { allAsync, getAsync, runAsync } from '../database.js';

const router = express.Router();

// Get all approved comments for a listing
router.get('/listing/:listing_id', async (req, res) => {
  try {
    const comments = await allAsync(
      'SELECT * FROM comments WHERE listing_id = ? AND is_approved = 1 ORDER BY created_at DESC',
      [req.params.listing_id]
    );
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add new comment
router.post('/', async (req, res) => {
  try {
    const { listing_id, author_name, author_email, rating, comment_text } = req.body;

    if (!listing_id || !author_name || !comment_text) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify listing exists
    const listing = await getAsync('SELECT id FROM listings WHERE id = ?', [listing_id]);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const result = await runAsync(
      `INSERT INTO comments (listing_id, author_name, author_email, rating, comment_text, is_approved)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [listing_id, author_name, author_email, rating || null, comment_text]
    );

    res.status(201).json({ 
      id: result.id, 
      message: 'Comment submitted. It will appear after admin approval.' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Delete comment (no auth for now - in production use JWT)
router.delete('/:id', async (req, res) => {
  try {
    const result = await runAsync('DELETE FROM comments WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
