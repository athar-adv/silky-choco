import express from 'express';
import { allAsync, getAsync, runAsync } from '../database.js';

const router = express.Router();

// Get all listings (including inactive ones)
router.get('/listings', async (req, res) => {
  try {
    const listings = await allAsync('SELECT * FROM listings ORDER BY created_at DESC');
    res.json(listings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

// Get pending comments for approval
router.get('/comments/pending', async (req, res) => {
  try {
    const comments = await allAsync(
      'SELECT comments.*, listings.title FROM comments JOIN listings ON comments.listing_id = listings.id WHERE comments.is_approved = 0 ORDER BY comments.created_at DESC'
    );
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pending comments' });
  }
});

// Get all approved comments
router.get('/comments/approved', async (req, res) => {
  try {
    const comments = await allAsync(
      'SELECT comments.*, listings.title FROM comments JOIN listings ON comments.listing_id = listings.id WHERE comments.is_approved = 1 ORDER BY comments.created_at DESC'
    );
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch approved comments' });
  }
});

// Approve comment
router.patch('/comments/:id/approve', async (req, res) => {
  try {
    const result = await runAsync('UPDATE comments SET is_approved = 1 WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ message: 'Comment approved' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to approve comment' });
  }
});

// Reject/delete comment
router.delete('/comments/:id', async (req, res) => {
  try {
    const result = await runAsync('DELETE FROM comments WHERE id = ?', [req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// Toggle listing status (active/inactive)
router.patch('/listings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'inactive', 'sold'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await runAsync('UPDATE listings SET status = ? WHERE id = ?', [status, req.params.id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ message: `Listing marked as ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update listing status' });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const totalListings = await getAsync('SELECT COUNT(*) as count FROM listings');
    const activeListings = await getAsync('SELECT COUNT(*) as count FROM listings WHERE status = "active"');
    const totalComments = await getAsync('SELECT COUNT(*) as count FROM comments');
    const pendingComments = await getAsync('SELECT COUNT(*) as count FROM comments WHERE is_approved = 0');

    res.json({
      totalListings: totalListings.count,
      activeListings: activeListings.count,
      totalComments: totalComments.count,
      pendingComments: pendingComments.count
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

export default router;
